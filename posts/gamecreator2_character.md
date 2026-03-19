---
title: "gamecreator2 框架 character review"
date: "2025-10-20"
tags: ["Unity", "GameCreator", "Network","GameCreator"]
excerpt: "GameCreator 是一个功能丰富的unity框架。"
---    
# Game Creator 角色系统详细代码审查

## 📋 目录
1. [系统架构概览](#系统架构概览)
2. [核心组件详解](#核心组件详解)
3. [系统单元分析](#系统单元分析)
4. [功能特性详解](#功能特性详解)
5. [关键代码设计模式](#关键代码设计模式)
6. [性能优化要点](#性能优化要点)
7. [扩展性分析](#扩展性分析)

---

## 系统架构概览

### 整体设计理念
Game Creator 的角色系统采用**模块化、组件化**的设计架构，将角色的各个功能拆分为独立的系统和特性模块。

### 核心架构图
```
Character (MonoBehaviour)
├── CharacterKernel (系统内核)
│   ├── UnitPlayer (玩家输入控制)
│   ├── UnitMotion (运动系统)
│   ├── UnitDriver (驱动器 - Controller/Rigidbody/NavMesh)
│   ├── UnitFacing (朝向控制)
│   └── UnitAnimim (动画系统)
│
├── AnimimGraph (动画图系统)
│   ├── States (状态机)
│   ├── Gestures (手势/动作)
│   └── Phases (动画阶段)
│
├── InverseKinematics (IK系统)
│   └── RigLayers (IK装配层)
│
├── Features (功能模块)
│   ├── Interaction (交互系统)
│   ├── Ragdoll (布娃娃物理)
│   ├── Props (道具附加系统)
│   ├── Combat (战斗系统)
│   ├── Jump (跳跃)
│   ├── Dash (冲刺)
│   └── Footsteps (脚步音效)
│
└── Properties (属性访问器)
```

---

## 核心组件详解

### 1. Character.cs - 角色核心组件

#### 关键设计特点
```csharp
[SelectionBase]
[DisallowMultipleComponent]
[DefaultExecutionOrder(ApplicationManager.EXECUTION_ORDER_DEFAULT_EARLIER)]
public class Character : MonoBehaviour, ISpatialHash
```

**设计亮点：**
- `SelectionBase`: 在场景中点击角色模型时，选中的是Character根对象而非子对象
- `DisallowMultipleComponent`: 确保同一GameObject上只有一个Character组件
- `DefaultExecutionOrder`: 确保角色在其他系统之前更新，保证逻辑优先级
- `ISpatialHash`: 实现空间哈希接口，用于高效的空间查询

#### 核心属性详解

```csharp
// 玩家标识
[SerializeField] protected bool m_IsPlayer;

// 时间模式 (支持慢动作、暂停等)
[SerializeField] protected TimeMode m_Time;

// 忙碌状态管理 (控制角色当前能否执行某些动作)
[SerializeField] protected Busy m_Busy = new Busy();

// 系统内核 (五大核心单元)
[SerializeReference] protected CharacterKernel m_Kernel = new CharacterKernel();

// 动画图系统
[SerializeField] protected AnimimGraph m_AnimimGraph = new AnimimGraph();

// 反向动力学系统
[SerializeField] protected InverseKinematics m_InverseKinematics = new InverseKinematics();
```

**重要属性访问器：**
```csharp
public bool IsPlayer
{
    get => this.m_IsPlayer;
    set
    {
        // 自动管理全局玩家引用
        ShortcutPlayer.Change(value ? this.gameObject : null);
        this.m_IsPlayer = value;

        // 触发相应事件
        switch (this.m_IsPlayer)
        {
            case true: this.EventChangeToPlayer?.Invoke(); break;
            case false: this.EventChangeToNPC?.Invoke(); break;
        }
    }
}

public bool IsDead
{
    get => this.m_IsDead;
    set
    {
        if (this.m_IsDead == value) return;
        this.m_IsDead = value;

        switch (this.m_IsDead)
        {
            case true:  this.EventDie?.Invoke(); break;
            case false: this.EventRevive?.Invoke(); break;
        }
    }
}
```

#### 生命周期管理
Character采用分阶段初始化模式：

**阶段1: Awake - 初始化所有子系统**
```csharp
protected virtual void Awake()
{
    this.Args = new Args(this);
    
    if (this.IsPlayer) ShortcutPlayer.Change(this.gameObject);
    
    // 按序初始化所有系统
    this.m_Busy?.OnStartup(this);
    this.m_Kernel?.OnStartup(this);
    this.m_AnimimGraph?.OnStartup(this);
    this.m_InverseKinematics?.OnStartup(this);
    this.m_Interaction?.OnStartup(this);
    this.m_Footsteps?.OnStartup(this);
    this.m_Ragdoll?.OnStartup(this);
    this.m_Props?.OnStartup(this);
    this.m_Combat?.OnStartup(this);
    this.m_Jump?.OnStartup(this);
    this.m_Dash?.OnStartup(this);
    
    // 注册到空间哈希系统
    SpatialHashCharacters.Insert(this);
}
```

**阶段2: Start - 后初始化阶段**
```csharp
protected void Start()
{
    // 确保所有依赖系统都已初始化后再执行
    this.m_Busy?.AfterStartup(this);
    this.m_Kernel?.AfterStartup(this);
    // ... 其他系统的AfterStartup
}
```

**更新循环：**
```csharp
// Update: 主要逻辑更新
protected virtual void Update()
{
    this.EventBeforeUpdate?.Invoke();
    
    this.m_Kernel?.OnUpdate();          // 输入和运动
    this.m_AnimimGraph?.OnUpdate();     // 动画更新
    this.m_Ragdoll?.OnUpdate();         // 布娃娃
    this.m_InverseKinematics?.OnUpdate(); // IK
    this.m_Interaction?.OnUpdate();     // 交互检测
    this.Footsteps?.OnUpdate();         // 脚步声
    
    this.EventAfterUpdate?.Invoke();
}

// LateUpdate: 在所有Update之后处理
protected virtual void LateUpdate()
{
    this.EventBeforeLateUpdate?.Invoke();
    
    this.Combat?.OnLateUpdate();  // 战斗系统延迟更新
    this.m_Ragdoll.OnLateUpdate(); // 布娃娃物理
    
    this.EventAfterLateUpdate?.Invoke();
}

// FixedUpdate: 物理更新
protected virtual void FixedUpdate()
{
    this.EventBeforeFixedUpdate?.Invoke();
    this.m_Kernel?.OnFixedUpdate();  // 物理驱动的运动
    this.EventAfterFixedUpdate?.Invoke();
}
```

#### 模型更换系统
Character支持运行时动态更换角色模型：

```csharp
public GameObject ChangeModel(GameObject prefab, ChangeOptions options)
{
    if (prefab == null) return null;
    
    this.EventBeforeChangeModel?.Invoke();

    // 获取或创建Mannequin容器
    Transform hull = this.Animim.Mannequin;
    
    // 销毁旧模型
    if (this.Animim.Animator != null)
    {
        Destroy(this.Animim.Animator.gameObject);
    }

    // 创建Mannequin容器（如果不存在）
    if (hull == null)
    {
        this.Animim.Mannequin = new GameObject("Mannequin").transform;
        this.Animim.Mannequin.transform.SetParent(this.transform);
    }
    
    // 计算偏移位置（通常是角色高度的一半向下）
    Vector3 position = Vector3.down * (this.Motion.Height * 0.5f);
    this.Animim.Mannequin.transform.localPosition = position + options.offset;
    
    // 实例化新模型
    GameObject model = Instantiate(prefab, this.Animim.Mannequin);
    model.name = prefab.name;

    // 获取或添加Animator组件
    Animator modelAnimator = model.GetComponentInChildren<Animator>(true);
    if (modelAnimator == null) modelAnimator = model.AddComponent<Animator>();
    
    this.Animim.Animator = modelAnimator;

    // 应用Mannequin变换
    if (Application.isPlaying)
    {
        this.Animim.ApplyMannequinPosition();
        this.Animim.ApplyMannequinRotation();
        this.Animim.ApplyMannequinScale();
    }
    
    // 应用可选配置
    if (modelAnimator != null && options.controller != null)
    {
        modelAnimator.runtimeAnimatorController = options.controller;
    }

    if (options.materials != null)
    {
        this.Footsteps.ChangeFootstepSounds(options.materials);
    }
    
    this.EventAfterChangeModel?.Invoke();
    return model;
}
```

**设计亮点：**
- 使用Mannequin中间层，避免直接操作模型根节点
- 支持运行时热替换，不需要重新初始化整个角色
- 自动处理Animator组件的迁移
- 支持可选的材质音效和控制器配置

---

### 2. CharacterKernel.cs - 系统内核

CharacterKernel是角色系统的核心，管理五大基础单元：

```csharp
[Serializable]
public class CharacterKernel : ICharacterKernel
{
    [SerializeReference] protected TUnitPlayer m_Player;  // 玩家控制
    [SerializeReference] protected TUnitMotion m_Motion;  // 运动系统
    [SerializeReference] protected TUnitDriver m_Driver;  // 驱动器
    [SerializeReference] protected TUnitFacing m_Facing;  // 朝向控制
    [SerializeReference] protected TUnitAnimim m_Animim;  // 动画系统
}
```

#### 预设系统 (Preset Pattern)
```csharp
public CharacterKernel()
{
    // 使用预设快速配置角色类型
    IKernelPreset preset = new KernelPreset3DController();

    this.m_Player = preset.MakePlayer;
    this.m_Motion = preset.MakeMotion;
    this.m_Driver = preset.MakeDriver;
    this.m_Facing = preset.MakeFacing;
    this.m_Animim = preset.MakeAnimim;
}
```

**预设模式的优势：**
- 快速创建常见角色类型（3D控制器、坦克控制、点击移动等）
- 确保各单元之间的兼容性
- 便于扩展新的角色类型

#### 热切换系统
Kernel支持运行时切换任何单元，实现角色行为的动态改变：

```csharp
public void ChangeMotion(Character character, TUnitMotion unit)
{
    if (unit == null) return;
    if (unit == this.m_Motion) return;

    // 清理旧单元
    this.m_Motion?.OnDisable();
    this.m_Motion?.OnDispose(character);

    // 安装新单元
    this.m_Motion = unit;
    this.m_Motion.OnStartup(character);
    this.m_Motion.OnEnable();
    
    // 通知监听者
    this.EventChangeMotion?.Invoke();
}
```

**应用场景：**
- 角色骑乘载具时切换驱动器（从Controller到Rigidbody）
- 进入特殊区域改变运动模式（水中游泳、太空飘浮）
- 战斗状态切换（锁定目标时改变朝向模式）

---

### 3. UnitPlayerDirectional.cs - 方向输入控制

这是最常见的角色控制方式，基于相机视角的方向输入：

```csharp
[Title("Directional")]
[Category("Directional")]
[Description("Moves the Player using a directional input from the Main Camera's perspective")]
public class UnitPlayerDirectional : TUnitPlayer
{
    [SerializeField] private InputPropertyValueVector2 m_InputMove;

    public override void OnUpdate()
    {
        base.OnUpdate();
        this.m_InputMove.OnUpdate();

        this.InputDirection = Vector3.zero;
        
        if (!this.Character.IsPlayer) return;
        
        // 读取输入（如果不可控制则返回零向量）
        Vector3 inputMovement = this.m_IsControllable 
            ? this.m_InputMove.Read()
            : Vector2.zero;
        
        // 转换输入到世界空间
        this.InputDirection = this.GetMoveDirection(inputMovement);
        
        // 应用速度
        float speed = this.Character.Motion?.LinearSpeed ?? 0f;
        this.Character.Motion?.MoveToDirection(
            this.InputDirection * speed, 
            Space.World, 
            0
        );
    }

    protected virtual Vector3 GetMoveDirection(Vector3 input)
    {
        // 将2D输入转换为3D方向
        Vector3 direction = new Vector3(input.x, 0f, input.y);
        
        // 获取相机旋转（仅Y轴）
        Quaternion cameraRotation = this.Camera != null
            ? Quaternion.Euler(0f, this.Camera.rotation.eulerAngles.y, 0f)
            : Quaternion.identity;
        
        // 旋转方向向量
        Vector3 moveDirection = cameraRotation * direction;
        
        // 确保在水平面上
        moveDirection.Scale(Vector3Plane.NormalUp);
        moveDirection.Normalize();
        
        // 保持输入幅度
        return moveDirection * direction.magnitude;
    }
}
```

**关键设计：**
- 相机相对输入：玩家推摇杆向前，角色朝相机前方移动
- 保持输入幅度：支持模拟摇杆的渐进式移动
- 水平面投影：自动忽略相机的俯仰角，确保角色在地面移动

#### 其他玩家控制模式

**UnitPlayerTank - 坦克控制**
```csharp
// 前后输入控制移动，左右输入控制旋转
// 类似坦克或车辆的控制方式
```

**UnitPlayerPointClick - 点击移动**
```csharp
// 点击地面，角色自动寻路到目标点
// 适合MOBA、RTS、ARPG等游戏
```

**UnitPlayerFollowPointer - 跟随指针**
```csharp
// 角色持续朝向并移动到鼠标/触摸位置
// 适合移动平台的虚拟摇杆控制
```

---

## 系统单元分析

### 运动系统 (UnitMotion)

#### UnitMotionController - 角色控制器运动

```csharp
public class UnitMotionController : TUnitMotion
{
    // 基础运动参数
    [SerializeField] private float m_Speed = 4f;              // 线速度
    [SerializeField] private EnablerFloat m_Rotation = new EnablerFloat(true, 1800f); // 角速度
    
    // 物理参数
    [SerializeField] private float m_Mass = 80f;              // 质量
    [SerializeField] private float m_Height = 2.0f;           // 高度
    [SerializeField] private float m_Radius = 0.2f;           // 半径
    
    // 重力参数
    [SerializeField] private float m_GravityUpwards = -9.81f;    // 上升时重力
    [SerializeField] private float m_GravityDownwards = -9.81f;  // 下降时重力
    [SerializeField] private float m_TerminalVelocity = -53f;    // 终端速度
    
    // 子系统
    [SerializeField] private MotionAcceleration m_Acceleration;  // 加速度系统
    [SerializeField] private MotionJump m_Jump;                  // 跳跃系统
    [SerializeField] private MotionDash m_Dash;                  // 冲刺系统
}
```

**子系统详解：**

**1. MotionAcceleration - 加速度系统**
```csharp
// 控制角色的加速和减速
// 避免瞬间启动/停止，使运动更自然
// 支持不同地面材质的摩擦力
```

**2. MotionJump - 跳跃系统**
```csharp
public override bool CanJump => 
    this.m_Jump.CanJump && !this.Character.Busy.AreLegsBusy;

public override int AirJumps
{
    get => m_Jump.AirJumps;
    set => m_Jump.AirJumps = value;
}
```

**3. MotionDash - 冲刺系统**
```csharp
public override int DashInSuccession => this.m_Dash.InSuccession;
// 支持连续冲刺次数限制
// 冷却时间管理
```

#### 运动类型

Motion系统支持多种运动模式：

```csharp
// 1. MoveToDirection - 方向移动
this.Character.Motion.MoveToDirection(
    direction * speed,  // 方向和速度
    Space.World,        // 世界空间或局部空间
    0                   // 停止距离
);

// 2. MoveToPosition - 位置移动（寻路）
this.Character.Motion.MoveToPosition(
    targetPosition,
    speed,
    stopDistance,
    callback
);

// 3. MoveToTransform - 跟随目标
this.Character.Motion.MoveToTransform(
    target,
    speed,
    stopDistance,
    callback
);
```

---

### 驱动器系统 (UnitDriver)

驱动器决定角色如何在物理世界中移动：

#### UnitDriverController - CharacterController驱动
```csharp
// 使用Unity的CharacterController组件
// 特点：
// - 不受物理引擎影响（不会被推动）
// - 自动碰撞检测和响应
// - 支持斜坡行走
// - 适合大多数第三人称动作游戏
```

#### UnitDriverRigidbody - 刚体驱动
```csharp
// 使用Rigidbody组件
// 特点：
// - 完全物理驱动
// - 会受力和碰撞影响
// - 适合载具、物理谜题
// - 需要careful处理防止角色翻倒
```

#### UnitDriverNavmesh - 导航网格驱动
```csharp
// 使用NavMeshAgent组件
// 特点：
// - 自动寻路避障
// - 适合AI控制的NPC
// - 支持动态障碍物
// - 多层导航网格
```

---

### 朝向系统 (UnitFacing)

控制角色面向哪个方向：

#### UnitFacingDirection - 方向朝向
```csharp
// 角色朝向移动方向
// 最常见的朝向模式
```

#### UnitFacingTarget - 目标朝向
```csharp
// 角色始终朝向特定目标
// 适合锁定目标的战斗系统
```

#### UnitFacingPointer - 指针朝向
```csharp
// 角色朝向鼠标位置
// 适合射击游戏、MOBA
```

#### UnitFacingTank - 坦克朝向
```csharp
// 朝向固定，通过输入旋转
// 配合UnitPlayerTank使用
```

---

### 动画系统 (UnitAnimim)

#### UnitAnimimKinematic - 运动学动画
```csharp
// 基于运动状态自动选择动画
// 支持混合树和状态机
// 自动处理动画过渡
```

---

## 功能特性详解

### 1. AnimimGraph - 动画图系统

这是一个基于Unity Playables API的高级动画系统：

```csharp
///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                       //
//     +--------+   +----+   +----------+   +--------+   +---------------------+         //
// <===| OUTPUT |===| IK |===| GESTURES |===| STATES |===| ANIMATOR CONTROLLER |         //
//     +--------+   +----+   +----------+   +--------+   +---------------------+         //
//                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////
```

**架构说明：**
- **AnimatorController**: 基础动画层（Idle、Walk、Run等）
- **States**: 状态动画（战斗状态、受伤状态等）
- **Gestures**: 手势动画（攻击、施法、互动等）
- **IK**: 反向动力学（看向目标、踩在地面等）
- **Output**: 最终输出到Animator

#### States vs Gestures

**States (状态):**
- 持续性的动画状态
- 可以循环播放
- 例如：Idle状态、Combat状态、Crouch状态
- 有进入和退出过渡

**Gestures (手势):**
- 一次性的动画动作
- 播放完毕后返回State
- 例如：攻击动作、跳跃动作、拾取物品
- 可以打断State

```csharp
// 播放手势
await character.Gestures.CrossFade(
    gestureAsset,           // 手势资源
    0.2f,                   // 淡入时间
    null,                   // 蒙版（可选）
    1.0f,                   // 速度
    Gesture.Blend.Blend,    // 混合模式
    rootMotion              // 根运动权重
);
```

#### Root Motion (根运动)

Root Motion允许动画驱动角色的移动和旋转：

```csharp
public float RootMotionPosition => this.UseRootMotionPosition
    ? Math.Max(this.Gestures.RootMotion, this.States.RootMotion)
    : 0f;

public float RootMotionRotation => this.UseRootMotionRotation
    ? Math.Max(this.Gestures.RootMotion, this.States.RootMotion)
    : 0f;
```

**应用场景：**
- 精确的攻击位移（冲刺攻击）
- 爬墙、翻越障碍物
- 受击硬直位移

---

### 2. InverseKinematics - IK系统

IK系统使用"装配(Rig)"模式，每个Rig负责特定的IK任务：

```csharp
[Serializable]
public class InverseKinematics
{
    [SerializeField] private RigLayers m_RigLayers = new RigLayers();
    
    // 获取特定类型的Rig
    public T GetRig<T>() where T : TRig
    {
        return this.m_RigLayers.GetRig<T>();
    }
    
    // 确保Rig存在（不存在则创建）
    public T RequireRig<T>() where T : TRig, new()
    {
        return this.GetRig<T>() ?? this.m_RigLayers.Create<T>();
    }
}
```

#### 常见Rig类型

**RigFeetPlant - 脚部IK**
```csharp
// 使脚部贴合地面
// 处理斜坡和不平整地形
// 自动检测地面高度
```

**RigLookTracker - 头部跟踪**
```csharp
// 头部和眼睛跟随目标
// 自然的视线移动
// 支持权重调节
```

**RigLean - 身体倾斜**
```csharp
// 转弯时身体倾斜
// 增强运动感
// 模拟惯性
```

---

### 3. Interaction - 交互系统

交互系统自动检测附近的可交互对象：

```csharp
internal void OnUpdate()
{
    // 使用空间哈希查找附近的交互对象
    SpatialHashInteractions.Find(
        this.m_Character.transform.position, 
        this.m_Character.Motion.InteractionRadius,
        this.Interactions
    );

    IInteractive newTarget = null;
    float targetPriority = float.MaxValue;
    
    // 根据优先级选择最佳目标
    foreach (ISpatialHash interaction in this.Interactions)
    {
        if (interaction is not IInteractive interactive) continue;
        
        float priority = this.m_Character.Motion.InteractionMode.CalculatePriority(
            this.m_Character, interactive
        );
        
        if (priority > INFINITY) continue;
        
        if (newTarget == null || targetPriority > priority)
        {
            newTarget = interactive;
            targetPriority = priority;
        }
    }
    
    // 更新焦点
    if (newTarget != this.Target)
    {
        if (this.Target != null) 
            this.EventBlur?.Invoke(this.m_Character, this.Target);
            
        this.Target = newTarget;
        
        if (this.Target != null) 
            this.EventFocus?.Invoke(this.m_Character, this.Target);
    }
}
```

#### 交互模式 (InteractionMode)

**InteractionModeNearCharacter**
```csharp
// 选择最近的可交互对象
// 基于距离排序
```

**InteractionModeScreenCenter**
```csharp
// 选择屏幕中心最近的对象
// 适合第一人称视角
```

**InteractionModeScreenCursor**
```csharp
// 选择鼠标指向的对象
// 使用射线检测
```

---

### 4. Ragdoll - 布娃娃系统

布娃娃系统实现角色死亡或失去控制时的物理模拟：

```csharp
public async Task StartRagdoll()
{
    if (this.m_Ragdoll == null) return;
    if (this.m_Character.Animim.Animator == null) return;
    
    if (this.IsRagdoll) return;
    
    this.EventBeforeStartRagdoll?.Invoke();
    
    await this.m_Ragdoll.StartRagdoll(this.m_Character);
    
    this.IsRagdoll = true;
    await Task.Yield();
    
    this.EventAfterStartRagdoll?.Invoke();
}

public async Task StartRecover()
{
    if (this.m_Ragdoll == null) return;
    if (this.m_Character.Animim.Animator == null) return;
    
    if (!this.IsRagdoll) return;
    
    this.EventBeforeStartRecover?.Invoke();

    await this.m_Ragdoll.StopRagdoll(this.m_Character);
    
    this.IsRagdoll = false;
    await Task.Yield();
    
    this.EventAfterStartRecover?.Invoke();
}
```

**实现类型：**

**RagdollDefault**
```csharp
// 完整的布娃娃物理
// 自动生成关节和刚体
// 支持碰撞和力反馈
```

**RagdollNone**
```csharp
// 空实现，不使用布娃娃
```

---

### 5. Props - 道具附加系统

Props系统管理附加到角色骨骼上的物体（武器、盾牌、背包等）：

```csharp
public GameObject AttachPrefab(
    IBone bone,           // 附加到的骨骼
    GameObject prefab,    // 道具预制体
    Vector3 position,     // 局部位置
    Quaternion rotation   // 局部旋转
)
{
    if (prefab == null) return null;
    
    int instanceID = prefab.GetInstanceID();
    if (!this.m_Props.TryGetValue(instanceID, out List<IProp> props))
    {
        props = new List<IProp>();
        this.m_Props[instanceID] = props;
    }

    // 创建道具实例
    Transform parent = bone.Get(this.m_Character.Animim.Animator);
    GameObject instance = Instantiate(prefab, parent);
    
    // 设置变换
    instance.transform.localPosition = position;
    instance.transform.localRotation = rotation;
    
    // 注册道具
    IProp prop = new PropPrefab(prefab, instance);
    props.Add(prop);
    
    // 更新全局引用
    LastPropAttachedInstance = instance;
    LastPropAttachedPrefab = prefab;
    
    this.EventAdd?.Invoke(parent, instance);
    
    return instance;
}
```

**道具类型：**

**PropPrefab - 预制体道具**
```csharp
// 实例化的GameObject
// 完全独立的对象
```

**PropSkin - 蒙皮道具**
```csharp
// 合并到角色网格
// 性能更好
// 无法单独操作
```

---

### 6. Combat - 战斗系统

战斗系统是一个复杂的模块，包含多个子系统：

```csharp
[Serializable]
public class Combat
{
    // 子系统
    [NonSerialized] private Invincibility m_Invincibility; // 无敌状态
    [NonSerialized] private Targets m_Targets;             // 目标管理
    [NonSerialized] private Block m_Block;                 // 格挡系统
    [NonSerialized] private Poise m_Poise;                 // 韧性系统
    
    // 装备管理
    [NonSerialized] private Dictionary<int, Weapon> m_Weapons;
    [NonSerialized] private Dictionary<int, IMunition> m_Munitions;
    [NonSerialized] private Dictionary<int, IStance> m_Stances;
    
    // 防御值
    [NonSerialized] private float m_MaxDefense;
    [NonSerialized] private float m_CurDefense;
}
```

#### 防御系统

```csharp
public float MaximumDefense
{
    get => this.m_MaxDefense;
    set => this.m_MaxDefense = Math.Max(0f, value);
}

public float CurrentDefense
{
    get => this.m_CurDefense;
    set
    {
        this.m_CurDefense = Math.Clamp(value, 0f, this.m_MaxDefense);
        this.EventDefenseChange?.Invoke();
    }
}
```

#### 韧性系统 (Poise)

```csharp
public class Poise
{
    // 韧性值决定角色抗打断能力
    // 当前韧性 < 攻击伤害时，角色被打断
    // 韧性会随时间恢复
}
```

#### 格挡系统 (Block)

```csharp
[field: NonSerialized] public float LastBlockTime { get; private set; } = -999f;
[field: NonSerialized] public float LastParryTime { get; private set; } = -999f;
[field: NonSerialized] public float LastBreakTime { get; private set; } = -999f;
```

---

### 7. Skeleton - 骨架系统

Skeleton系统管理角色的物理骨架（用于Ragdoll、碰撞检测等）：

```csharp
[CreateAssetMenu(
    fileName = "My Skeleton",
    menuName = "Game Creator/Characters/Skeleton",
    order = 50
)]
public class Skeleton : ScriptableObject, IStageGizmos
{
    [SerializeField] private PhysicsMaterial m_Material;
    [SerializeField] private CollisionDetectionMode m_CollisionDetection;
    [SerializeReference] private Volumes m_Volumes = new Volumes();
    
    public GameObject[] Refresh(Character character)
    {
        if (character == null) return Array.Empty<GameObject>();

        Animator animator = character.Animim.Animator;
        return animator != null 
            ? this.Refresh(animator, character.Motion.Mass)
            : Array.Empty<GameObject>();
    }
    
    public GameObject[] Refresh(Animator animator, float mass)
    {
        return this.m_Volumes.Update(animator, mass, this);
    }
}
```

**Volumes (体积碰撞器):**
- **VolumeCapsule**: 胶囊体（手臂、腿部）
- **VolumeSphere**: 球体（头部、关节）
- **VolumeBox**: 盒体（躯干、手掌）

---

### 8. 其他功能模块

#### Jump - 跳跃系统
```csharp
public class Jump
{
    // 跳跃力度
    // 空中跳跃次数
    // 跳跃冷却
    // 跳跃动画触发
}
```

#### Dash - 冲刺系统
```csharp
public class Dash
{
    // 冲刺速度倍率
    // 冲刺持续时间
    // 连续冲刺次数
    // 冷却时间
}
```

#### Footsteps - 脚步系统
```csharp
public class Footsteps
{
    // 检测地面材质
    // 播放对应脚步声
    // 生成脚印特效
    // 支持自定义材质音效库
}
```

---

## 关键代码设计模式

### 1. 策略模式 (Strategy Pattern)

所有的Unit都是策略实现：

```csharp
// 抽象基类
public abstract class TUnitPlayer : TUnit { }

// 具体策略
public class UnitPlayerDirectional : TUnitPlayer { }
public class UnitPlayerTank : TUnitPlayer { }
public class UnitPlayerPointClick : TUnitPlayer { }

// 使用策略
character.Kernel.ChangePlayer(character, new UnitPlayerDirectional());
```

### 2. 组合模式 (Composite Pattern)

Character组合了多个独立的功能模块：

```csharp
public class Character
{
    protected CharacterKernel m_Kernel;
    protected AnimimGraph m_AnimimGraph;
    protected InverseKinematics m_InverseKinematics;
    protected Interaction m_Interaction;
    protected Combat m_Combat;
    // ... 每个模块独立管理自己的生命周期
}
```

### 3. 观察者模式 (Observer Pattern)

大量使用事件进行解耦：

```csharp
public event Action EventDie;
public event Action EventRevive;
public event Action<float> EventLand;
public event Action<float> EventJump;
public event Action EventBeforeChangeModel;
public event Action EventAfterChangeModel;
```

### 4. 工厂模式 (Factory Pattern)

Preset系统用于创建角色配置：

```csharp
public interface IKernelPreset
{
    TUnitPlayer MakePlayer { get; }
    TUnitMotion MakeMotion { get; }
    TUnitDriver MakeDriver { get; }
    TUnitFacing MakeFacing { get; }
    TUnitAnimim MakeAnimim { get; }
}

public class KernelPreset3DController : IKernelPreset
{
    public TUnitPlayer MakePlayer => new UnitPlayerDirectional();
    public TUnitMotion MakeMotion => new UnitMotionController();
    // ...
}
```

### 5. 单例模式 (Singleton Pattern)

全局访问角色和交互对象：

```csharp
// 玩家快捷访问
ShortcutPlayer.Change(this.gameObject);
Character player = ShortcutPlayer.Instance;

// 空间哈希单例
SpatialHashCharacters.Insert(this);
SpatialHashInteractions.Find(position, radius, results);
```

### 6. 状态模式 (State Pattern)

AnimimGraph的States系统：

```csharp
public abstract class State : ScriptableObject, IState
{
    public abstract void OnEnter(Character character);
    public abstract void OnUpdate(Character character);
    public abstract void OnExit(Character character);
}
```

### 7. 命令模式 (Command Pattern)

运动指令封装：

```csharp
// 封装运动命令
public interface IMotionCommand
{
    void Execute(Character character);
}

// 方向移动命令
character.Motion.MoveToDirection(direction, speed);

// 位置移动命令
character.Motion.MoveToPosition(target, speed, stopDistance);
```

---

## 性能优化要点

### 1. 空间哈希 (Spatial Hash)

用于快速查找附近的角色和交互对象：

```csharp
public interface ISpatialHash
{
    Vector3 Position { get; }
}

// 插入到空间哈希
SpatialHashCharacters.Insert(this);

// 范围查询
List<ISpatialHash> nearby = new List<ISpatialHash>();
SpatialHashCharacters.Find(position, radius, nearby);
```

**优势：**
- O(1)的插入和删除
- O(k)的范围查询，k是结果数量
- 避免遍历所有对象

### 2. 对象池

Props系统使用字典管理实例，避免频繁创建销毁：

```csharp
[NonSerialized] private Dictionary<int, List<IProp>> m_Props;
```

### 3. 延迟初始化

Rig系统按需创建：

```csharp
public T RequireRig<T>() where T : TRig, new()
{
    return this.GetRig<T>() ?? this.m_RigLayers.Create<T>();
}
```

### 4. 分阶段更新

不同系统在不同的更新循环中执行：

```csharp
Update()         // 逻辑更新
LateUpdate()     // 动画后处理
FixedUpdate()    // 物理更新
```

### 5. 条件执行

只有玩家角色才处理输入：

```csharp
if (!this.Character.IsPlayer) return;
```

### 6. 缓存引用

避免重复的GetComponent调用：

```csharp
[NonSerialized] private Character m_Character;
[NonSerialized] private GameObject m_Model;
```

---

## 扩展性分析

### 1. 易于扩展的单元系统

添加新的角色控制方式：

```csharp
[Serializable]
public class UnitPlayerCustom : TUnitPlayer
{
    public override void OnUpdate()
    {
        // 实现自定义控制逻辑
    }
}
```

### 2. 模块化的功能系统

添加新的功能模块：

```csharp
[Serializable]
public class MyCustomFeature
{
    internal void OnStartup(Character character) { }
    internal void OnUpdate() { }
    // ...
}

// 在Character中添加
[SerializeField] protected MyCustomFeature m_CustomFeature;
```

### 3. 事件驱动的架构

无需修改核心代码即可添加新功能：

```csharp
character.EventDie += OnCharacterDie;
character.EventJump += OnCharacterJump;
character.Combat.EventEquip += OnEquipWeapon;
```

### 4. 策略可替换

运行时替换任何系统单元：

```csharp
// 动态切换控制模式
character.Kernel.ChangePlayer(character, new UnitPlayerTank());

// 动态切换运动模式
character.Kernel.ChangeMotion(character, newMotionSystem);
```

### 5. 数据驱动

使用ScriptableObject配置：

```csharp
// Skeleton配置
[CreateAssetMenu]
public class Skeleton : ScriptableObject { }

// State配置
[CreateAssetMenu]
public class State : ScriptableObject { }
```

---

## 总结与建议

### 系统优势

1. **高度模块化**: 每个功能独立封装，易于维护和扩展
2. **灵活配置**: 通过Preset和Unit系统快速配置不同类型的角色
3. **运行时切换**: 支持动态改变角色行为，无需重启
4. **性能优化**: 使用空间哈希、对象池等技术优化性能
5. **事件驱动**: 松耦合的事件系统，易于扩展功能
6. **完整功能**: 涵盖移动、动画、战斗、交互等所有核心功能

### 潜在改进点

1. **内存管理**: 考虑使用对象池管理Props和临时对象
2. **并发处理**: 某些系统可能受益于Job System
3. **GC优化**: 减少装箱拆箱和临时分配
4. **文档完善**: 添加更多代码注释和使用示例

### 使用建议

1. **从Preset开始**: 使用预设快速创建常见角色类型
2. **按需扩展**: 只添加需要的功能模块
3. **善用事件**: 利用事件系统实现游戏逻辑
4. **性能监控**: 在移动平台注意性能开销
5. **测试覆盖**: 为自定义Unit编写测试

---

## 关键类关系图

```
Character (核心组件)
│
├─ CharacterKernel (系统内核)
│  ├─ TUnitPlayer (玩家控制)
│  │  ├─ UnitPlayerDirectional
│  │  ├─ UnitPlayerTank
│  │  └─ UnitPlayerPointClick
│  │
│  ├─ TUnitMotion (运动系统)
│  │  └─ UnitMotionController
│  │     ├─ MotionAcceleration
│  │     ├─ MotionJump
│  │     └─ MotionDash
│  │
│  ├─ TUnitDriver (驱动器)
│  │  ├─ UnitDriverController
│  │  ├─ UnitDriverRigidbody
│  │  └─ UnitDriverNavmesh
│  │
│  ├─ TUnitFacing (朝向控制)
│  │  ├─ UnitFacingDirection
│  │  ├─ UnitFacingTarget
│  │  └─ UnitFacingPointer
│  │
│  └─ TUnitAnimim (动画系统)
│     └─ UnitAnimimKinematic
│
├─ AnimimGraph (动画图)
│  ├─ StatesOutput (状态)
│  ├─ GesturesOutput (手势)
│  └─ Phases (阶段)
│
├─ InverseKinematics (IK)
│  └─ RigLayers
│     ├─ RigFeetPlant
│     ├─ RigLookTracker
│     └─ RigLean
│
├─ Interaction (交互)
│  └─ InteractionMode
│     ├─ InteractionModeNearCharacter
│     ├─ InteractionModeScreenCenter
│     └─ InteractionModeScreenCursor
│
├─ Combat (战斗)
│  ├─ Invincibility
│  ├─ Targets
│  ├─ Block
│  ├─ Poise
│  ├─ Weapons
│  └─ Munitions
│
├─ Ragdoll (布娃娃)
│  ├─ RagdollDefault
│  └─ RagdollNone
│
├─ Props (道具)
│  ├─ PropPrefab
│  └─ PropSkin
│
├─ Jump (跳跃)
├─ Dash (冲刺)
└─ Footsteps (脚步)
```

---

**审查完成时间**: 2025年10月22日
**代码版本**: Game Creator 2.x
**审查人**: AI Code Reviewer
