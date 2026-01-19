---
title: "gamecreator2 框架review"
date: "2025-10-20"
tags: ["Unity", "GameCreator", "Network","GameCreator"]
excerpt: "GameCreator 是一个功能丰富的unity框架。"
ispublish: false
---     
# GameCreator Core 框架详细讲解

## 一、整体架构概览

GameCreator 是一个为 Unity 设计的**可视化脚本框架**，它采用了高度模块化和多态的设计理念。整个框架的核心分为以下几个主要部分：

### 1.1 核心模块结构

```
Core/
├── Runtime/                    # 运行时代码
│   ├── VisualScripting/       # 可视化脚本系统（核心）
│   ├── Common/                # 通用工具和基础设施
│   ├── Characters/            # 角色系统
│   ├── Cameras/               # 相机系统
│   └── Variables/             # 变量系统
└── Editor/                    # 编辑器扩展
```

## 二、可视化脚本系统（Visual Scripting）

这是框架的**核心中的核心**，采用了基于组件的可视化编程模式。

### 2.1 三大核心概念

#### **2.1.1 Instruction（指令）**

```csharp
public abstract class Instruction : TPolymorphicItem<Instruction>
{
    protected int NextInstruction { get; set; }
    protected InstructionList Parent { get; private set; }
    protected bool IsCanceled => (this.Parent?.IsCancelled ?? false) || AsyncManager.ExitRequest;

    public async Task<InstructionResult> Schedule(Args args, InstructionList parent)
    {
        this.NextInstruction = DEFAULT_NEXT_INSTRUCTION;
        this.Parent = parent;
        
        if (this.Breakpoint) Debug.Break();
        if (this.IsEnabled) await this.Run(args);
        
        if (this.IsCanceled) return InstructionResult.Stop;
        
        if (this.NextInstruction == DEFAULT_NEXT_INSTRUCTION) return InstructionResult.Default;
        if (this.NextInstruction == int.MaxValue) return InstructionResult.Stop;
        
        return InstructionResult.JumpTo(this.NextInstruction);
    }

    protected abstract Task Run(Args args);
}
```

**设计要点：**
- **异步执行**：使用 `async/await` 模式，支持协程式的指令执行
- **可取消性**：通过 `IsCanceled` 标志实现指令的中断
- **流程控制**：`NextInstruction` 支持跳转，实现分支和循环
- **调试支持**：内置 `Breakpoint` 断点功能
- **执行控制**：`IsEnabled` 允许禁用指令而不删除

**关键方法：**
- `Schedule()` - 调度执行，处理断点、启用状态和取消逻辑
- `Run()` - 抽象方法，子类实现具体逻辑
- `NextFrame()`, `Time()`, `While()`, `Until()` - 提供时间控制工具

#### **2.1.2 Condition（条件）**

```csharp
public abstract class Condition : TPolymorphicItem<Condition>
{
    [SerializeField][HideInInspector]
    private bool m_Sign = true;  // true = If, false = Not
    
    public bool Check(Args args)
    {
        if (!this.IsEnabled) return this.m_Sign;
        if (this.Breakpoint) Debug.Break();
        
        return this.m_Sign ? this.Run(args) : !this.Run(args);
    }
    
    protected abstract bool Run(Args args);
}
```

**设计要点：**
- **取反机制**：通过 `m_Sign` 实现 If/Not 切换，无需重复编写逻辑
- **同步执行**：条件检查是即时的，返回布尔值
- **简洁接口**：只需实现 `Run()` 方法返回原始结果

#### **2.1.3 Event（事件）**

```csharp
public abstract class Event
{
    protected Trigger m_Trigger;
    
    protected GameObject Self => this.m_Trigger.gameObject;
    protected bool IsActive => this.m_Trigger.isActiveAndEnabled;
    
    // 生命周期钩子
    protected internal virtual void OnAwake(Trigger trigger) { }
    protected internal virtual void OnStart(Trigger trigger) { }
    protected internal virtual void OnEnable(Trigger trigger) { }
    protected internal virtual void OnDisable(Trigger trigger) { }
    
    // 更新循环钩子
    protected internal virtual void OnUpdate(Trigger trigger) { }
    protected internal virtual void OnLateUpdate(Trigger trigger) { }
    protected internal virtual void OnFixedUpdate(Trigger trigger) { }
    
    // 物理事件钩子
    protected internal virtual void OnCollisionEnter3D(Trigger trigger, Collision collision) { }
    protected internal virtual void OnTriggerEnter3D(Trigger trigger, Collider collider) { }
    // ... 更多物理事件
}
```

**设计要点：**
- **事件驱动**：响应 Unity 生命周期和物理事件
- **钩子模式**：子类选择性重写需要的事件方法
- **触发器绑定**：通过 `Trigger` 组件桥接 Unity 和框架

### 2.2 容器和调度系统

#### **2.2.1 InstructionList（指令列表）**

```csharp
public class InstructionList : TPolymorphicList<Instruction>, ICancellable
{
    [SerializeReference]
    private Instruction[] m_Instructions = Array.Empty<Instruction>();
    
    public bool IsRunning { get; private set; }
    public bool IsStopped { get; private set; }
    public int RunningIndex { get; private set; }
    
    public async Task Run(Args args, ICancellable cancellable, int fromIndex = 0)
    {
        if (this.IsRunning) return;
        
        this.Cancellable = cancellable;
        this.IsRunning = true;
        this.RunningIndex = Math.Max(0, fromIndex);
        this.IsStopped = false;
        
        this.EventStartRunning?.Invoke();
        
        while (this.RunningIndex < this.Length)
        {
            if (this.IsCancelled)
            {
                this.IsStopped = true;
                this.IsRunning = false;
                this.EventEndRunning?.Invoke();
                return;
            }
            
            if (this.m_Instructions[this.RunningIndex] == null)
            {
                this.RunningIndex += 1;
                continue;
            }
            
            EventRunInstruction?.Invoke(this.RunningIndex);
            
            Instruction instruction = this.m_Instructions[this.RunningIndex];
            InstructionResult result = await instruction.Schedule(args, this);
            
            if (result.DontContinue)
            {
                this.IsRunning = false;
                this.EventEndRunning?.Invoke();
                return;
            }
            
            this.RunningIndex += result.NextInstruction;
        }
        
        this.IsRunning = false;
        this.EventEndRunning?.Invoke();
    }
}
```

**核心特性：**
1. **顺序执行**：按索引逐条执行指令
2. **跳转支持**：根据 `InstructionResult` 调整索引
3. **可取消性**：继承 `ICancellable` 接口
4. **事件通知**：开始、结束、每条指令执行时发出事件
5. **防重入**：通过 `IsRunning` 标志防止并发执行

#### **2.2.2 ConditionList（条件列表）**

```csharp
public class ConditionList : TPolymorphicList<Condition>
{
    [SerializeReference]
    private Condition[] m_Conditions = Array.Empty<Condition>();
    
    public bool Check(Args args, CheckMode mode)
    {
        this.EventStartCheck?.Invoke();
        
        foreach (Condition condition in this.m_Conditions)
        {
            if (condition == null) continue;
            bool check = condition.Check(args);
            
            switch (mode)
            {
                case CheckMode.And:
                    if (check == false)  // 短路求值
                    {
                        this.EventEndCheck?.Invoke();
                        return false;
                    }
                    break;
                
                case CheckMode.Or:
                    if (check)  // 短路求值
                    {
                        this.EventEndCheck?.Invoke();
                        return true;
                    }
                    break;
            }
        }
        
        this.EventEndCheck?.Invoke();
        return mode == CheckMode.And;
    }
}
```

**设计巧思：**
- **短路求值**：AND 模式遇到 false 立即返回，OR 模式遇到 true 立即返回
- **模式切换**：通过 `CheckMode` 枚举支持 AND/OR 逻辑
- **同步检查**：所有条件立即评估，无异步开销

#### **2.2.3 Trigger（触发器组件）**

```csharp
public class Trigger : BaseActions, IPointerEnterHandler, IPointerExitHandler
{
    [SerializeReference]
    protected Event m_TriggerEvent = new EventOnStart();
    
    [NonSerialized] private Args m_Args;
    
    public bool IsExecuting { get; private set; }
    
    public async Task Execute(Args args)
    {
        if (this.IsExecuting) return;
        this.IsExecuting = true;
        
        this.EventBeforeExecute?.Invoke();
        
        try
        {
            await this.ExecInstructions(args);
        }
        catch (Exception exception)
        {
            Debug.LogError(exception.ToString(), this);
        }
        
        this.IsExecuting = false;
        this.EventAfterExecute?.Invoke();
    }
    
    protected void Awake()
    {
        this.m_Args = new Args(this);
        this.m_TriggerEvent?.OnAwake(this);
    }
}
```

**角色定位：**
- **事件监听器**：监听 Unity 的各种事件（碰撞、UI 等）
- **指令执行器**：触发时执行指令列表
- **桥接组件**：连接 Unity MonoBehaviour 和框架逻辑

### 2.3 执行上下文：Args 系统

```csharp
public class Args
{
    [field: NonSerialized] public GameObject Self { get; private set; }
    [field: NonSerialized] public GameObject Target { get; private set; }
    
    private readonly Dictionary<int, Component> m_SelfComponents;
    private readonly Dictionary<int, Component> m_TargetComponents;
    
    public T ComponentFromSelf<T>(bool inChildren = false) where T : Component
    {
        return this.GetComponent<T>(this.m_SelfComponents, this.Self, inChildren);
    }
    
    public T ComponentFromTarget<T>(bool inChildren = false) where T : Component
    {
        return this.GetComponent<T>(this.m_TargetComponents, this.Target, inChildren);
    }
    
    private TComponent GetComponent<TComponent>(
        IDictionary<int, Component> dictionary, GameObject gameObject, bool inChildren)
        where TComponent : Component
    {
        if (gameObject == null) return null;
        
        int hash = typeof(TComponent).GetHashCode();
        if (!dictionary.TryGetValue(hash, out Component value) || value == null)
        {
            value = inChildren
                ? gameObject.GetComponent<TComponent>()
                : gameObject.GetComponentInChildren<TComponent>();
            
            if (value == null) return null;
            dictionary[hash] = value;  // 缓存组件引用
        }
        
        return value as TComponent;
    }
}
```

**设计精髓：**
1. **双目标系统**：区分 `Self`（执行者）和 `Target`（目标）
2. **组件缓存**：使用字典缓存 GetComponent 结果，避免重复查找
3. **哈希键值**：用类型哈希码作为字典键，高效查找
4. **延迟加载**：只在需要时才获取组件

## 三、多态系统（Polymorphism）

这是框架**最核心的设计模式**，实现了类型安全的序列化多态。

### 3.1 基础抽象层

```csharp
public abstract class TPolymorphicItem<TType> : IPolymorphicItem
{
    [SerializeField] [HideInInspector]
    private bool m_Breakpoint = false;
    
    [SerializeField] [HideInInspector]
    private bool m_IsEnabled = true;
    
    public Type BaseType => typeof(TType);
    public Type FullType => this.GetType();
    
    public bool Breakpoint => m_Breakpoint;
    public bool IsEnabled => this.m_IsEnabled;
    
    public virtual Color Color => ColorTheme.Get(ColorTheme.Type.TextNormal); 
    public virtual string Title => TextUtils.Humanize(this.GetType().ToString());
}
```

**关键点：**
- **泛型约束**：`TType` 是基类型，提供类型安全
- **元数据**：每个项目都有启用/断点状态
- **可视化**：`Color` 和 `Title` 用于编辑器显示
- **反射支持**：`BaseType` 和 `FullType` 用于类型检查

### 3.2 属性系统（Property System）

框架实现了强大的**双层属性系统**：

```csharp
// 第一层：类型获取器（抽象实现）
public abstract class TPropertyTypeGet<T>
{
    public abstract string String { get; }
    public virtual T EditorValue { get; } = default;
    
    public virtual T Get(Args args) => default;
    public virtual T Get(GameObject gameObject) => this.Get(new Args(gameObject));
}

// 第二层：具体类型（如 GameObject）
public abstract class PropertyTypeGetGameObject : TPropertyTypeGet<GameObject>
{
    public virtual T Get<T>(Args args) where T : Component
    {
        GameObject gameObject = this.Get(args);
        return gameObject != null ? gameObject.Get<T>() : null;
    }
}

// 第三层：字段包装器
public class PropertyGetGameObject : TPropertyGet<PropertyTypeGetGameObject, GameObject>
{
    [SerializeReference]
    protected PropertyTypeGetGameObject m_Property;
    
    public PropertyGetGameObject() : base(new GetGameObjectInstance())
    { }
    
    public override GameObject Get(Args args) => this.m_Property?.Get(args) ?? default;
}
```

**架构优势：**
1. **三层分离**：
   - `TPropertyTypeGet<T>` - 泛型基类
   - `PropertyTypeGetXXX` - 类型特定逻辑
   - `PropertyGetXXX` - 序列化包装器

2. **[SerializeReference]**：使用 Unity 的引用序列化，支持多态
3. **扩展性**：添加新类型只需继承 `PropertyTypeGetXXX`
4. **类型安全**：编译时检查，无装箱拆箱

### 3.3 实例：获取玩家 GameObject

```csharp
// 用户可以选择不同的获取方式：
// - GetGameObjectPlayer (获取玩家)
// - GetGameObjectInstance (获取当前对象)
// - GetGameObjectCharactersTarget (获取角色目标)
// 等等...

PropertyGetGameObject playerProperty = new PropertyGetGameObject(new GetGameObjectPlayer());
GameObject player = playerProperty.Get(args);
```

## 四、角色系统（Character System）

角色系统是一个**高度模块化的复杂系统**。

### 4.1 Character 组件架构

```csharp
public class Character : MonoBehaviour, ISpatialHash
{
    // 核心子系统
    [SerializeField] protected CharacterKernel m_Kernel = new CharacterKernel();
    [SerializeField] protected AnimimGraph m_AnimimGraph = new AnimimGraph();
    [SerializeField] protected InverseKinematics m_InverseKinematics = new InverseKinematics();
    
    // 功能模块
    [SerializeField] protected Interaction m_Interaction = new Interaction();
    [SerializeField] protected Footsteps m_Footsteps = new Footsteps();
    [SerializeField] protected Ragdoll m_Ragdoll = new Ragdoll();
    [SerializeField] protected Props m_Props = new Props();
    [SerializeField] protected Combat m_Combat = new Combat();
    [SerializeField] protected Jump m_Jump = new Jump();
    [SerializeField] protected Dash m_Dash = new Dash();
    
    // 状态管理
    [SerializeField] protected Busy m_Busy = new Busy();
    [NonSerialized] private bool m_IsDead;
    
    // 公共访问器
    public CharacterKernel Kernel => this.m_Kernel;
    public IUnitPlayer Player => this.m_Kernel?.Player;
    public IUnitMotion Motion => this.m_Kernel?.Motion;
    public IUnitDriver Driver => this.m_Kernel?.Driver;
    public IUnitFacing Facing => this.m_Kernel?.Facing;
}
```

**模块化设计：**
- 每个子系统都是独立的可序列化类
- 通过生命周期钩子（OnStartup, AfterStartup, OnUpdate 等）协调
- 松耦合：子系统通过接口访问角色

### 4.2 单元系统（Unit System）

角色行为通过**可插拔的单元**定义：

```csharp
// 单元包装器
[Serializable]
public class UnitPlayer
{
    [SerializeReference] private TUnitPlayer m_Player = new UnitPlayerDirectional();
    
    public TUnitPlayer Wrapper => this.m_Player;
}

// 单元实现示例
public class UnitPlayerDirectional : TUnitPlayer
{
    // 实现方向输入的玩家控制逻辑
}

public class UnitPlayerTank : TUnitPlayer
{
    // 实现坦克式的玩家控制逻辑
}
```

**优势：**
- **热插拔**：运行时可以更换控制方式
- **预设**：提供多种预制单元（方向控制、坦克控制、点击移动等）
- **扩展**：用户可以创建自定义单元

## 五、管理器系统（Manager System）

框架使用**单例模式**管理全局服务。

### 5.1 单例基类

```csharp
public abstract class Singleton<T> : MonoBehaviour where T : MonoBehaviour
{
    private static T _Instance { get; set; }
    
    public static T Instance
    {
        get
        {
            if (_Instance == null)
            {
                if (ApplicationManager.IsExiting) return null;
                
                GameObject singleton = new GameObject();
                _Instance = singleton.AddComponent<T>();
                
                string name = TextUtils.Humanize(typeof(T).Name);
                singleton.name = $"{name} (singleton)";
                
                Singleton<T> component = _Instance.GetComponent<Singleton<T>>();
                component.OnCreate();
                
                if (component.SurviveSceneLoads) DontDestroyOnLoad(singleton);
            }
            
            return _Instance;
        }
    }
    
    protected virtual void OnCreate() { }
    protected virtual bool SurviveSceneLoads => true;
}
```

**特性：**
- **延迟初始化**：首次访问时创建
- **场景持久化**：默认 DontDestroyOnLoad
- **退出检测**：应用退出时不创建新实例
- **自定义初始化**：`OnCreate()` 钩子

### 5.2 核心管理器

#### **TimeManager - 时间缩放管理**

```csharp
public class TimeManager : Singleton<TimeManager>
{
    private Dictionary<int, TimeData> m_TimeScales = new Dictionary<int, TimeData>();
    
    public void SetTimeScale(float timeScale, float duration, int layer)
    {
        this.m_TimeScales[layer] = new TimeData(0f, timeScale, 1f, duration, 0f);
        this.RecalculateTimeScale();
    }
    
    private void RecalculateTimeScale()
    {
        float scale = 1f;
        
        foreach (KeyValuePair<int, TimeData> item in this.m_TimeScales)
        {
            if (item.Value.IsInDelay) continue;
            scale = Math.Min(scale, item.Value.Get);  // 取最小值
            
            if (item.Value.TimeRanOut)
            {
                this.m_RemoveCandidates.Add(item.Key);
            }
        }
        
        Time.timeScale = scale;
        Time.fixedDeltaTime = PHYSICS_TIME_STEP * scale;
    }
}
```

**设计巧思：**
- **分层系统**：不同系统可以在不同层设置时间缩放
- **最小值策略**：多个时间缩放取最小值（更保守）
- **临时效果**：支持有持续时间的时间缩放
- **平滑过渡**：支持平滑过渡到目标缩放值

#### **PoolManager - 对象池管理**

```csharp
public class PoolManager : Singleton<PoolManager>
{
    private Dictionary<int, PoolData> Collection { get; set; }
    
    public GameObject Pick(GameObject prefab, Vector3 position, Quaternion rotation, int count, float duration = -1f)
    {
        if (prefab == null) return null;
        int instanceID = prefab.GetInstanceID();
        
        if (!this.Collection.ContainsKey(instanceID))
            this.CreatePool(prefab, count);
        
        return this.Collection[instanceID].Get(position, rotation, duration);
    }
    
    public void Prewarm(GameObject prefab, int count)
    {
        // 预热池，避免首次使用时的卡顿
    }
}
```

**性能优化：**
- **按需创建**：第一次使用时才创建池
- **预热支持**：可以提前创建对象
- **自动回收**：支持定时自动回收
- **实例ID索引**：使用预制体实例ID快速查找

#### **SaveLoadManager - 存档管理**

```csharp
public class SaveLoadManager : Singleton<SaveLoadManager>
{
    private Dictionary<string, Reference> m_Subscriptions;
    private Dictionary<string, Value> m_Values;
    
    public static async Task Subscribe(IGameSave reference, int priority = 0)
    {
        Instance.m_Subscriptions[reference.SaveID] = new Reference
        {
            reference = reference,
            priority = priority
        };
        
        switch (reference.LoadMode)
        {
            case LoadMode.Lazy:
                // 延迟加载：等对象 Start 时再加载
                if (Instance.IsGameLoaded)
                {
                    await Instance.LoadItem(reference, Instance.SlotLoaded);
                }
                break;
            
            case LoadMode.Greedy:
                // 贪婪加载：立即加载
                await Instance.LoadItem(reference, 0);
                break;
        }
    }
    
    public async Task Save(int slot)
    {
        // 遍历所有订阅者
        foreach (KeyValuePair<string, Reference> item in this.m_Subscriptions)
        {
            object data = item.Value.reference.GetSaveData(false);
            string key = string.Format(DB_KEY_FORMAT, slot, item.Key);
            await this.DataStorage.SaveAsync(key, data);
        }
    }
}
```

**存档架构：**
1. **订阅模式**：对象主动订阅存档系统
2. **双模式加载**：
   - Lazy：对象创建时才加载（常用）
   - Greedy：切换存档时立即加载（单例对象）
3. **优先级系统**：控制保存/加载顺序
4. **插件化存储**：`IDataStorage` 接口支持不同后端（PlayerPrefs、文件、云存档等）

## 六、相机系统（Camera System）

### 6.1 相机抽象基类

```csharp
public abstract class TCamera : MonoBehaviour
{
    [SerializeField] private TimeMode m_TimeMode;
    [SerializeField] private CameraViewport m_Viewport = new CameraViewport();
    [SerializeField] private CameraTransition m_Transition = new CameraTransition();
    [SerializeReference] private TCameraClip m_Clip = new CameraClipNone();
    
    private readonly CameraShakeSustain m_ShakeSustain = new CameraShakeSustain();
    private readonly CameraShakeBurst m_ShakeBurst = new CameraShakeBurst();
    
    private void LateUpdate()
    {
        this.EventBeforeUpdate?.Invoke();
        
        // 更新相机位置和旋转
        this.Transition.NormalUpdate();
        Transform cameraTransform = this.transform;
        cameraTransform.position = this.Transition.Position;
        cameraTransform.rotation = this.Transition.Rotation;
        
        // 应用抖动效果
        this.UpdateShakeEffect();
        
        // 避免穿墙
        this.UpdateAvoidClipping();
        
        this.EventAfterUpdate?.Invoke();
    }
}
```

**特性：**
- **平滑过渡**：支持 Cut（瞬切）和 Transition（渐变）
- **抖动系统**：持续抖动（Sustain）和爆发抖动（Burst）
- **防穿墙**：自动调整相机位置避免遮挡

## 七、变量系统（Variable System）

### 7.1 变量值抽象

```csharp
public class ValueBool : TValue
{
    public static readonly IdString TYPE_ID = new IdString("boolean");
    
    [SerializeField] private bool m_Value;
    
    public override IdString TypeID => TYPE_ID;
    public override Type Type => typeof(bool);
    public override bool CanSave => true;
    
    protected override object Get()
    {
        return this.m_Value;
    }
    
    protected override void Set(object value)
    {
        this.m_Value = value is true;
    }
    
    // 自动注册类型
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    private static void RuntimeInit() => RegisterValueType(
        TYPE_ID, 
        new TypeData(typeof(ValueBool), CreateValue),
        typeof(bool)
    );
}
```

**类型注册系统：**
- **静态注册**：启动时自动注册所有类型
- **工厂模式**：`CreateValue` 方法创建实例
- **类型ID**：字符串ID用于序列化和查找
- **可扩展**：用户可以注册自定义变量类型

## 八、信号系统（Signal System）

```csharp
public struct Signal : ISerializationCallbackReceiver
{
    [SerializeField] private string m_String;
    [NonSerialized] private PropertyName m_Value;
    
    public PropertyName Value
    {
        get
        {
            if (PropertyName.IsNullOrEmpty(this.m_Value))
            {
                this.m_Value = new PropertyName(this.m_String);
            }
            return this.m_Value;
        }
    }
}

public interface ISignalReceiver
{
    void ReceiveSignal(Signal signal, SignalArgs args);
}
```

**用途：**
- **松耦合通信**：组件间无需引用即可通信
- **性能优化**：使用 Unity 的 `PropertyName`（哈希值）进行快速比较
- **广播机制**：一对多通信

## 九、核心设计模式总结

### 9.1 使用的设计模式

1. **策略模式**：单元系统（UnitPlayer, UnitMotion 等）
2. **观察者模式**：事件系统（Event, EventStartRunning 等）
3. **工厂模式**：变量类型注册
4. **单例模式**：管理器系统
5. **命令模式**：Instruction 系统
6. **模板方法模式**：TPolymorphicItem
7. **对象池模式**：PoolManager
8. **状态模式**：角色状态（Busy, IsDead 等）

### 9.2 编程原则

1. **开闭原则**：通过继承扩展，无需修改基类
2. **依赖倒置**：依赖抽象接口（IUnitPlayer, IDataStorage）
3. **接口隔离**：细粒度接口（ICancellable, IGameSave）
4. **单一职责**：每个类只负责一个功能模块

### 9.3 性能优化技术

1. **组件缓存**：Args 中缓存 GetComponent 结果
2. **对象池**：避免频繁实例化/销毁
3. **延迟初始化**：单例和变量系统
4. **短路求值**：条件列表的 AND/OR 检查
5. **哈希查找**：使用字典和哈希码快速查找

## 十、框架优势与特色

### 10.1 可视化编程

- **无代码开发**：游戏设计师无需编程即可创建游戏逻辑
- **类型安全**：编译时检查，避免运行时错误
- **调试友好**：内置断点和执行追踪

### 10.2 高度可扩展

- **插件架构**：所有系统都可替换或扩展
- **多态序列化**：`[SerializeReference]` 支持在编辑器中选择实现
- **注册系统**：自动发现和注册新类型

### 10.3 模块化设计

- **独立子系统**：角色、相机、变量各自独立
- **松耦合**：通过接口和事件通信
- **可组合**：不同模块可以任意组合使用

### 10.4 生产级质量

- **异常处理**：Trigger 中捕获异常
- **防重入**：InstructionList 防止并发执行
- **退出检测**：ApplicationManager 检测应用退出
- **内存管理**：对象池和组件缓存减少 GC 压力

## 十一、使用示例

### 示例1：创建一个简单的触发器

```csharp
// 在编辑器中：
// 1. 创建 GameObject
// 2. 添加 Trigger 组件
// 3. 选择 Event = "On Collision Enter"
// 4. 添加 Instruction = "Debug Log Message"
// 5. 运行时碰撞会打印消息

// 代码等价物：
Trigger trigger = gameObject.AddComponent<Trigger>();
Trigger.Reconfigure(
    trigger,
    new EventOnCollisionEnter3D(),
    new InstructionList(
        new InstructionDebugLog { message = "碰撞了！" }
    )
);
```

### 示例2：使用属性系统获取玩家

```csharp
// 在 Instruction 中：
public class InstructionMoveToPlayer : Instruction
{
    [SerializeField] 
    private PropertyGetGameObject m_Character = new PropertyGetGameObject();
    
    protected override async Task Run(Args args)
    {
        GameObject character = this.m_Character.Get(args);
        GameObject player = ShortcutPlayer.Get();
        
        if (character != null && player != null)
        {
            // 移动逻辑
            character.transform.position = Vector3.MoveTowards(
                character.transform.position,
                player.transform.position,
                5f * Time.deltaTime
            );
        }
    }
}
```

### 示例3：保存和加载

```csharp
public class MyGameData : MonoBehaviour, IGameSave
{
    [SerializeField] private int m_Score;
    
    public string SaveID => "my-game-data";
    public LoadMode LoadMode => LoadMode.Greedy;
    public bool IsShared => true;
    
    public object GetSaveData(bool isShared)
    {
        return new SaveData { score = this.m_Score };
    }
    
    public async Task OnLoad(object value)
    {
        if (value is SaveData data)
        {
            this.m_Score = data.score;
        }
    }
    
    private void Start()
    {
        _ = SaveLoadManager.Subscribe(this);
    }
}

// 保存和加载
await SaveLoadManager.Instance.Save(slot: 1);
await SaveLoadManager.Instance.Load(slot: 1);
```

## 总结

GameCreator Core 是一个**企业级的可视化脚本框架**，它通过精心设计的架构实现了：

1. **易用性**：让非程序员也能创建复杂游戏逻辑
2. **扩展性**：通过多态和插件化支持无限扩展
3. **性能**：缓存、对象池等优化确保生产环境可用
4. **可维护性**：模块化设计和清晰的职责划分

这个框架的设计哲学可以总结为：**"通过组合而非继承构建游戏逻辑，通过多态而非硬编码实现灵活性"**。每一个子系统都是独立的、可替换的，同时又通过统一的接口和事件系统协同工作，形成了一个强大而优雅的游戏开发框架。


## 关系总览（一句话）
- `TPropertyTypeGet<T>`：是“实际的值获取器 / 策略”的抽象基类（策略层），负责如何根据上下文取到类型为 T 的值（例如某种获取 GameObject、查找场景对象、常量、变量等）。
- `TPropertyGet<TType, TValue>`：是“序列化字段/包装器”层，持有一个 `TType` 的实例（通常通过 `[SerializeReference]`），并对外提供统一的 `Get(Args)` 接口；也负责在编辑器中展示/序列化这个多态实现。
- `PropertyGetGameObject` 等具体类：继承 `TPropertyGet`，为用户在 Inspector 中暴露具体类型（例如“GameObject 类型的属性”），并通常在构造时提供默认的 `TPropertyTypeGet` 实例。

简化图示：
TPropertyTypeGet<T> (具体实现 A, B, C ...)
    ↑（实例）
TPropertyGet<TType(=TPropertyTypeGet<T>), TValue=T>
    ↑（序列化字段类型，暴露给编辑器）
PropertyGetGameObject : TPropertyGet<PropertyTypeGetGameObject, GameObject>

## 逐层拆解（职责和示例）

1. TPropertyTypeGet<T>（“策略/实现”层）
   - 代码片段（关键点）：
     - abstract class TPropertyTypeGet<T> { public abstract string String { get; } public virtual T EditorValue { get; } public virtual T Get(Args args) => default; public virtual T Get(GameObject gameObject) => this.Get(new Args(gameObject)); }
   - 职责：
     - 定义“如何获取某种T类型值”的策略接口。
     - 可包含多个实现（例如：常量获取、从 Target 获取、查找场景中名字对象、从变量表读取等）。
     - `String`：用于编辑器显示，说明这个实现的描述（例如 "Self", "Player", "From Variable X"）。
     - `EditorValue`：编辑器场景中可能需要的“静态示例值”，用于绘制 gizmo 等（注意：仅在编辑器用于展示，不能依赖于运行时逻辑）。
     - `Get(Args)`：运行时执行获取逻辑（可重写）。
   - 关键特性：
     - 并不包含 `[SerializeReference]` 的包装本身；它只是“实现类”的抽象定义。
     - 允许衍生出任意数量具体实现，且这些实现可以被序列化（通过被包装层）。

2. TPropertyGet<TType, TValue>（“包装/字段”层）
   - 代码片段（关键点）：
     - [SerializeReference] protected TType m_Property;
     - public virtual TValue Get(Args args) => this.m_Property != null ? this.m_Property.Get(args) : default;
     - public override string ToString() => this.m_Property?.String ?? "(none)";
     - public TValue EditorValue => this.m_Property.EditorValue;
   - 职责：
     - 作为 Inspector 中的字段类型（例如 `PropertyGetGameObject myProperty;`），序列化保存用户在编辑器里选择的具体 `TPropertyTypeGet` 实例。
     - 统一对外提供 `Get(...)` 接口，委托到内部的 `m_Property`（实际实现）。
     - 提供 `ToString()`、`EditorValue` 等，便于 Inspector 显示和编辑器绘制。
   - 关键特性：
     - 使用 `[SerializeReference]` 来保存 `m_Property` 的具体派生类型实例（多态序列化）。
     - 通过泛型约束 `where TType : TPropertyTypeGet<TValue>` 保证类型安全（序列化的实例确实能返回 TValue）。

3. PropertyGetGameObject（具体包装类）
   - 继承自 `TPropertyGet<PropertyTypeGetGameObject, GameObject>`，通常提供构造时默认值（例如 `new GetGameObjectInstance()`），并提供泛型辅助 `Get<T>(Args)` 让用户直接拿到某个组件类型 T。
   - 作用就是：你想在某个 Instruction/Condition 中获取一个 GameObject 或其组件，编辑器展示选择器，序列化保存用户的选择（多态），运行时调用 `Get(args)` 得到值。

## 序列化与编辑器行为：为什么要用 SerializeReference 与三层架构

1. 多态序列化的需求
   - 使用多种“获取方式”的场景非常多：直接引用、按标签查找、默认玩家、从变量获取、从父对象获取、常量、随机等。每一种都是不同类的实现，但它们都需要序列化到组件里并在 Inspector 上被用户选择。
   - Unity 的 `[SerializeField]` 无法直接序列化多态引用（对于抽象基类的不同派生类型），而 `[SerializeReference]` 可以序列化引用类型的具体派生实例，从而支持在同一个字段存储不同的实现。

2. 将运行时逻辑与序列化分离（职责分离）
   - `TPropertyTypeGet<T>` 关注“如何获取值”，包含实际逻辑。
   - `TPropertyGet<TType, TValue>` 关注“如何在组件/场景中序列化并暴露给用户”，承担包装和 Inspector 显示以及统一接口。
   - 这样做的好处：运行时代码（获取逻辑）可以任意复杂，而序列化/编辑器代码只需要处理包装层的显示、默认值和通用接口。

3. 类型安全
   - 通过 `TPropertyGet<TType, TValue>` 的泛型约束 `where TType : TPropertyTypeGet<TValue>`，在编译时就保证了包装的 `m_Property` 能返回合适的 TValue（例如 `PropertyGetGameObject` 必然包装 `PropertyTypeGetGameObject`，而 `PropertyTypeGetGameObject.Get()` 返回 `GameObject`）。
   - 这避免了运行时类型转换错误，便于开发者理解类型契约。

4. 编辑器体验
   - 包装层可以实现 `ToString()`、`EditorValue`、默认构造器等，直接影响 Inspector 的显示和工具提示。
   - 编辑器脚本可以只关注 `TPropertyGet` 的公共属性（例如显示一个下拉列出支持的策略），而不用在每个 Instruction/Condition 中重复处理。

## 运行时行为：Get 调用流程

1. 组件上有一个字段，例如：
   - [SerializeField] private PropertyGetGameObject m_Target;
2. Inspector 上会显示 m_Target 的当前策略（例如 "Self"、"Player"、"From Variable X"），实际上 `m_Target.m_Property` 是某个具体 `PropertyTypeGetGameObject` 的实例（已序列化）。
3. 在运行时，某处调用 `m_Target.Get(args)`：
   - `TPropertyGet.Get(Args args)` 直接调用 `m_Property.Get(args)`（委托到具体实现）。
4. 具体实现 `PropertyTypeGetGameObject.Get(Args args)` 执行逻辑，例如：
   - 如果是 `GetGameObjectInstance`，返回 `args.Self`（或 `args.Target`），直接返回 GameObject。
   - 如果是 `GetGameObjectFromTag`，用 `GameObject.FindWithTag(...)` 等方式查找并返回。
5. 结果类型与 `TValue` 保持一致（编译期已保证）。

## 设计动机总结（为什么要这么设计）

1. 可扩展性（最重要）
   - 新的获取策略只需继承 `TPropertyTypeGet<T>`，实现 `Get` 与 `String`；包装类型无需改变。
   - 通过 `[SerializeReference]`，用户在 Inspector 中可以选择任意新策略并序列化。

2. 类型安全
   - 泛型约束保证每个包装器只接受能返回指定 `TValue` 的策略，实现编译期类型检查。

3. 好的编辑器体验
   - 包装层便于 Editor 脚本识别、替换默认值、显示描述文本和静态示例值（EditorValue）。
   - `ToString()` 能在属性面板/Label 中提供清晰描述。

4. 运行时性能与职责分离
   - 运行时调用直接委托给实现层，包装层开销极小。
   - `EditorValue` 与 `ToString()` 只在编辑器使用，不影响运行时主路径。

5. 最小代码侵入
   - Instruction/Condition 只需声明 `TPropertyGet<...>` 类型字段，就能获得一整套在 Editor 与运行时的行为。

## 扩展示例：如何添加一个自定义 PropertyType

假设你要添加一个新的获取方式：按名字查找场景中某个 GameObject（GetGameObjectByName），并暴露给 `PropertyGetGameObject` 使用。

步骤：

1. 新建实现类，继承 `PropertyTypeGetGameObject`（即继承 `TPropertyTypeGet<GameObject>` 的具体派生）：
   - 实现 `String`（描述）和 `Get(Args args)`（运行时逻辑）。
   - 提供必需的 serialized fields（例如 string m_Name）。

伪代码（基于项目风格）：

```csharp
[Serializable]
public class GetGameObjectByName : PropertyTypeGetGameObject
{
    [SerializeField] private string m_Name = "";

    public override string String => $"By Name: {m_Name}";

    public override GameObject Get(Args args)
    {
        if (string.IsNullOrEmpty(m_Name)) return null;
        return GameObject.Find(m_Name); // 简单示例，实际可能更复杂或缓存
    }

    public override GameObject Get(GameObject gameObject)
    {
        return this.Get(new Args(gameObject));
    }
}
```

2. 在编辑器（或通过静态注册）使该类型可见：
   - 如果框架有类型注册机制（例如属性类型注册，或 Editor 扫描 `[Serializable]` 派生类），则无需额外工作；否则需要在 editor 脚本中注册到类型列表，以便 Inspector 的多态选择器显示这个选项。

3. 使用：
```csharp
[SerializeField] private PropertyGetGameObject m_Target; // Inspector 中用户选择 "By Name" 策略，并设置 Name 字段

// 运行时
GameObject obj = m_Target.Get(args);
```

注意：如果 `Get` 使用昂贵操作（如 GameObject.Find），考虑缓存或优化（避免每帧查找）。

## 常见误区与调试技巧

1. 误区：“m_Property 是 null，为什么 Inspector 显示有选项？”
   - `[SerializeReference]` 只序列化当时的实例；如果你在代码中直接 new 一个包装器但未设置具体实现（或场景里没有），运行时 `m_Property` 可能为 null。确保构造器提供默认实现（许多包装类像 `PropertyGetGameObject` 的默认构造器会设置 `new GetGameObjectInstance()`）。

2. 误区：“为什么在运行时 EditorValue 与实际 Get 返回不一致？”
   - `EditorValue` 仅供编辑器显示用途（静态示例），不是运行时结果。不要把 `EditorValue` 作为功能性返回数据依赖。

3. 性能陷阱：在 `Get()` 中执行昂贵查询（Find、GetComponentsInChildren等）：
   - 建议在 `Get()` 实现中缓存结果（当逻辑允许），或使用 Args 的缓存组件（`ComponentFromSelf`）以减少 `GetComponent` 调用。

4. 调试技巧：
   - 若 `m_Property.Get(args)` 返回 null，检查：
     - `m_Property` 是否为 null（包装层序列化是否丢失）
     - `m_Property.String` 是什么（ToString）
     - 在实现中加入日志（仅在 debug 模式）或在 Editor 中用 `EditorValue` 显示示例结果
   - 使用断点：`TPolymorphicItem` 具有 `Breakpoint` 字段，可在需要时在 Schedule/Check 处触发调试中断。

## 实用建议与下一步

1. 新策略实现建议保持纯粹（单一职责），不要在 `Get()` 中做过多副作用。
2. 如果需要 Editor 集成（自定义 Inspector UI），基于 `TPropertyGet<...>` 写一个 PropertyDrawer，列出所有 `TPropertyTypeGet<T>` 的可用子类并允许创建/编辑。
3. 对于运行时频繁查询的属性，考虑在 `TPropertyTypeGet` 中提供 `WarmUp` / `Cache` 接口或把结果缓存到 `Args`（或另一个缓存系统）。
4. 如果你要扩展大量 PropertyType，建议建立静态注册表（框架中已有类似变量类型注册的范式），这样 Editor 下拉可以自动列出该类型的所有实现。

---

如果你愿意，我可以立即为你做以下一件或多件事（择一或多项）：
- 实际实现一个示例：`GetGameObjectByName`（包括运行时类和必要的编辑器注册/显示）。
- 为 `PropertyGetGameObject` 编写一个简单的 `PropertyDrawer`（在 Inspector 中列出所有支持的 `PropertyTypeGetGameObject` 子类）。
- 扫描仓库，列出项目中所有已存在的 `PropertyTypeGetGameObject` 的实现（帮助你了解已有选项）。

请选择希望我接着做的一个操作，或者告诉我你还想在哪个点上更细致地深挖（比如序列化细节、editor UI 或性能优化）。