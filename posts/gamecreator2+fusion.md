---
title: "gamecreator集合fusion实现网络数据同步"
date: "2025-10-20"
tags: ["Unity", "GameCreator", "Network"]
excerpt: "GameCreator 是一个功能丰富的unity框架,可以结合fusion实现多人模式使用gamecreator。"
ispublish: true
---       


# NinjutsuGames Fusion Network for GameCreator2 - 深度架构解析

## 📋 Part 1: 整体架构和核心设计理念

### 1.1 目录结构概览

```
NinjutsuGames/Packages/Fusion/
├── Runtime/
│   ├── Classes/           # 数据类和辅助类
│   ├── Common/           # 通用组件和管理器
│   │   ├── Managers/     # NetworkManager, PlayerManager, NetworkDataManager
│   │   ├── Utilities/    # 工具类和扩展方法
│   │   └── Values/       # 数值类型定义
│   ├── Network/          # 网络核心组件
│   │   ├── Classes/      # 网络数据结构
│   │   └── Components/   # 网络行为组件
│   ├── Systems/          # 系统级组件（对象池等）
│   ├── VisualScripting/  # GameCreator2 可视化脚本集成
│   │   ├── Instructions/ # 指令节点
│   │   ├── Conditions/   # 条件节点
│   │   └── Events/       # 事件节点
│   └── UI/              # UI 相关组件
├── Editor/              # 编辑器扩展
└── Examples/            # 示例场景
```

### 1.2 核心设计理念

**NinjutsuGames Fusion 插件的核心目标是将 GameCreator2 的单机功能无缝扩展到多人网络环境。**

#### 设计原则：

1. **最小化侵入性**：不修改 GameCreator2 原有代码，通过组件扩展和事件监听实现网络同步
2. **状态同步优先**：使用 Fusion 的状态同步机制而非频繁 RPC
3. **分层架构**：清晰分离网络层、游戏逻辑层和表现层
4. **类型安全**：通过自定义数据结构确保网络数据的类型安全和高效传输

### 1.3 核心组件概览

| 组件 | 功能 | 同步方式 |
|------|------|----------|
| **NetworkCharacter** | 角色网络同步 | 状态同步 + RPC |
| **NetworkPlayer** | 玩家数据管理 | 状态同步 |
| **GlobalNameVariablesNetwork** | 全局变量同步 | 状态同步 |
| **LocalNameVariablesNetwork** | 本地变量同步 | 状态同步 |
| **RPCReceiver** | RPC 基类 | RPC 调用 |
| **NetworkManager** | 网络连接管理 | 单例管理器 |
| **PlayerManager** | 玩家生命周期 | 单例管理器 |
| **NetworkDataManager** | 共享数据管理 | 状态同步 |

---

## 📦 Part 2: 网络同步机制 - 变量系统

### 2.1 变量同步的核心问题

GameCreator2 有强大的变量系统（全局变量、局部变量、列表变量），但这些变量在单机环境中运行。要实现多人同步，必须解决：

1. **类型多样性**：GC2 变量支持多种类型（int, float, string, Vector3, GameObject 等）
2. **动态性**：变量可以在运行时创建和修改
3. **作用域**：全局变量 vs 局部变量的同步策略不同
4. **权限控制**：谁有权修改变量？如何避免冲突？

### 2.2 VariableData 结构 - 类型安全的网络传输

```csharp
[Serializable]
public struct VariableData : INetworkStruct
{
    public enum Type { Number, Vector3, Vector2, Color, Bool, String, PrefabRef }
    
    public Type type;
    public double number;
    public Vector3 vector3;
    public Vector2 vector2;
    public Color color;
    public NetworkBool boolValue;
    public NetworkString<_64> valueString;
    public NetworkPrefabRef prefabRef;
}
```

**设计亮点：**
- **联合体结构**：所有类型共享一个 struct，节省网络带宽
- **类型标记**：使用 `type` 枚举明确数据类型
- **Fusion 原生类型**：使用 `NetworkBool`, `NetworkString` 等 Fusion 优化类型
- **转换方法**：`ConvertFromObject()` 和 `GetValue()` 处理 C# object 与网络数据的转换

**工作原理：**
```csharp
// GC2 变量 → 网络数据
var gcVariable = localVariables.Get("PlayerHealth"); // object (可能是 int)
var networkData = VariableData.ConvertFromObject(gcVariable); // 转换为网络结构

// 网络数据 → GC2 变量
object value = networkData.GetValue();
localVariables.Set("PlayerHealth", value);
```

### 2.3 GlobalNameVariablesNetwork - 全局变量同步

```csharp
[RequireComponent(typeof(NetworkObject))]
public class GlobalNameVariablesNetwork : NetworkBehaviour, IStateAuthorityChanged
{
    [SerializeField] private GlobalNameVariables variables;
    
    [Networked, Capacity(24)]
    private NetworkDictionary<string, VariableData> NetworkVars => default;
}
```

**同步流程：**

1. **本地修改检测**
   ```csharp
   private void OnVariableChange(string varId)
   {
       var data = variables.Get(varId);
       if (!data.IsAllowedType()) return;
       
       var varData = VariableData.ConvertFromObject(data);
       if (HasStateAuthority)
       {
           NetworkVars.Set(varId, varData); // 只有权威端可以修改
       }
   }
   ```

2. **网络同步到客户端**
   ```csharp
   public override void Render()
   {
       if(HasStateAuthority) return; // 权威端不需要读取
       
       foreach (var change in _changeDetector.DetectChanges(this))
       {
           if (change == nameof(NetworkVars))
           {
               UpdateLocalVariables(); // 更新本地 GC2 变量
           }
       }
   }
   ```

3. **权限转移处理**
   ```csharp
   public void StateAuthorityChanged()
   {
       if(!HasStateAuthority) UpdateLocalVariables(); // 失去权限时同步最新数据
   }
   ```

**关键特性：**
- **容量限制**：`Capacity(24)` - 最多 24 个变量同步
- **单向权威**：只有 StateAuthority 可以修改，客户端只读
- **变化检测**：使用 Fusion 的 `ChangeDetector` 高效检测变化
- **类型过滤**：`IsAllowedType()` 确保只同步支持的类型

### 2.4 LocalNameVariablesNetwork - 局部变量同步

```csharp
[RequireComponent(typeof(LocalNameVariables), typeof(NetworkObject))]
public class LocalNameVariablesNetwork : NetworkBehaviour
{
    [Networked, Capacity(24), OnChangedRender(nameof(VariablesChanged))]
    private NetworkDictionary<string, VariableData> NetworkVars => default;
}
```

**与全局变量的区别：**
- **生命周期绑定**：与 NetworkObject 绑定，对象销毁时自动清理
- **作用域隔离**：每个 NetworkObject 有独立的变量空间
- **自动通知**：使用 `OnChangedRender` 自动触发更新，无需手动检测

**应用场景：**
- 角色专属数据（血量、蓝量、等级）
- NPC 状态（是否被击败、对话进度）
- 可交互物品状态（门的开关状态、宝箱是否被打开）

### 2.5 变量同步的最佳实践

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| 全局游戏设置 | GlobalNameVariablesNetwork | 所有玩家共享 |
| 玩家角色属性 | LocalNameVariablesNetwork (在角色上) | 每个角色独立 |
| 临时战斗数据 | LocalNameVariablesNetwork | 生命周期明确 |
| 静态配置数据 | 不需要同步 | 所有客户端本地加载 |

---

## 🎮 Part 3: 角色网络同步 - NetworkCharacter

### 3.1 NetworkCharacter 架构

`NetworkCharacter` 是整个插件最复杂的组件，负责将 GameCreator2 的 `Character` 系统扩展到网络环境。

#### 核心职责：
1. **移动同步**：同步角色的移动方向、位置和朝向
2. **动画同步**：同步动画状态（通过事件触发）
3. **交互同步**：同步交互事件（Focus, Interact, Blur）
4. **战斗同步**：同步目标选择和战斗状态
5. **道具同步**：同步角色装备的 Props
6. **生命状态**：同步死亡/复活状态
7. **模型切换**：同步角色模型变化

### 3.2 核心网络化属性

```csharp
[Networked] public Vector3 MoveDirection { get; set; }
[Networked] public Vector3 InputDirection { get; set; }
[Networked] public Vector3 FaceDirection { get; set; }
[Networked] private Vector3 RagdollPosition { get; set; }
[Networked] private Quaternion RagdollRotation { get; set; }
[Networked] public int Token { get; set; }
[Networked, OnChangedRender(nameof(CheckIsDead))] private NetworkBool IsDead { get; set; }
[Networked, Capacity(16)] public NetworkDictionary<NetworkString<_32>, NetworkProp> PropList => default;
[Networked, OnChangedRender(nameof(ChangeModel))] private NetworkString<_64> CurrentModel { get; set; }
[Networked, OnChangedRender(nameof(ChangePrimaryTarget))] private NetworkObject CombatPrimaryTarget { get; set; }
[Networked, Capacity(40)] private NetworkLinkedList<NetworkId> CombatTargets { get; }
```

**设计亮点：**
- **OnChangedRender 回调**：状态改变时自动触发方法（如 `CheckIsDead`）
- **容量预分配**：`Capacity(16)` 提前声明容器大小，优化性能
- **NetworkLinkedList**：高效的网络化列表结构

### 3.3 事件监听和同步机制

#### 3.3.1 事件注册

```csharp
private void SetupEvents()
{
    _character.Interaction.EventFocus += OnFocus;
    _character.Interaction.EventInteract += OnInteract;
    _character.Interaction.EventBlur += OnBlur;
    _character.EventJump += OnJump;
    _character.EventDie += OnDie;
    _character.EventRevive += OnRevive;
    _character.Props.EventAdd += OnAddProp;
    _character.Props.EventRemove += OnRemoveProp;
    _character.EventAfterChangeModel += OnChangeModel;
    _character.Combat.Targets.EventCandidateAdd += OnAddTarget;
    _character.Combat.Targets.EventCandidateRemove += OnRemoveTarget;
    _character.Combat.Targets.EventChangeTarget += OnChangeTarget;
}
```

**这是同步的核心**：通过监听 GameCreator2 的事件，将单机事件转换为网络同步。

#### 3.3.2 事件同步示例 - 跳跃

```csharp
private void OnJump(int jumpCount)
{
    if (HasInputAuthority)
    {
        JumpCount = jumpCount; // 同步跳跃次数（NetworkProperty）
    }
}
```

**工作流程：**
1. 玩家按下跳跃键
2. GameCreator2 的 `Character` 触发 `EventJump`
3. `NetworkCharacter.OnJump` 捕获事件
4. 如果是输入权威（InputAuthority），更新 `JumpCount` 网络属性
5. Fusion 自动将 `JumpCount` 同步到所有客户端
6. 其他客户端根据 `JumpCount` 播放跳跃动画

#### 3.3.3 道具同步 - NetworkProp

```csharp
[Serializable]
public struct NetworkProp : INetworkStruct
{
    public NetworkPrefabRef prefabRef;
    public NetworkString<_32> bone;
    public Vector3 position;
    public Vector3 rotation;
}

private void OnAddProp(IdString propId, Prop prop)
{
    if (!HasStateAuthority) return;
    
    var networkProp = new NetworkProp
    {
        prefabRef = prop.PrefabRef,
        bone = prop.BoneName,
        position = prop.LocalPosition,
        rotation = prop.LocalRotation.eulerAngles
    };
    PropList.Add(propId.String, networkProp);
}
```

**道具同步流程：**
1. 角色装备武器（Prop）
2. `EventAdd` 触发
3. 权威端将 Prop 信息序列化为 `NetworkProp`
4. 添加到 `PropList` 网络字典
5. 客户端收到更新，从 `PropList` 读取并重建 Prop

### 3.4 NetworkCharacterController - 位置和旋转同步

```csharp
public sealed class NetworkCharacterController : NetworkTRSP, INetworkTRSPTeleport
{
    public Character character;
    public bool useRootMotionPosition = false;
    public bool useRootMotionRotation = false;
    
    [Networked] public Vector3 RootMotionDeltaPosition { get; set; }
    [Networked] public Quaternion RootMotionDeltaRotation { get; set; }
}
```

**NetworkTRSP** 是 Fusion 提供的 Transform 同步基类，优化了位置旋转同步。

**Root Motion 支持：**
- GameCreator2 的角色动画可以使用 Root Motion（动画驱动移动）
- `NetworkCharacterController` 捕获 Root Motion 数据并同步
- 客户端可以重放 Root Motion 或使用插值

**同步策略：**
```csharp
public override void FixedUpdateNetwork()
{
    if(!HasStateAuthority) return;
    
    RootMotionDeltaPosition = _character.Animim.RootMotionDeltaPosition / fixedDeltaTime;
    RootMotionDeltaRotation = _character.Animim.RootMotionDeltaRotation;
}

public override void Render()
{
    if (useRootMotionPosition) 
        transform.position += RootMotionDeltaPosition * fixedDeltaTime;
    if(useRootMotionRotation) 
        transform.rotation *= RootMotionDeltaRotation;
}
```

### 3.5 输入权威 vs 状态权威

| 概念 | 说明 | 应用 |
|------|------|------|
| **InputAuthority** | 控制输入的客户端 | 玩家控制的角色 |
| **StateAuthority** | 控制状态的权威端 | Server 或 Host |
| **Proxy** | 既无输入权威也无状态权威 | 其他玩家看到的角色 |

**代码示例：**
```csharp
public void InputAuthorityGained()
{
    LocalPlayer = this; // 设置本地玩家引用
    _character.Player.IsPlayer = true; // 标记为可控角色
}

private void SetupGameCreator()
{
    if (HasInputAuthority)
    {
        // 本地玩家：启用输入
        _character.enabled = true;
    }
    else
    {
        // 其他玩家：禁用输入，只同步表现
        _character.enabled = false;
    }
}
```

---

## 📡 Part 4: RPC 系统和 VisualScripting 集成

### 4.1 RPC 系统架构

**RPC (Remote Procedure Call)** 用于在不同客户端之间调用方法。NinjutsuGames 扩展了这个概念，将 GameCreator2 的可视化脚本（Trigger、Actions、Conditions）变成了网络化的执行单元。

### 4.2 RPCReceiver 基类

```csharp
public class RPCReceiver : NetworkBehaviour
{
    public enum RpcType { Trigger = 0, Actions = 1, Conditions = 2 }
    
    [Serializable]
    public struct NetworkRpc : INetworkStruct
    {
        public NetworkId NetworkId; // 目标对象的 NetworkId
        public int Type;            // RPC 类型
    }
    
    [Networked, Capacity(12)] 
    private NetworkDictionary<NetworkString<_32>, NetworkRpc> cachedRpcs => default;
}
```

**缓存机制**：
- `cachedRpcs` 存储需要持久化的 RPC 调用
- 新玩家加入时，会自动执行缓存的 RPC（确保状态一致）
- 适用场景：门已经被打开、Boss 已经被击败等持久化状态

### 4.3 RPC 调用流程

```csharp
public void RPC(RpcTargets target, NetworkId networkId, RpcType type, bool cacheState)
{
    if (cacheState)
    {
        TryAddCachedRpc(networkId, type); // 缓存调用
    }
    else
    {
        TryRemoveCachedRpc(networkId, type); // 移除缓存
    }
    
    // 根据目标选择不同的 RPC 方法
    if (target == RpcTargets.All)
    {
        RPC_All(networkId, (int)type);
    }
    else if (target == RpcTargets.Proxies)
    {
        RPC_Proxies(networkId, (int)type);
    }
    // ... 其他目标类型
}

[Rpc(RpcSources.All, RpcTargets.All, Channel = RpcChannel.Reliable)]
protected void RPC_All(NetworkId networkId, int type)
{
    ExecuteRpc(networkId, (RpcType)type); // 执行实际逻辑
}
```

**RpcTargets 详解：**
- **All**：所有客户端（包括服务器）
- **Proxies**：除了权威端外的所有客户端
- **InputAuthority**：拥有输入权威的客户端
- **StateAuthority**：拥有状态权威的客户端（通常是服务器）

### 4.4 VisualScripting 集成 - InstructionRpcTrigger

这是将 GameCreator2 的 Trigger 网络化的关键组件。

```csharp
[Title("Rpc Trigger")]
[Category("Fusion/Visual Scripting/Rpc Trigger")]
public class InstructionRpcTrigger : Instruction
{
    [SerializeField] private RpcTargets m_RpcTarget = RpcTargets.Proxies;
    [SerializeField] private PropertyGetBool m_CacheState = GetBoolFalse.Create;
    [SerializeField] private PropertyGetGameObject m_Trigger = GetGameObjectTrigger.Create();
    [SerializeField] private bool m_WaitToFinish = true;
    
    protected override async Task Run(Args args)
    {
        if(!NetworkManager.Runner.IsPlayer) return;
        if(args.Target.IsProxy()) return; // Proxy 不执行本地逻辑
        
        var networkObject = m_Trigger.Get<NetworkObject>(args);
        var trigger = m_Trigger.Get<Trigger>(args);
        
        if (!trigger || !networkObject)
        {
            Debug.LogError("Trigger or NetworkObject not found!");
            return;
        }
        
        // 调用 RPC
        NetworkDataManager.RPC(
            m_RpcTarget, 
            networkObject.Id, 
            RPCReceiver.RpcType.Trigger, 
            m_CacheState.Get(args)
        );
        
        // 可选：等待 Trigger 执行完成
        if (m_WaitToFinish) 
            await Until(() => !trigger.IsExecuting);
    }
}
```

**使用场景示例：**

假设你有一个宝箱，打开时需要播放动画并给所有玩家发送消息：

```
GameCreator2 Trigger 结构:
┌────────────────────────────┐
│ 1. Instruction: Play Animation │  ← 播放开箱动画
├────────────────────────────┤
│ 2. Instruction: RPC Trigger │  ← 网络化：告诉其他玩家
│    - Target: Proxies        │
│    - Cache: True            │
│    - Trigger: ChestOpened   │
├────────────────────────────┤
│ 3. Instruction: Add Item    │  ← 给玩家添加物品
└────────────────────────────┘
```

**执行流程：**
1. 玩家 A 打开宝箱，触发本地 Trigger
2. `Instruction: RPC Trigger` 发送 RPC 到其他玩家（Proxies）
3. 玩家 B/C/D 收到 RPC，执行 `ChestOpened` Trigger
4. 所有玩家看到开箱动画
5. 因为 `Cache: True`，后续加入的玩家也会看到宝箱已打开

### 4.5 NetworkDataManager - RPC 中转站

```csharp
public class NetworkDataManager : NetworkBehaviour
{
    public static void RPC(RpcTargets target, NetworkId networkObjectId, RPCReceiver.RpcType rpcType, bool cache)
    {
        if(NetworkCharacter.LocalPlayer)
        {
            NetworkCharacter.LocalPlayer.RPC(target, networkObjectId, rpcType, cache);
        }
        else if(NetworkPlayer.LocalPlayer)
        {
            NetworkPlayer.LocalPlayer.RPC(target, networkObjectId, rpcType, cache);
        }
    }
}
```

**设计思路：**
- 统一的 RPC 入口点
- 自动选择合适的网络对象发起 RPC
- 如果有本地角色，通过角色发送 RPC
- 否则通过 NetworkPlayer 发送

### 4.6 事件助手 - NetworkObjectSpawned/Despawned

```csharp
public class NetworkObjectSpawned : NetworkObjectBase, ISpawned
{
    public void Spawned()
    {
        TryRunTrigger(); // 对象生成时自动触发 Trigger
    }
}

public class NetworkObjectDespawned : NetworkObjectBase, IDespawned
{
    public void Despawned(NetworkRunner runner, bool hasState)
    {
        TryRunTrigger(); // 对象销毁时自动触发 Trigger
    }
}
```

**应用场景：**
- 敌人生成时播放特效
- 物品拾取后触发声音
- 建筑摧毁时触发爆炸效果

**使用方法：**
1. 在网络对象上添加 `NetworkObjectSpawned` 组件
2. 关联一个 `Trigger`
3. 对象生成时自动执行 Trigger（所有客户端）

---

## 🏗️ Part 5: 管理器和生命周期系统

### 5.1 NetworkManager - 网络连接的心脏

`NetworkManager` 是整个网络系统的核心单例，管理连接、会话和生命周期。

#### 5.1.1 核心职责

```csharp
public class NetworkManager : Singleton<NetworkManager>, INetworkRunnerCallbacks
{
    public static NetworkRunner Runner { get; }           // 主游戏 Runner
    public static NetworkRunner RunnerLobby { get; }      // 大厅 Runner
    public static bool IsConnected { get; }               // 是否已连接
    public static ConnectionArgs ConnectionArgs { get; }  // 连接参数
}
```

**双 Runner 架构：**
- **Runner**：主游戏会话
- **RunnerLobby**：大厅系统（用于会话列表、匹配等）

这种设计允许玩家在大厅中浏览会话，同时保持游戏会话独立运行。

#### 5.1.2 Runner 初始化

```csharp
private NetworkRunner GetNewRunner()
{
    var go = new GameObject("NetworkRunner");
    DontDestroyOnLoad(go);
    
    var runner = go.AddComponent<NetworkRunner>();
    runner.Add<NetworkSceneManagerDefault>();         // 场景管理
    var input = runner.Add<NetworkInputPooling>();    // 输入池化
    runner.Add<PooledNetworkObjectProvider>();        // 对象池
    runner.AddCallbacks(this, input);
    
    return runner;
}
```

**组件说明：**
- `NetworkSceneManagerDefault`：管理网络场景加载
- `NetworkInputPooling`：收集和分发玩家输入
- `PooledNetworkObjectProvider`：对象池管理器（提升性能）

#### 5.1.3 生命周期回调

```csharp
public void OnPlayerJoined(NetworkRunner runner, PlayerRef player)
{
    // 玩家加入时的处理
}

public void OnPlayerLeft(NetworkRunner runner, PlayerRef player)
{
    // 玩家离开时清理资源
}

public void OnShutdown(NetworkRunner runner, ShutdownReason shutdownReason)
{
    LastShutdownReason = shutdownReason;
    // 断线重连逻辑
}
```

### 5.2 PlayerManager - 玩家生命周期管理

```csharp
public class PlayerManager : NetworkBehaviour, IPlayerLeft, IPlayerJoined
{
    public static Dictionary<PlayerRef, NetworkCharacter> Avatars = new();
    public static Dictionary<PlayerRef, NetworkPlayer> Players = new();
    
    public static AvatarSpawnData AvatarSpawnData { get; set; }
}
```

#### 5.2.1 玩家数据 vs 角色分离

**设计理念：玩家和角色是两个独立概念**

| 组件 | 生命周期 | 职责 |
|------|----------|------|
| **NetworkPlayer** | 玩家连接期间持续存在 | 存储玩家账号信息、统计数据 |
| **NetworkCharacter** | 可以多次生成和销毁 | 代表游戏中的角色实体 |

**好处：**
- 玩家可以切换角色（死亡重生、更换职业）而不丢失账号数据
- 角色可以被观察者查看，而不暴露玩家账号信息
- 支持一个玩家控制多个角色（宠物、召唤物）

#### 5.2.2 生成流程

```csharp
public void PlayerJoined(PlayerRef inputAuthority)
{
    // 1. 生成玩家数据对象
    if (HasStateAuthority)
    {
        var playerData = Runner.Spawn(
            NetworkPrefabId.FromRaw(PLAYER_DATA_PREFAB_ID),
            Vector3.zero,
            Quaternion.identity,
            inputAuthority // 分配输入权威
        );
    }
    
    // 2. 生成角色（如果有预设的生成数据）
    TrySpawnAvatar();
}

private void TrySpawnAvatar()
{
    if (AvatarSpawnData == null) return;
    
    var avatar = Runner.Spawn(
        AvatarSpawnData.prefabId,
        AvatarSpawnData.position,
        AvatarSpawnData.rotation,
        inputAuthority
    );
    
    // 配置角色
    var networkCharacter = avatar.Get<NetworkCharacter>();
    networkCharacter.Token = AvatarSpawnData.token;
}
```

#### 5.2.3 Token 机制

```csharp
[Networked] public int Token { get; set; }

private readonly Dictionary<int, NetworkObject> _mapPlayerToken = new();
private readonly Dictionary<int, NetworkObject> _mapAvatarToken = new();
```

**Token 的作用：**
- **跨场景识别**：场景切换时通过 Token 识别同一个玩家
- **重连支持**：玩家掉线重连时，通过 Token 恢复角色控制权
- **数据关联**：将角色数据与玩家账号关联

**工作流程：**
```
1. 玩家连接 → 生成 NetworkPlayer (Token = 12345)
2. 生成角色 → NetworkCharacter (Token = 12345)
3. 场景切换 → 销毁旧角色，在新场景生成新角色 (Token = 12345)
4. 通过 Token 关联：找回玩家的数据和状态
```

### 5.3 NetworkDataManager - 共享数据管理

```csharp
public class NetworkDataManager : NetworkBehaviour
{
    [Networked] public int RandomSeed { get; set; }
    
    [Networked, Capacity(100)]
    public NetworkDictionary<NetworkId, CustomTickTimer> Timers => default;
}
```

#### 5.3.1 随机数同步

```csharp
private void InitSeed()
{
    if(HasStateAuthority) 
        RandomSeed = UnityEngine.Random.Range(10000, 99999);
    
    UnityEngine.Random.InitState(RandomSeed); // 所有客户端使用相同种子
}
```

**重要性：**
- 确保所有客户端的随机事件一致（暴击、掉落、技能触发）
- 避免 "客户端看到暴击，服务器没暴击" 的不一致问题

#### 5.3.2 网络化定时器

```csharp
public CustomTickTimer GetTimer(NetworkObject networkObject, float seconds)
{
    if(Timers.ContainsKey(networkObject.Id))
    {
        return Timers[networkObject.Id]; // 已存在
    }
    
    var newTimer = CustomTickTimer.CreateFromSeconds(Runner, seconds);
    Timers.Add(networkObject.Id, newTimer);
    return newTimer;
}

public override void FixedUpdateNetwork()
{
    foreach (var timer in Timers)
    {
        if(timer.Value.Expired(Runner))
        {
            RPC_TimerExpired(timer.Key); // 通知所有客户端
            Timers.Remove(timer.Key);
        }
    }
}
```

**应用场景：**
- Buff/Debuff 持续时间
- 技能冷却
- 复活倒计时
- 场景事件触发

### 5.4 完整生命周期示例

**场景：玩家加入游戏并控制角色**

```
时间线：
┌──────────────────────────────────────────────────────────────┐
│ T0: 玩家点击 "Join Game"                                      │
├──────────────────────────────────────────────────────────────┤
│ T1: NetworkManager.StartGame()                               │
│     - 连接到服务器                                            │
│     - 触发 OnPlayerJoined                                     │
├──────────────────────────────────────────────────────────────┤
│ T2: PlayerManager.PlayerJoined()                             │
│     - 服务器生成 NetworkPlayer 对象                           │
│     - 分配 Token = 12345                                      │
│     - 设置 Username                                           │
├──────────────────────────────────────────────────────────────┤
│ T3: PlayerManager.TrySpawnAvatar()                           │
│     - 服务器生成 NetworkCharacter 对象                        │
│     - Token = 12345 (关联到 NetworkPlayer)                   │
│     - 设置生成位置和旋转                                       │
├──────────────────────────────────────────────────────────────┤
│ T4: NetworkCharacter.Spawned()                               │
│     - 初始化 GameCreator2 Character 组件                      │
│     - 设置 InputAuthority (客户端可控制)                      │
│     - 注册事件监听                                            │
│     - 同步初始变量                                            │
├──────────────────────────────────────────────────────────────┤
│ T5: NetworkCharacter.InputAuthorityGained()                  │
│     - 客户端：启用输入                                        │
│     - 设置 LocalPlayer 引用                                   │
│     - 设置摄像机跟随                                          │
├──────────────────────────────────────────────────────────────┤
│ T6: 游戏运行中                                                │
│     - FixedUpdateNetwork: 同步移动输入                        │
│     - 事件触发: 同步跳跃、攻击、交互                          │
│     - 变量变化: 自动同步血量、蓝量                            │
│     - RPC: 执行技能、播放特效                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 总结：核心同步策略

### 同步方式选择指南

| 数据类型 | 推荐方式 | 原因 |
|---------|----------|------|
| 角色位置/旋转 | NetworkTransform / NetworkTRSP | 自动插值，节省带宽 |
| 角色属性（血量等） | LocalNameVariablesNetwork | 状态同步，自动变化检测 |
| 技能释放 | RPC | 瞬时事件，不需要持久化 |
| 门的开关状态 | RPC + Cache | 持久化状态，新玩家也能看到 |
| 随机事件 | 统一随机种子 | 保证确定性 |
| 动画触发 | 事件监听 + NetworkProperty | 通过状态同步驱动动画 |

### 架构优势

1. **非侵入式集成**：不修改 GameCreator2 源码，通过组件扩展实现
2. **事件驱动架构**：监听 GC2 事件，自动转换为网络消息
3. **状态同步优先**：减少 RPC 调用，提升性能和可靠性
4. **类型安全**：自定义数据结构确保网络数据的类型安全
5. **权限分离**：清晰区分 InputAuthority 和 StateAuthority
6. **可视化友好**：通过 VisualScripting 节点，设计师也能配置网络逻辑

### 最佳实践建议

1. **优先使用状态同步**：能用 `[Networked]` 属性就不用 RPC
2. **合理使用缓存**：持久化状态（门、宝箱）使用 RPC Cache
3. **避免频繁 RPC**：移动、攻击等高频事件用状态同步
4. **权限检查**：修改状态前检查 `HasStateAuthority`
5. **变量容量规划**：提前评估需要同步的变量数量（注意 Capacity 限制）

---

这个架构展示了如何将一个单机游戏框架（GameCreator2）优雅地扩展到多人网络环境。核心思想是：**监听单机事件 → 转换为网络数据 → 同步到其他客户端 → 重建游戏状态**。整个过程对游戏设计师透明，他们只需要使用 GameCreator2 的可视化工具，配合少量网络化节点即可实现多人功能。