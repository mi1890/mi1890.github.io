## GameCreator2 Traversal 扩展库详细分析

我已经详细review了这个Traversal扩展库，现在为您讲解其实现原理和关键代码逻辑。

### 📋 **系统概览**

Traversal是GameCreator2的一个核心扩展库，专门用于实现**角色穿越系统**，包括：
- 🧗 **攀爬** (Climb)
- 🏃 **跳跃/翻越** (Vault/Mantle)
- 🎯 **滑行** (Slide)
- 🛡️ **掩体** (Cover)
- 🪢 **绳索/滑索** (Rope/Zipline)

---

### 🏗️ **核心架构设计**

系统采用**三层架构**：

```
┌─────────────────────────────────────────┐
│  Traverse (抽象基类)                     │
│  - 定义通用接口和生命周期                 │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐ ┌─────▼────────┐
│ TraverseLink│ │TraverseInter-│
│  (一次性)    │ │active (持续) │
└──────┬──────┘ └──────┬───────┘
       │               │
┌──────▼──────┐ ┌─────▼────────┐
│ MotionLink  │ │MotionInter-  │
│ (动作执行)  │ │active (运动) │
└─────────────┘ └──────────────┘
```

---

### 🎯 **核心组件详解**

#### **1. Traverse (抽象基类)**
**位置**: Traverse.cs

**职责**：
- 管理角色进入/退出状态
- 处理碰撞忽略
- 管理父级关系（用于移动平台）
- 提供跳跃和取消功能

**关键代码逻辑**：

```csharp
// 核心切换逻辑
public static async Task ChangeTo(Traverse prevTraverse, Traverse nextTraverse, 
                                   Character character, bool skipTransition)
{
    Vector3 currentPosition = nextTraverse.Motion.CharacterPosition(character);
    
    switch (nextTraverse)
    {
        case TraverseLink traverseLink:
            // 一次性穿越（如跳跃、翻越）
            await traverseLink.Run(character);
            break;
        
        case TraverseInteractive traverseInteractive:
            // 持续交互穿越（如攀爬墙壁）
            // 计算过渡动画
            AnimationClip exitAnimation = prevTraverse?.Motion.GetExitAnimation(...);
            InteractiveTransitionData transition = new InteractiveTransitionData(exitAnimation);
            await traverseInteractive.Enter(character, transition);
            break;
    }
}
```

**进入/退出生命周期**：

```csharp
protected void OnEnter(Character character, Args args)
{
    character.Driver.ForceGrounded(this.m_ForceGrounded);  // 强制地面状态
    character.Busy.MakeLegsBusy();                         // 锁定腿部动作
    _ = this.m_OnEnter.Run(args);                          // 执行进入指令
    
    // 设置父级（用于移动平台）
    if (this.m_ParentTo != null)
    {
        stance.Parent = character.transform.parent;
        character.transform.SetParent(this.m_ParentTo, true);
    }
    
    this.m_CharactersUsing.Add(character);
    this.EventCharacterEnter?.Invoke();
}

protected void OnExit(Character character, Args args)
{
    character.Driver.ForceGrounded(false);
    character.Busy.RemoveLegsBusy();
    
    // 恢复原父级
    if (this.m_ParentTo != null)
    {
        stance = character.Combat.RequestStance<TraversalStance>();
        character.transform.SetParent(stance.Parent, true);
    }
    
    _ = this.m_OnExit.Run(args);
    this.EventCharacterExit?.Invoke();
}
```

---

#### **2. TraverseLink (一次性穿越)**
**位置**: TraverseLink.cs

**用途**: 实现**一次性、非交互式**的穿越动作，如：
- 跳跃到对面
- 翻越障碍物
- 滑下斜坡

**核心执行流程**：

```csharp
public async Task Run(Character character)
{
    if (character == null || this.m_Motion == null) return;

    Args args = new Args(this.gameObject, character.gameObject);
    
    // 1. 请求Traversal姿态
    TraversalStance traversal = character.Combat.RequestStance<TraversalStance>();
    if (traversal.Traverse == this) return;  // 防止重复执行
    
    // 2. 获取Token（用于取消控制）
    TraversalToken token = await traversal.OnTraverseEnter(this);
    
    // 3. 忽略碰撞
    this.RefreshCollisions(character, true);
    this.OnEnter(character, args);
    
    // 4. 执行动作（核心！）
    bool canFollowThrough = await this.m_Motion.Run(character, args, token);
    
    // 5. 清理
    if (character != null)
    {
        traversal.OnTraverseExit(this, token);
        this.RefreshCollisions(character, false);
    }
    this.OnExit(character, args);
    
    // 6. 链式穿越（如果设置了后续动作）
    if (canFollowThrough && this.m_ContinueTo != null)
    {
        _ = ChangeTo(this, this.m_ContinueTo, character, false);
    }
}
```

**关键类型支持**：
- `TraverseLinkTypePointToPoint`: 点到点（跳跃）
- `TraverseLinkTypeSlideOnLine`: 线性滑动（滑索）
- `TraverseLinkTypeSlideOnSurface`: 表面滑动
- `TraverseLinkTypeWarpToTarget`: 传送到目标

---

#### **3. TraverseInteractive (持续交互穿越)**
**位置**: TraverseInteractive.cs

**用途**: 实现**可交互、持续性**的穿越，如：
- 攀爬墙壁（可左右移动）
- 挂在边缘（可横向移动）
- 猴栏（可来回摆动）

**核心特性**：
- **边界控制**: `PositionA`和`PositionB`定义可移动范围
- **宽度**: `Width`定义横向可移动范围
- **旋转模式**: 控制角色朝向
  - `None`: 不改变
  - `Path`: 跟随路径
  - `Fixed`: 固定角度

**执行流程**：

```csharp
public async Task Enter(Character character, InteractiveTransitionData transition)
{
    if (character == null || this.m_Motion == null) return;
    
    TraversalStance traversal = character.Combat.RequestStance<TraversalStance>();
    Args args = new Args(this.gameObject, character.gameObject);
    TraversalToken token = await traversal.OnTraverseEnter(this);
    
    this.RefreshCollisions(character, true);
    this.OnEnter(character, args);
    
    // 核心：进入持续更新循环
    await this.MotionInteractive.Enter(this, character, args, transition, token);
    
    // 清理
    if (character != null)
    {
        traversal.OnTraverseExit(this, token);
        this.RefreshCollisions(character, false);
    }
    this.OnExit(character, args);
}
```

**连接系统**：
```csharp
// 可以设置多个连接点
[SerializeField] private List<Connection> m_Connections;

// 检查是否可以连接到其他Traverse
public bool IsCandidateConnection(Character character, Traverse traverse)
{
    foreach (Connection candidate in this.m_Connections)
    {
        if (candidate?.Traverse != traverse) continue;
        if (candidate.Traverse.Motion.CanUse(args))
        {
            Vector3 candidatePosition = candidate.Traverse.CalculateStartPosition(character);
            float distance = Vector3.Distance(character.transform.position, candidatePosition);
            
            if (distance <= candidate.MaxDistance)
            {
                return true;  // 可以连接！
            }
        }
    }
    return false;
}
```

---

### ⚙️ **运动系统 (Motion System)**

#### **4. MotionLink (一次性运动)**
**位置**: MotionLink.cs

**两种模式**：

##### **模式1: AnimationClip（简单模式）**
```csharp
case Mode.AnimationClip:
    // 1. 播放动画
    ConfigGesture gestureConfig = new ConfigGesture(
        0f, this.m_AnimationClip.length, speed, true,
        this.TransitionIn, this.TransitionOut
    );
    _ = character.Gestures.CrossFade(this.m_AnimationClip, this.m_Mask, 
                                      BlendMode.Blend, gestureConfig, true);
    
    // 2. 执行动画序列（等待完成）
    await this.m_AnimationSequence.Run(...);
    break;
```

##### **模式2: AnimationState（精确控制模式）**
```csharp
case Mode.AnimationState:
    // 设置动画状态
    ConfigState stateConfig = new ConfigState(...);
    _ = character.States.SetState(this.m_AnimationState, stateLayer, ...);
    
    // 执行状态序列（带位置插值）
    await this.StateSequence(character, cancel, args);
    break;
```

**StateSequence核心算法**（点到点插值）：

```csharp
private async Task StateSequence(Character character, ICancellable cancel, Args args)
{
    // 1. 获取起点和终点
    TraverseLinkData traverseData = traverseLink.Type.ToTraverseLinkData(...);
    Vector3 positionA = traverseLink.Transform.TransformPoint(traverseData.positionA);
    Vector3 positionB = traverseLink.Transform.TransformPoint(traverseData.positionB);
    Quaternion rotationA = traverseLink.Transform.rotation * traverseData.rotationA;
    Quaternion rotationB = traverseLink.Transform.rotation * traverseData.rotationB;
    
    // 2. 计算时长
    float moveSpeed = (float)this.m_MovementSpeed.Get(args);
    float durationTransition = this.m_TransitionTime;  // 过渡时间
    float durationMovement = Vector3.Distance(positionA, positionB) / moveSpeed;
    
    // 3. 过渡阶段（从当前位置到起点）
    float startTime = character.Time.Time;
    while (startTime + durationTransition > character.Time.Time)
    {
        float t = (character.Time.Time - startTime) / durationTransition;
        float ratio = Easing.GetEase(this.m_TransitionEase, 0f, 1f, t);
        
        Vector3 nextPosition = Vector3.Lerp(characterStartPosition, positionA, ratio);
        Quaternion nextRotation = Quaternion.Lerp(characterStartRotation, rotationA, ratio);
        
        // 应用位置
        character.Driver.AddPosition(nextPosition - currentCharacterPosition);
        character.Driver.SetRotation(nextRotation);
        await Task.Yield();
    }
    
    // 4. 移动阶段（从A到B，带抛物线）
    startTime = character.Time.Time;
    while (startTime + durationMovement > character.Time.Time)
    {
        float t = (character.Time.Time - startTime) / durationMovement;
        float ratio = Easing.GetEase(this.m_MovementEase, 0f, 1f, t);
        
        // 抛物线Lift效果
        float ratioLift = Easing.GetEase(this.m_LiftEase, 0f, 1f, t);
        Vector3 normalLift = new Vector3(0f, -4f*ratioLift*ratioLift + 4f*ratioLift, 0f);
        
        Vector3 nextPosition = Vector3.Lerp(positionA, positionB, ratio) 
                             + normalLift * this.m_Lift;
        
        character.Driver.AddPosition(nextPosition - currentCharacterPosition);
        await Task.Yield();
    }
}
```

---

#### **5. MotionInteractive (持续运动)**
**位置**: MotionInteractive.cs

**核心更新循环**：

```csharp
private async Task<Traverse> OnUpdate(Character character, ...)
{
    TraverseInteractive traverseInteractive = args.Self.Get<TraverseInteractive>();
    TraversalStance stance = character.Combat.RequestStance<TraversalStance>();
    
    // 1. 计算起始位置
    Vector3 characterStartPosition = traverseInteractive.CalculateStartPosition(character);
    stance.RelativePosition = traverseInteractive.Transform.InverseTransformPoint(characterStartPosition);
    
    // 2. 过渡到起始位置（如果需要）
    if (distance > MIN_DISTANCE_TRANSITION)
    {
        await this.OnTransition(enterAnimation, character, ...);
    }
    stance.InInteractiveTransition = false;
    
    // 3. 主循环（持续更新）
    while (!cancel.IsCancelled)
    {
        // 获取输入
        Vector3 traverseLocalInput = this.m_InputDirection.Get(args);
        
        // 输入映射（Swizzle）
        Vector3 swizzleLocalInput = stance.AllowMovement
            ? new Vector3(
                GetInput(this.m_InputX, traverseLocalInput),  // X轴映射
                GetInput(this.m_InputY, traverseLocalInput),  // Y轴映射
                GetInput(this.m_InputZ, traverseLocalInput)   // Z轴映射
            ) : Vector3.zero;
        
        // 计算下一帧位置
        Vector3 currentLocalPosition = stance.RelativePosition;
        Vector3 nextLocalPosition = currentLocalPosition + 
            swizzleLocalInput * (deltaTime * character.Motion.LinearSpeed);
        
        // 边界检测
        if (traverseInteractive.PushingOutA(currentLocalPosition, swizzleLocalInput))
        {
            if (traverseInteractive.ExitOnEdgeA) return null;        // 退出
            if (traverseInteractive.ContinueA != null) 
                return traverseInteractive.ContinueA;                // 切换到下一个
        }
        
        // 限制在边界内
        nextLocalPosition = traverseInteractive.ClampInBounds(nextLocalPosition);
        stance.RelativePosition = nextLocalPosition;
        
        // 应用位置（转换到世界空间）
        character.Driver.SetPosition(
            traverseInteractive.Transform.TransformPoint(nextLocalPosition) + anchorOffset
        );
        
        // 应用旋转
        if (this.GetRotation(traverseInteractive, ...))
        {
            character.Driver.SetRotation(nextRotation);
        }
        
        await Task.Yield();
    }
}
```

**输入映射系统**：
```csharp
private enum InputMap
{
    None,              // 不映射
    X,                 // 映射到X
    Y,                 // 映射到Y
    Z,                 // 映射到Z
    NegativeX,         // 反向X
    NegativeY,         // 反向Y
    NegativeZ,         // 反向Z
    AlwaysForward,     // 总是前进
    AlwaysBackward,    // 总是后退
}

// 使用示例：
// 如果设置 m_InputX = InputMap.Z，那么玩家前后输入会控制横向移动
```

---

### 🎭 **姿态系统 (Stance System)**

#### **6. TraversalStance**
**位置**: TraversalStance.cs

**职责**：管理角色的穿越状态

```csharp
public class TraversalStance : TStance
{
    // 当前穿越对象
    [field: NonSerialized] public Traverse Traverse { get; private set; }
    
    // 相对位置（局部坐标系）
    [field: NonSerialized] internal Vector3 RelativePosition { get; set; }
    
    // 是否在过渡中
    [field: NonSerialized] internal bool InInteractiveTransition { get; set; }
    
    // 是否允许移动
    [field: NonSerialized] internal bool AllowMovement { get; set; }
    
    // 取消当前穿越
    public bool ForceCancel()
    {
        if (this.m_CurrentToken?.IsCancelled == false)
        {
            this.m_CurrentToken.IsCancelled = true;
            this.Character.Gestures.Stop(0f, transitionOut);
            return true;
        }
        return false;
    }
    
    // 尝试跳跃
    public void TryJump()
    {
        if (this.Traverse != null && !this.InInteractiveTransition)
        {
            this.Traverse.AttemptJump(this.Character);
        }
    }
}
```

---

### 🎬 **动作系统 (Actions System)**

#### **7. MotionActions**
**位置**: MotionActions.cs

**功能**：定义穿越过程中可执行的额外动作

```csharp
public class MotionActions : ScriptableObject
{
    // 是否可以取消
    [SerializeField] private PropertyGetBool m_CanCancel;
    
    // 是否可以跳跃
    [SerializeField] private PropertyGetBool m_CanJump;
    
    // 跳跃参数
    [SerializeField] private EnablerFloat m_CustomJumpForce;
    [SerializeField] private bool m_DashOnJump;  // 跳跃时冲刺
    [SerializeField] private Vector3 m_DashLocalDirection;
    [SerializeField] private float m_DashSpeed;
    
    // 自定义动作列表
    [SerializeField] private MotionActionsList m_ActionsList;
    
    // 自定义状态列表
    [SerializeField] private MotionStateList m_StateList;
    
    // 执行跳跃
    internal async Task AttemptJump(Traverse traverse, Character character)
    {
        // 取消当前穿越
        character.Combat.RequestStance<TraversalStance>().ForceCancel();
        await Task.Yield();
        
        // 执行冲刺
        if (this.m_DashOnJump)
        {
            Vector3 dashDirection = traverse.transform.TransformDirection(
                this.m_DashLocalDirection
            );
            _ = character.Dash.Execute(dashDirection, this.m_DashSpeed, ...);
        }
        
        // 执行跳跃
        float jumpForce = this.m_CustomJumpForce.IsEnabled
            ? this.m_CustomJumpForce.Value
            : character.Motion.JumpForce;
        character.Motion.ForceJump(jumpForce);
    }
}
```

---

### 🪢 **特殊工具组件**

#### **8. Rope (绳索物理)**
**位置**: Rope.cs

**阶段式执行**：
```csharp
private enum Phase
{
    None,          // 无
    Anticipating,  // 预备
    Throwing,      // 投掷
    Tensioning,    // 拉紧
    Reeling,       // 收回
}
```

**物理模拟**：
- 使用LineRenderer绘制绳索
- 分段模拟（Segments）
- 支持重力和张力
- 抛物线投掷轨迹

#### **9. Zipline (滑索)**
**位置**: Zipline.cs

**简单实现**：
```csharp
private void Update()
{
    // 更新两个端点位置
    Vector3 pointA = this.m_TraverseLink.transform.TransformPoint(
        this.m_TraverseLink.Type.LocalPointA
    );
    Vector3 pointB = this.m_TraverseLink.transform.TransformPoint(
        this.m_TraverseLink.Type.LocalPointB
    );
    
    // 更新LineRenderer
    this.Points[0] = pointA;
    this.Points[1] = pointB;
    this.m_LineRenderer.SetPositions(this.Points);
}
```

---

### 🎨 **动画状态管理**

#### **10. StateTraverseBase**
**位置**: StateTraverseBase.cs

**动画映射**：
```csharp
public abstract class StateTraverseBase : StateOverrideAnimator
{
    [SerializeField] private AnimationClip m_Idle;           // 待机
    [SerializeField] private AnimationClip m_MoveForward;    // 前移
    [SerializeField] private AnimationClip m_MoveBackward;   // 后移
    [SerializeField] private AnimationClip m_MoveRight;      // 右移
    [SerializeField] private AnimationClip m_MoveLeft;       // 左移
    [SerializeField] private AnimationClip m_MoveForwardRight;  // 右前
    [SerializeField] private AnimationClip m_MoveForwardLeft;   // 左前
    [SerializeField] private AnimationClip m_MoveBackwardRight; // 右后
    [SerializeField] private AnimationClip m_MoveBackwardLeft;  // 左后
    
    [SerializeField] private AnimationClip m_EdgeForward;    // 前边缘
    [SerializeField] private AnimationClip m_EdgeBackward;   // 后边缘
    [SerializeField] private AnimationClip m_EdgeRight;      // 右边缘
    [SerializeField] private AnimationClip m_EdgeLeft;       // 左边缘
    
    // 序列化到Animator Controller
    protected override void BeforeSerialize()
    {
        this.m_Controller["Traverse@Idle"] = this.m_Idle;
        this.m_Controller["Traverse@Move_F"] = this.m_MoveForward;
        // ... 其他映射
    }
}
```

---

### 🔄 **完整执行流程示例**

#### **场景1: 翻越障碍物 (TraverseLink)**

```
1. 玩家靠近障碍物
2. 触发 InstructionTraversalRunTraverseLink
3. TraverseLink.Run() 被调用
   ├─ 请求 TraversalStance
   ├─ 获取 TraversalToken
   ├─ OnEnter (锁定腿部，设置父级)
   ├─ MotionLink.Run()
   │  ├─ 播放动画Clip或State
   │  ├─ StateSequence (位置插值)
   │  │  ├─ 过渡到起点A
   │  │  └─ 移动到终点B（带抛物线）
   │  └─ 等待完成
   ├─ OnExit (解锁，恢复父级)
   └─ 如果有 m_ContinueTo，继续下一个穿越
```

#### **场景2: 攀爬墙壁 (TraverseInteractive)**

```
1. 玩家靠近墙壁
2. 触发 InstructionTraversalEnterTraverseInteractive
3. TraverseInteractive.Enter() 被调用
   ├─ 请求 TraversalStance
   ├─ OnEnter (锁定腿部)
   ├─ MotionInteractive.Enter()
   │  ├─ 计算起始位置
   │  ├─ OnTransition (过渡动画)
   │  └─ OnUpdate (主循环)
   │     ├─ 每帧执行：
   │     │  ├─ 读取玩家输入
   │     │  ├─ 输入映射 (Swizzle)
   │     │  ├─ 计算局部位置
   │     │  ├─ 边界检测
   │     │  ├─ 转换到世界坐标
   │     │  ├─ 应用旋转
   │     │  └─ 检测连接点
   │     └─ 直到：
   │        ├─ 玩家取消 (按跳跃键)
   │        ├─ 到达边缘并退出
   │        └─ 切换到下一个Traverse
   └─ OnExit (解锁)
```

#### **场景3: 攀爬时跳跃离开**

```
1. 角色正在攀爬 (TraverseInteractive + MotionInteractive循环中)
2. 玩家按下跳跃键
3. TraversalStance.TryJump()
   ├─ 检查 !InInteractiveTransition
   └─ Traverse.AttemptJump()
      └─ MotionActions.AttemptJump()
         ├─ TraversalStance.ForceCancel()
         │  └─ 设置 Token.IsCancelled = true
         ├─ MotionInteractive循环检测到取消，退出
         ├─ 执行 Dash (如果配置)
         └─ 执行 ForceJump
```

---

### 💡 **核心设计亮点**

#### **1. Token取消机制**
```csharp
public class TraversalToken : ICancellable
{
    [field: NonSerialized] public bool IsCancelled { get; set; }
}
```
- 优雅地中断异步操作
- 支持在任何时候取消穿越
- 自动清理资源

#### **2. 局部坐标系统**
```csharp
// 存储相对位置（不受Transform移动影响）
stance.RelativePosition = traverseInteractive.Transform.InverseTransformPoint(worldPos);

// 转换回世界坐标
Vector3 worldPos = traverseInteractive.Transform.TransformPoint(stance.RelativePosition);
```
- 支持**移动平台**
- 父级关系自动处理

#### **3. 输入重映射（Swizzle）**
```csharp
Vector3 swizzleInput = new Vector3(
    GetInput(this.m_InputX, input),  // 可以是Z、-Z、AlwaysForward等
    GetInput(this.m_InputY, input),
    GetInput(this.m_InputZ, input)
);
```
- 灵活适配不同穿越类型
- 例如：横向墙壁攀爬时，前后输入控制上下移动

#### **4. 边界和连接系统**
```csharp
// 边界定义
[SerializeField] private float m_PositionA = -2f;
[SerializeField] private float m_PositionB = 2f;

// 连接点
[SerializeField] private List<Connection> m_Connections;

// 自动切换
if (traverseInteractive.PushingOutB(...))
{
    if (traverseInteractive.ContinueB != null)
        return traverseInteractive.ContinueB;  // 无缝切换！
}
```

#### **5. 动画过渡管理**
```csharp
// 进入过渡
AnimationClip enterAnimation = this.m_EnterAnimations.Get(direction, rotation);

// 退出过渡
AnimationClip exitAnimation = prevTraverse.Motion.GetExitAnimation(direction, rotation);

// 过渡数据
InteractiveTransitionData transition = new InteractiveTransitionData(exitAnimation);
```

---

### 📊 **性能优化**

#### **1. 条件缓存**
```csharp
#if UNITY_EDITOR
    // 编辑器：每次遍历
    foreach (var action in m_Actions) { ... }
#else
    // 运行时：使用字典
    this.RequireMap();
    return this.m_ActionsMap.GetValueOrDefault(actionId);
#endif
```

#### **2. 懒加载**
```csharp
private void RequireMap()
{
    if (this.m_ActionsMap != null) return;  // 已初始化
    
    this.m_ActionsMap = new Dictionary<IdString, MotionActionsItem>();
    foreach (var action in this.m_Actions)
    {
        this.m_ActionsMap[action.Id] = action;
    }
}
```

#### **3. Native数组**
```csharp
// Rope组件使用Native数组加速绘制
[NonSerialized] private NativeArray<Vector3> m_DrawPoints;
```

---

### 🛠️ **使用示例**

#### **Visual Scripting使用**

```csharp
// 执行翻越
new InstructionTraversalRunTraverseLink()
{
    m_Character = GetGameObjectPlayer.Create(),
    m_TraverseLink = GetGameObjectInstance.Create(vaultObject),
    m_WaitUntilFinish = true
};

// 进入攀爬
new InstructionTraversalEnterTraverseInteractive()
{
    m_Character = GetGameObjectPlayer.Create(),
    m_TraverseInteractive = GetGameObjectInstance.Create(climbWall),
    m_WaitUntilFinish = true
};

// 跳跃离开
new InstructionTraversalMotionActionJump()
{
    m_Character = GetGameObjectPlayer.Create()
};
```

---

### 📝 **总结**

这个Traversal系统的设计非常**模块化**和**可扩展**：

✅ **优点**：
1. **清晰的职责分离**：Traverse控制生命周期，Motion控制执行逻辑
2. **灵活的输入映射**：适配各种穿越场景
3. **强大的连接系统**：支持复杂的穿越链
4. **优雅的取消机制**：Token模式
5. **完善的动画支持**：Clip和State两种模式
6. **物理平台支持**：自动父级管理

🎯 **关键技术**：
- 异步编程（async/await）
- 局部坐标系统
- 状态机模式
- 策略模式（TraverseLinkType）
- 观察者模式（Events）

这个系统可以实现类似《刺客信条》、《神秘海域》等游戏的攀爬穿越效果！