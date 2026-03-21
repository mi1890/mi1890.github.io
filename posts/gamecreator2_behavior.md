## GameCreator Behavior 系统架构详解

### 一、整体架构概述

Behavior包是GameCreator的AI扩展库，实现了**四种主流AI决策系统**：

1. **Behavior Tree (行为树)** - 经典的层级行为决策
2. **State Machine (状态机)** - 基于状态转换的行为控制
3. **Action Plan (GOAP)** - 目标导向的动作规划
4. **Utility Board (效用板)** - 基于评分的动态任务选择

### 二、核心类架构

#### 2.1 核心组件 - Processor

```csharp
public class Processor : MonoBehaviour
```

**职责**：AI行为的执行器，挂载在GameObject上

**关键成员**：
- `Graph m_Graph` - 执行的图资源（可以是四种类型之一）
- `UpdateLoop m_Loop` - 循环模式（Never/Forever）
- `UpdateTime m_Update` - 更新时机（EveryFrame/Interval/Manual）
- `RuntimeData m_RuntimeData` - 运行时数据容器
- `Status m_GraphStatus` - 当前图的执行状态

**核心方法**：
- `Run()` - 主执行逻辑，每帧或按间隔调用
- `Tick()` - 手动执行一次（当UpdateTime.Manual时）
- `Restart()` - 重置图状态

**执行流程**：
```
Update() → Run() → Graph.Run(processor) → Node.Run() → 返回Status
```

#### 2.2 基类 - Graph

```csharp
public abstract class Graph : ScriptableObject
```

**职责**：所有AI图的抽象基类

**关键成员**：
- `TNode[] m_Nodes` - 节点数组
- `Parameters m_Data` - 黑板参数定义
- `Dictionary<IdString, TNode> m_NodeMap` - 节点ID映射
- `Dictionary<Connection, TNode> m_PortMap` - 端口连接映射

**核心方法**：
- `abstract Status Run(Processor processor)` - 执行图逻辑
- `abstract void Abort(Processor processor)` - 中止执行
- `GetFromNodeId(IdString)` - 通过ID获取节点
- `GetFromPortId(Connection)` - 通过端口获取节点

#### 2.3 运行时数据 - RuntimeData

```csharp
public class RuntimeData : TPolymorphicList<Parameter>
```

**职责**：管理运行时的黑板数据、节点状态和自定义值

**核心功能**：

1. **参数管理**（黑板系统）
```csharp
// 获取/设置参数值
object GetParameter(PropertyName id)
void SetParameter(PropertyName id, object value)
```

2. **节点状态管理**
```csharp
Status GetStatus(IdString nodeId)  // Ready/Running/Success/Failure
void SetStatus(IdString nodeId, Status status)
```

3. **自定义值存储**
```csharp
T GetValue<T>(IdString nodeId) where T : IValue
void SetValue<T>(IdString nodeId, T entry)
```

**数据同步**：`SyncData(Graph graph)` - 从Graph资源同步参数到运行时实例

### 三、四种AI系统详解

#### 3.1 Behavior Tree（行为树）

**文件位置**：BehaviorTree.cs

**核心特点**：
- 从Entry节点开始执行
- 树状结构，不允许循环
- 通过Composite和Decorator组织行为

**节点类型**：

1. **NodeBehaviorTreeEntry** - 入口节点
   - 只有一个输出端口
   - 执行连接的子节点

2. **NodeBehaviorTreeComposite** - 组合节点
   - 包含条件检查 `RunConditionsList`
   - 持有 `TComposite` 策略（Selector/Sequence等）
   - 支持Stop策略（立即停止/完成后停止）

3. **NodeBehaviorTreeDecorator** - 装饰器节点
   - 持有 `TDecorator` 策略（Invert/Repeat/WhileSuccess等）
   - 修改子节点的返回状态

4. **NodeBehaviorTreeTask** - 任务节点
   - 执行 `RunInstructionsList` 指令集
   - 可检查 `RunConditionsList` 条件

5. **NodeBehaviorTreeSubgraph** - 子图节点
   - 引用另一个BehaviorTree资产
   - 实现行为树的模块化

**Composite策略**：

```csharp
public abstract class TComposite
{
    public abstract Status Run(TNode node, Processor processor, Graph graph);
}
```

- **CompositeSelector**（选择器）：执行第一个成功的子节点
  - 遍历子节点直到找到Success或Running
  - 全部Failure则返回Failure

- **CompositeSequence**（序列）：顺序执行子节点
  - 遍历子节点直到遇到Failure或Running
  - 全部Success则返回Success

- **CompositeParallel**（并行）：同时执行所有子节点
  - 所有子节点都执行，不会提前终止

- **CompositeRandomSelector/Sequence**：随机打乱子节点顺序后执行

**Decorator策略**：

```csharp
public abstract class TDecorator
{
    public abstract bool Conditions(TNode node, Processor processor, Graph graph);
    public abstract Status Run(Status status, TNode node, Processor processor, Graph graph);
}
```

- **DecoratorInvert**（反转）：Success↔Failure
- **DecoratorRepeat**（重复）：重复执行N次
- **DecoratorWhileSuccess/Fail**：条件循环
- **DecoratorSuccess/Fail**：强制返回特定状态

**执行流程**：
```
BehaviorTree.Run() 
  → Entry节点.Run() 
    → Composite/Decorator/Task.Run()
      → 递归执行子节点
        → 返回Status
```

#### 3.2 State Machine（状态机）

**文件位置**：StateMachine.cs

**核心特点**：
- 基于状态转换的行为控制
- 每个状态可以有OnEnter/OnUpdate/OnExit指令
- 通过Transition连接状态

**关键节点**：

1. **NodeStateMachineEnter** - 入口状态（索引0）
   - 存储当前状态ID：`ValueStateMachineEnter.CurrentNodeId`
   - 初始化时从输出端口选择第一个可进入的状态

2. **NodeStateMachineExit** - 出口状态（索引1）
   - 当进入Exit状态时，整个状态机返回Success

3. **NodeStateMachineState** - 普通状态节点
   ```csharp
   [SerializeField] private RunInstructionsList m_OnEnter;    // 进入状态时执行
   [SerializeField] private RunInstructionsList m_OnExit;     // 离开状态时执行
   [SerializeField] private RunInstructionsList m_Instructions; // 每帧执行
   [SerializeField] private RunConditionsList m_Conditions;   // 进入条件
   [SerializeField] private Check m_Check; // EveryFrame/EveryCycle
   ```

4. **NodeStateMachineConditions** - 转换条件节点
   - 用于可视化连接线上的条件
   - 包含 `RunConditionsList`

5. **NodeStateMachineSubgraph** - 子状态机
   - 引用另一个StateMachine资产

**状态转换检查时机**：
- `Check.EveryFrame`：每帧检查是否可转换（在执行Instructions之前）
- `Check.EveryCycle`：只在Instructions完成后检查

**执行流程**：
```csharp
public override Status Run(Processor processor)
{
    TNode nodeEnter = this.m_Nodes[INDEX_ENTER];
    ValueStateMachineEnter value = nodeEnter.GetValue<ValueStateMachineEnter>(processor);
    
    if (value == null || value.CurrentNodeId == IdString.EMPTY)
    {
        // 首次执行，从Enter节点开始
        nodeEnter.Run(processor, this);
    }
    else
    {
        // 执行当前状态
        TNode currentNode = this.GetFromNodeId(value.CurrentNodeId);
        currentNode.Run(processor, this);
    }
    
    return nodeExit.GetStatus(processor) == Status.Success ? Status.Success : Status.Running;
}
```

**状态转换逻辑**：
```csharp
protected override Status Update(Processor processor, Graph graph)
{
    // 1. 检查是否可以转换到其他状态
    foreach (Connection connection in outputs.Connections)
    {
        if (candidate.TryRun(processor, graph, this.RunOnExit))
        {
            // 成功转换，执行当前状态的OnExit
            this.Abort(processor, graph);
            return Status.Ready;
        }
    }
    
    // 2. 如果是首次进入，执行OnEnter
    if (status == Status.Ready) this.RunOnEnter(processor);
    
    // 3. 执行OnUpdate（Instructions）
    this.RunOnUpdate(processor);
    
    return Status.Running;
}
```

#### 3.3 Action Plan（GOAP - Goal-Oriented Action Planning）

**文件位置**：ActionPlan.cs

**核心概念**：

这是最复杂的AI系统，实现了**目标导向的行动规划算法**。

**关键组成部分**：

1. **Thoughts（思考）** - 世界状态评估
```csharp
public class Thoughts : TPolymorphicList<Thought>
{
    public State Meditate(Processor processor)
    {
        State state = new State();
        foreach (Thought thought in this.m_List)
        {
            bool value = thought.GetValue(processor.Args);
            state.Set(thought.Name, value);
        }
        return state;
    }
}
```
- 评估当前世界状态
- 每个Thought是一个bool条件判断
- 生成State对象（Dictionary<string, bool>）

2. **Beliefs（信念）** - 前置/后置条件
```csharp
public class Beliefs : TPolymorphicList<Belief>
{
    // Belief { PropertyName Name, bool Value }
}
```
- 定义动作的前置条件（PreConditions）
- 定义动作的后置效果（PostConditions）

3. **Goal（目标）** - AI的追求目标
```csharp
public class Goal
{
    public PropertyName Name;  // 目标名称
    public float Weight;        // 目标权重
}
```

4. **Plan（计划）** - 规划结果
```csharp
public class Plan
{
    public List<IdString> Sequence;  // 动作序列
    public float Cost;                // 总成本
    public State CompleteState;       // 完成后的世界状态
    public float Weight;              // 计划权重（目标权重/成本）
}
```

**节点类型**：

1. **NodeActionPlanRoot** - 根节点
   - 存储目标列表和规划结果
   - 执行A*搜索算法生成计划
   - 按顺序执行计划中的任务

2. **TNodeActionPlanTask** - 任务节点基类
   ```csharp
   [SerializeField] protected PropertyGetDecimal m_Cost;  // 动作成本
   [SerializeField] protected RunConditionsList m_Conditions; // 执行条件
   ```
   - **NodeActionPlanTaskInstructions**：执行Instructions
   - **NodeActionPlanTaskSubgraph**：执行子图

3. **NodeActionPlanPreConditions** - 前置条件节点
   - 定义任务的前置条件（Beliefs）
   
4. **NodeActionPlanPostConditions** - 后置条件节点
   - 定义任务完成后的世界状态变化

**GOAP规划算法**（核心）：

```csharp
public void Plan(Processor processor, Graph graph)
{
    // 1. 评估当前世界状态
    State state = ((ActionPlan) graph).Thoughts.Meditate(processor);
    
    // 2. 为每个目标规划路径
    foreach (KeyValuePair<PropertyName, Goal> entry in this.m_Goals)
    {
        Plan plan = this.Plan(processor, graph, entry.Value, state);
        plan.GenerateWeight(this.m_Goals.Values);
        
        // 3. 选择权重最高的计划
        if (this.CurrentPlan.Exists && this.CurrentPlan.Weight > plan.Weight) continue;
        this.CurrentPlan = plan;
    }
}
```

**搜索路径算法**（深度优先搜索+回溯）：

```csharp
private bool SearchPath(Step parent, List<IdString> candidateIds, Goal goal, Processor processor, Graph graph)
{
    bool hasPath = false;
    
    foreach (IdString candidateId in candidateIds)
    {
        TNodeActionPlanTask candidate = graph.GetFromNodeId(candidateId);
        
        // 1. 检查当前状态是否满足任务的前置条件
        if (!candidate.ResolveBy(parent.ResolveState, graph)) continue;
        
        // 2. 应用任务的后置条件到状态
        State state = parent.ResolveState.Copy();
        state.Apply(candidate.GetPostConditions(graph));
        
        Step step = new Step(candidateId, parent, parent.Cost + candidate.GetCost(args), state);
        
        // 3. 检查是否达成目标
        if (state.Get(goal.Name.String))
        {
            this.m_EndingSteps.Add(step);
            hasPath = true;
        }
        else
        {
            // 4. 递归搜索（移除已使用的任务）
            List<IdString> subsetCandidates = CopyTasksSubset(candidateIds, candidateId);
            if (SearchPath(step, subsetCandidates, goal, processor, graph)) 
                hasPath = true;
        }
    }
    return hasPath;
}
```

**执行计划**：

```csharp
protected override Status Update(Processor processor, Graph graph)
{
    ValueActionPlanRoot data = this.GetValue<ValueActionPlanRoot>(processor);
    
    // 1. 如果没有计划或计划完成，重新规划
    if (status != Status.Running) data.Plan(processor, graph);
    
    // 2. 按顺序执行计划中的任务
    if (data.CurrentPlan.Exists)
    {
        foreach (IdString nodeId in plan.Sequence)
        {
            TNode node = graph.GetFromNodeId(nodeId);
            Status result = node.Run(processor, graph);
            if (result == Status.Running) return Status.Running;
            if (result == Status.Failure) return Status.Failure;
        }
        return Status.Success;
    }
    
    return Status.Failure; // 无可用计划
}
```

**添加/移除目标的API**：

```csharp
// 在运行时动态添加目标
actionPlan.AddGoal(new Goal { Name = "HasWeapon", Weight = 10f }, processor);

// 移除目标
actionPlan.RemoveGoal(goal, processor);
```

#### 3.4 Utility Board（效用板）

**文件位置**：UtilityBoard.cs

**核心特点**：
- 基于评分（Score）动态选择最优任务
- 每帧重新评估所有任务的分数
- 适合需要频繁切换优先级的AI

**评分系统**：

```csharp
public abstract class TNodeUtilityBoard : TNode
{
    [SerializeField] protected Score m_Score = new Score();
    [SerializeField] protected RunConditionsList m_Conditions;
    
    public float RecalculateScore(Processor processor, Graph graph)
    {
        return this.m_Score.GetValue(processor.Args, graph as UtilityBoard);
    }
}
```

**Score类**（基于曲线的评分）：

```csharp
public class Score
{
    [SerializeField] private AnimationCurve m_Curve;
    [SerializeField] private PropertyGetDecimal m_Input;
    
    public float GetValue(Args args, UtilityBoard utilityBoard)
    {
        float input = (float) this.m_Input.Get(args);
        float min = utilityBoard.GetMinimum(args);
        float max = utilityBoard.GetMaximum(args);
        
        float normalized = Mathf.InverseLerp(min, max, input);
        return this.m_Curve.Evaluate(normalized);
    }
}
```

**任务选择算法**：

```csharp
public override Status Run(Processor processor)
{
    ValueUtilityBoardRoot rootData = root.GetValue<ValueUtilityBoardRoot>(processor);
    IdString runningNodeId = rootData.RunningNodeId;
    
    float maxScore = float.MinValue;
    TNodeUtilityBoard maxNode = null;
    
    // 1. 评估所有任务的分数
    for (int i = 1; i < this.m_Nodes.Length; i++)
    {
        if (this.m_Nodes[i] is not TNodeUtilityBoard nodeUtilityBoard) continue;
        
        float score = nodeUtilityBoard.RecalculateScore(processor, this);
        
        // 2. 检查条件并选择最高分
        if (score > maxScore && nodeUtilityBoard.CheckConditions(processor.Args))
        {
            maxScore = score;
            maxNode = nodeUtilityBoard;
        }
    }
    
    if (maxNode == null) return Status.Success;
    
    // 3. 如果最优任务改变，中止旧任务
    if (runningNodeId != IdString.EMPTY && maxNode.Id != runningNodeId)
    {
        TNode cancelNode = this.GetFromNodeId(runningNodeId);
        cancelNode?.Abort(processor, this);
    }
    
    // 4. 执行最优任务
    rootData.RunningNodeId = maxNode.Id;
    return maxNode.Run(processor, this);
}
```

**节点类型**：

1. **NodeUtilityBoardTask** - 任务节点
   ```csharp
   [SerializeField] private RunInstructionsList m_OnExit;
   [SerializeField] private RunInstructionsList m_Instructions;
   ```

2. **NodeUtilityBoardSubgraph** - 子效用板

**使用场景**：
- NPC日常行为（吃饭、睡觉、巡逻等，根据饥饿度、疲劳度动态选择）
- 敌人战术选择（攻击、防御、逃跑，根据生命值、距离、弹药量评分）

### 四、编辑器实现详解

#### 4.1 图形编辑器架构

**核心类**：`TGraphTool` - 图形编辑器基类

**UI层级**：
```
TGraphWindow（窗口）
  └─ TGraphTool（图工具）
      ├─ GraphGrid（网格背景）
      ├─ TGraphWires（连接线）
      ├─ GraphView（视图容器）
      │   └─ TNodeTool（节点可视化）
      │       ├─ TPortTool（端口）
      │       └─ VisualElement（节点内容）
      └─ GraphSelect（选择框）
```

**Manipulator系统**（交互处理器）：

1. **ManipulatorGraphPan** - 平移视图
2. **ManipulatorGraphZoom** - 缩放视图
3. **ManipulatorGraphMenu** - 右键菜单
4. **ManipulatorGraphSelect** - 框选节点
5. **ManipulatorNodeDrag** - 拖拽节点
6. **ManipulatorNodeHover** - 鼠标悬停
7. **ManipulatorNodeSelect** - 选择节点

**节点工具类**：`TNodeTool`

```csharp
internal abstract class TNodeTool : VisualElement
{
    [NonSerialized] private readonly VisualElement m_Wrap;
    [NonSerialized] protected readonly VisualElement m_Head;  // 节点头部
    [NonSerialized] protected readonly VisualElement m_Body;  // 节点主体
    [NonSerialized] protected readonly VisualElement m_Foot;  // 节点底部
    
    public Vector2 Position { get; set; }  // 节点位置
    public SerializedProperty Property { get; }  // 序列化数据
    
    public TPortTool[] InputPortTools { get; }   // 输入端口
    public TPortTool[] OutputPortTools { get; }  // 输出端口
}
```

**端口连接逻辑**：

```csharp
public void ConnectPortTools(TPortTool a, TPortTool b)
{
    // 1. 验证连接有效性
    if (a.NodeTool == b.NodeTool) return;  // 不能自连
    if (portA.Mode == portB.Mode) return;   // 必须Input↔Output
    
    // 2. 检查循环（BehaviorTree不允许）
    if (!this.AllowCycles)
    {
        if (GraphUtils.CanReach(this, inputPortTool.NodeTool, outputNodeId)) return;
    }
    
    // 3. 处理单连接限制
    if (inputPort.Allowance == PortAllowance.Single) 
        this.RemovePortsTo(inputPortTool.PortId);
    
    // 4. 添加连接
    outputPortTool.Connections.InsertArrayElementAtIndex(connectionsCount);
    // ...
}
```

**窗口类**：`TGraphWindow`

四种窗口类：
- `WindowBehaviorTree`
- `WindowStateMachine`
- `WindowActionPlan`
- `WindowUtilityBoard`

**打开窗口**：
```csharp
[MenuItem("Window/Game Creator/Behavior/Behavior Tree")]
public static void Open()
{
    Graph asset = Selection.activeObject as Graph;
    Open(asset as BehaviorTree);
}
```

**页面管理**（多标签）：
```csharp
protected List<TGraphTool> m_Pages;  // 打开的图页面
public void NewPage(Graph graph, bool silent = false)
public void Backtrack(int keepAmount)
```

#### 4.2 Inspector编辑器

**ProcessorEditor** - Processor组件的Inspector

```csharp
[CustomEditor(typeof(Processor), true)]
public class ProcessorEditor : UnityEditor.Editor
{
    public override VisualElement CreateInspectorGUI()
    {
        // 显示：
        // - Graph资产引用
        // - UpdateLoop/UpdateTime
        // - RuntimeData参数列表
        // - "Refresh Parameters"按钮
    }
    
    private void SyncData()
    {
        Processor processor = this.target as Processor;
        processor.EditorSyncData();  // 同步黑板参数
    }
}
```

**GraphEditor** - Graph资产的Inspector

```csharp
public abstract class GraphEditor : UnityEditor.Editor
{
    public override VisualElement CreateInspectorGUI()
    {
        // 显示 "Open {TypeName}" 按钮
        Button buttonOpen = new Button(this.OpenGraph);
    }
    
    protected abstract void OpenGraph();  // 打开对应的图形编辑器窗口
}
```

#### 4.3 Drawer（属性绘制器）

**关键Drawer**：
- `BeliefDrawer` - 绘制Belief（Name + Value）
- `ThoughtDrawer` - 绘制Thought条件
- `ScoreDrawer` - 绘制Score曲线编辑器
- `ParameterDrawer` - 绘制黑板参数

### 五、关键设计模式

#### 5.1 策略模式

**TComposite / TDecorator**：
```csharp
// 策略接口
public abstract class TComposite
{
    public abstract Status Run(TNode node, Processor processor, Graph graph);
}

// 具体策略
public class CompositeSelector : TComposite { ... }
public class CompositeSequence : TComposite { ... }

// 使用策略
[SerializeReference] private TComposite m_Composite = new CompositeSelector();
```

好处：
- 运行时可切换行为
- 易于扩展新策略
- 支持序列化（SerializeReference）

#### 5.2 访问者模式

**节点遍历**：
```csharp
public Status Run(Processor processor, Graph graph)
{
    // 递归访问子节点
    TNode subNode = graph.GetFromPortId(connection);
    return subNode?.Run(processor, graph);
}
```

#### 5.3 命令模式

**RunInstructionsList / RunConditionsList**：
```csharp
[SerializeField] private RunInstructionsList m_Instructions;

// 执行
RunnerConfig config = new RunnerConfig { Name = "Update" };
m_Instructions.Run(processor.Args, config);
```

#### 5.4 状态模式

**Status枚举**驱动状态机：
```csharp
public enum Status
{
    Ready,    // 未开始
    Running,  // 执行中
    Success,  // 成功
    Failure   // 失败
}
```

#### 5.5 对象池模式

**IValue接口**：运行时值的缓存
```csharp
public interface IValue
{
    void Restart();  // 重置值
}

// 使用
T GetValue<T>(IdString nodeId) where T : class, IValue
void SetValue<T>(IdString nodeId, T entry)
```

### 六、高级特性

#### 6.1 子图系统（Subgraph）

**支持嵌套图**：
```csharp
public abstract class TNode
{
    public virtual Graph Subgraph => null;  // 子图引用
}

public class NodeBehaviorTreeSubgraph : TNodeBehaviorTree
{
    [SerializeField] private BehaviorTree m_BehaviorTree;
    public override Graph Subgraph => this.m_BehaviorTree;
}
```

**参数级联同步**：
```csharp
private void SyncData(ISet<Graph> previousAssets, Graph asset, List<Parameter> parameters)
{
    // 递归同步所有子图的参数
    foreach (TNode node in asset.Nodes)
    {
        Graph subgraph = node?.Subgraph;
        if (subgraph == null) continue;
        SyncData(previousAssets, subgraph, parameters);
    }
}
```

#### 6.2 黑板系统（Blackboard）

**Parameters定义**（在Graph资产中）：
```csharp
public class Parameters : TPolymorphicList<Parameter>
{
    [SerializeReference] private Parameter[] m_List;
}

public class Parameter
{
    public PropertyName Name;     // 参数名
    public IdString TypeID;       // 类型ID
    public object Value { get; set; }  // 值
}
```

**RuntimeData覆盖**：
```csharp
[SerializeReference] private Parameter[] m_Overrides;  // 实例级参数覆盖

public void OnStartup(Graph graph)
{
    // 从Graph同步参数定义
    this.SyncData(graph);
    
    // 应用实例覆盖值
    foreach (Parameter entry in this.m_Overrides)
    {
        this.m_Parameters[entry.Name] = entry.Copy as Parameter;
    }
}
```

**使用示例**：
```csharp
// 设置参数
processor.RuntimeData.SetParameter("Speed", 5.0f);

// 获取参数
float speed = (float)processor.RuntimeData.GetParameter("Speed");
```

#### 6.3 Visual Scripting集成

**Instructions/Conditions**：
```csharp
// Instruction示例
public class InstructionProcessorUpdate : Instruction
{
    [SerializeField] private PropertyGetGameObject m_Processor;
    
    protected override Task Run(Args args)
    {
        Processor processor = this.m_Processor.Get<Processor>(args);
        processor?.Tick();
        return DefaultResult;
    }
}

// Condition示例
public class ConditionProcessorIsRunning : Condition
{
    [SerializeField] private PropertyGetGameObject m_Processor;
    
    protected override bool Check(Args args)
    {
        Processor processor = this.m_Processor.Get<Processor>(args);
        return processor != null && processor.Status == Status.Running;
    }
}
```

**添加/移除目标**：
```csharp
public class InstructionActionPlanAddGoal : Instruction
{
    [SerializeField] private PropertyGetGameObject m_Processor;
    [SerializeField] private Goal m_Goal;
    
    protected override Task Run(Args args)
    {
        Processor processor = this.m_Processor.Get<Processor>(args);
        ActionPlan actionPlan = processor.Graph as ActionPlan;
        actionPlan?.AddGoal(this.m_Goal, processor);
        
        return DefaultResult;
    }
}
```

#### 6.4 运行时调试

**状态可视化**：
```csharp
// 编辑器中实时显示节点状态
protected override void RefreshRuntime()
{
    if (!EditorApplication.isPlaying) return;
    
    Status status = this.Node.GetStatus(processor);
    
    // 根据状态改变边框颜色
    this.m_Wrap.style.borderTopColor = status switch
    {
        Status.Running => Color.yellow,
        Status.Success => Color.green,
        Status.Failure => Color.red,
        _ => Color.grey
    };
}
```

**事件系统**：
```csharp
public class Processor : MonoBehaviour
{
    public event Action EventBeforeIteration;  // 迭代前
    public event Action EventAfterIteration;   // 迭代后
    public event Action EventStart;            // 开始执行
    public event Action EventFinish;           // 执行完成
}

// 使用
processor.EventStart += () => Debug.Log("AI Started!");
```

### 七、使用示例

#### 示例1：创建简单Behavior Tree

```csharp
// 1. 创建资产
BehaviorTree tree = CreateInstance<BehaviorTree>();
AssetDatabase.CreateAsset(tree, "Assets/AI/MyBehaviorTree.asset");

// 2. 添加到GameObject
GameObject npc = new GameObject("NPC");
Processor processor = npc.AddComponent<Processor>();
processor.Graph = tree;
processor.UpdateLoop = UpdateLoop.Forever;
processor.UpdateTime = UpdateTime.EveryFrame;

// 3. 在编辑器中设计树结构
// Entry → Selector
//   ├─ Sequence (逃跑)
//   │   ├─ Condition: Health < 20%
//   │   └─ Task: RunAway
//   └─ Sequence (攻击)
//       ├─ Condition: EnemyInRange
//       └─ Task: Attack
```

#### 示例2：GOAP目标规划

```csharp
// 定义Thoughts（世界状态评估）
Thought hasWeapon = new ThoughtConditionsValue {
    Name = "HasWeapon",
    Conditions = new RunConditionsList()  // 检查是否持有武器
};

// 定义Task及其前置/后置条件
// Task: GetWeapon
//   PreConditions: WeaponAvailable = true
//   PostConditions: HasWeapon = true
//   Cost: 5

// Task: AttackEnemy
//   PreConditions: HasWeapon = true, EnemyNear = true
//   PostConditions: EnemyDead = true
//   Cost: 2

// 添加目标
Goal goal = new Goal {
    Name = "EnemyDead",
    Weight = 10f
};
actionPlan.AddGoal(goal, processor);

// GOAP会自动规划：
// GetWeapon → AttackEnemy
```

#### 示例3：Utility Board动态任务

```csharp
// Task 1: Eat
Score eatScore = new Score();
eatScore.Curve = AnimationCurve.Linear(0, 0, 1, 1);
eatScore.Input = GetDecimalLocalListVariable.Create("Hunger");

// Task 2: Sleep  
Score sleepScore = new Score();
sleepScore.Curve = AnimationCurve.Linear(0, 0, 1, 1);
sleepScore.Input = GetDecimalLocalListVariable.Create("Tiredness");

// 每帧自动选择分数最高的任务
// Hunger = 0.8, Tiredness = 0.3 → 执行Eat
// Hunger = 0.2, Tiredness = 0.9 → 执行Sleep
```

### 八、性能优化建议

1. **避免频繁规划**（GOAP）
   ```csharp
   // 使用Interval更新而非EveryFrame
   processor.UpdateTime = UpdateTime.Interval;
   processor.Interval = 0.5f;  // 每0.5秒规划一次
   ```

2. **减少Thought数量**（GOAP）
   - 只评估关键的世界状态
   - 合并相似的Thought

3. **限制并行节点数**（Behavior Tree）
   - CompositeParallel会同时执行所有子节点

4. **使用子图复用**
   - 避免重复创建相同的节点结构

5. **条件检查优化**
   - 将代价高的条件放在后面（短路评估）

### 九、扩展开发

#### 自定义Composite

```csharp
[Title("My Composite")]
[Category("Custom")]
[Serializable]
public class MyCustomComposite : TComposite
{
    public override Status Run(TNode node, Processor processor, Graph graph)
    {
        // 实现自定义逻辑
        return Status.Success;
    }
}
```

#### 自定义Decorator

```csharp
[Title("My Decorator")]
[Category("Custom")]
[Serializable]
public class MyCustomDecorator : TDecorator
{
    public override bool Conditions(TNode node, Processor processor, Graph graph)
    {
        return true;  // 何时执行子节点
    }

    public override Status Run(Status status, TNode node, Processor processor, Graph graph)
    {
        return status;  // 如何修改子节点状态
    }
}
```

#### 自定义节点类型

```csharp
[Serializable]
public class MyCustomNode : TNodeBehaviorTree
{
    public const string TYPE_ID = "custom:my-node";
    
    public override PropertyName TypeId => TYPE_ID;
    
    protected override Status Update(Processor processor, Graph graph)
    {
        // 节点逻辑
        return Status.Success;
    }
    
    protected override void Cancel(Processor processor, Graph graph)
    {
        // 中止逻辑
    }
}
```

### 十、总结

GameCreator Behavior包是一个**功能完整、架构优雅**的AI系统框架，核心优势：

1. **多样性**：提供4种主流AI决策系统，覆盖大部分游戏AI需求
2. **可视化**：强大的图形编辑器，所见即所得
3. **模块化**：节点化设计，易于组合和复用
4. **扩展性**：策略模式+继承体系，方便自定义
5. **集成性**：与GameCreator的Visual Scripting无缝集成
6. **性能**：运行时数据分离，支持参数覆盖和状态缓存

**适用场景**：
- **Behavior Tree**：通用AI行为，层级决策
- **State Machine**：明确的状态转换（角色动作、UI流程）
- **Action Plan（GOAP）**：复杂的目标规划（策略游戏、模拟游戏）
- **Utility Board**：动态优先级任务（NPC日常、战术选择）

这个系统的设计充分体现了**高内聚、低耦合**的软件工程原则，是学习Unity工具开发和AI系统设计的优秀范例。