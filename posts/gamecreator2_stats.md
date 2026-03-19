# GameCreator Stats 数值扩展库 - 详细分析

## 📋 目录
1. [系统概述](#系统概述)
2. [核心架构](#核心架构)
3. [核心类详解](#核心类详解)
4. [数值计算系统](#数值计算系统)
5. [状态效果系统](#状态效果系统)
6. [数据持久化](#数据持久化)
7. [可视化脚本集成](#可视化脚本集成)
8. [使用示例](#使用示例)

---

## 系统概述

**GameCreator Stats** 是一个完整的 RPG 数值系统扩展库，提供了角色属性、状态效果、数值修改器等核心功能。

### 主要特性
- ✅ **Stats (属性)**：基础数值属性（力量、敏捷等）
- ✅ **Attributes (特性)**：带范围的动态数值（生命值、魔法值等）
- ✅ **Status Effects (状态效果)**：临时增益/减益效果系统
- ✅ **Formula (公式)**：强大的数学表达式计算引擎
- ✅ **Modifiers (修改器)**：数值加成系统（常量/百分比）
- ✅ **Table (等级表)**：经验值与等级进度系统
- ✅ **Class (职业)**：角色职业定义系统

---

## 核心架构

### 1. 系统层次结构

```
Traits (组件 - 游戏对象上)
├── Class (ScriptableObject - 职业定义)
│   ├── AttributeList (属性列表)
│   └── StatList (状态列表)
│
├── RuntimeAttributes (运行时属性管理)
│   └── RuntimeAttributeData[] (各个属性的运行时数据)
│
├── RuntimeStats (运行时状态管理)
│   └── RuntimeStatData[] (各个状态的运行时数据)
│       └── Modifiers (修改器列表)
│           ├── Constants (常量修改器)
│           └── Percentages (百分比修改器)
│
└── RuntimeStatusEffects (运行时状态效果管理)
    └── RuntimeStatusEffectList[] (各个效果的实例列表)
        └── RuntimeStatusEffectData[] (堆叠的效果数据)
```

### 2. 核心数据流

```
ScriptableObject 定义层 (设计时)
    ↓
Traits 组件 (游戏对象)
    ↓
Runtime 数据层 (运行时实例)
    ↓
数值计算 & 事件触发
    ↓
UI / 游戏逻辑
```

---

## 核心类详解

### 1. Traits 组件 (核心枢纽)

**位置**: `Runtime/Components/Traits.cs`

```csharp
public class Traits : MonoBehaviour, ISerializationCallbackReceiver
{
    // 职业定义
    [SerializeField] private Class m_Class;
    
    // 覆盖数据（用于在 Inspector 中自定义初始值）
    [SerializeField] private OverrideAttributes m_OverrideAttributes;
    [SerializeField] private OverrideStats m_OverrideStats;
    
    // 运行时数据容器
    [NonSerialized] private RuntimeStats m_RuntimeStats;
    [NonSerialized] private RuntimeAttributes m_RuntimeAttributes;
    [NonSerialized] private RuntimeStatusEffects m_RuntimeStatusEffects;
    
    // 全局变更事件
    public event Action EventChange;
}
```

**关键职责**：
1. **组件入口**：挂载到游戏对象上，提供数值系统访问接口
2. **数据初始化**：在 `Awake` 时根据 `Class` 初始化所有运行时数据
3. **生命周期管理**：在 `Update` 中更新状态效果
4. **序列化处理**：在编辑器中同步 Class 变化

**初始化流程**：
```csharp
private void Awake()
{
    this.RuntimeInitStats();        // 初始化属性
    this.RuntimeInitAttributes();   // 初始化特性
    this.RuntimeInitStatusEffects(); // 初始化状态效果
}

private void RuntimeInitStats()
{
    // 1. 检查是否已初始化
    if (this.m_RuntimeStats != null) return;
    
    // 2. 验证 Class 引用
    if (this.m_Class == null) {
        this.m_RuntimeStats = new RuntimeStats(this);
        Debug.LogError("Traits component has no Class reference");
        return;
    }
    
    // 3. 创建运行时数据（应用覆盖值）
    this.m_RuntimeStats = new RuntimeStats(this, this.m_OverrideStats);
    
    // 4. 订阅变更事件
    this.m_RuntimeStats.EventChange += _ => this.EventChange?.Invoke();
}
```

---

### 2. Class (职业定义)

**位置**: `Runtime/ScriptableObjects/Class.cs`

```csharp
[CreateAssetMenu(fileName = "Class", menuName = "Game Creator/Stats/Class")]
public class Class : ScriptableObject
{
    [SerializeField] private PropertyGetString m_Class;
    [SerializeField] private PropertyGetString m_Description;
    [SerializeField] private PropertyGetSprite m_Sprite;
    [SerializeField] private PropertyGetColor m_Color;
    
    // 定义该职业拥有的属性和状态
    [SerializeField] private AttributeList m_Attributes;
    [SerializeField] private StatList m_Stats;
}
```

**设计理念**：
- 作为 **模板** 定义角色的基础数值结构
- 每个 Class 可以定义不同的 Attributes 和 Stats 组合
- 例如：战士职业有"力量"、"生命值"，法师有"智力"、"魔法值"

**使用场景**：
```
战士职业 (Warrior Class)
├── Attributes
│   ├── Health (生命值: 0-100)
│   └── Stamina (耐力: 0-50)
└── Stats
    ├── Strength (力量: 基础值 10)
    └── Defense (防御: 基础值 5)

法师职业 (Mage Class)
├── Attributes
│   ├── Health (生命值: 0-60)
│   └── Mana (魔法值: 0-100)
└── Stats
    ├── Intelligence (智力: 基础值 15)
    └── Wisdom (智慧: 基础值 12)
```

---

### 3. Stat (属性)

**位置**: `Runtime/ScriptableObjects/Stat.cs`

```csharp
[CreateAssetMenu(fileName = "Stat", menuName = "Game Creator/Stats/Stat")]
public class Stat : ScriptableObject
{
    [SerializeField] private IdString m_ID;        // 唯一标识
    [SerializeField] private StatData m_Data;      // 数据
    [SerializeField] private StatInfo m_Info;      // 显示信息
}

[Serializable]
public class StatData
{
    [SerializeField] private double m_Base = 0;      // 基础值
    [SerializeField] private Formula m_Formula = null; // 可选公式
}
```

**Stat 特点**：
- **静态基础值**：不会自动变化（除非通过代码修改）
- **支持修改器**：可以添加常量/百分比修改器
- **支持公式**：可以通过 Formula 动态计算最终值
- **无上下限**：数值范围不受限制

**计算优先级**：
```
最终值 = ((Formula ? Formula.Calculate() : Base) * (1 + 百分比修改器总和)) + 常量修改器总和
```

---

### 4. Attribute (特性)

**位置**: `Runtime/ScriptableObjects/Attribute.cs`

```csharp
[CreateAssetMenu(fileName = "Attribute", menuName = "Game Creator/Stats/Attribute")]
public class Attribute : ScriptableObject
{
    [SerializeField] private IdString m_ID;
    [SerializeField] private AttributeData m_Data;
    [SerializeField] private AttributeInfo m_Info;
}

[Serializable]
public class AttributeData
{
    [SerializeField] private double m_MinValue;      // 最小值
    [SerializeField] private Stat m_MaxValue;        // 最大值（引用 Stat）
    [SerializeField] [Range(0f, 1f)] private float m_StartPercent = 1f; // 初始百分比
}
```

**Attribute 特点**：
- **动态范围值**：有明确的最小值和最大值
- **最大值动态关联**：`MaxValue` 引用一个 Stat，当 Stat 变化时，Attribute 的最大值也会变化
- **常用于消耗型数值**：生命值、魔法值、耐力等
- **百分比初始化**：`StartPercent` 决定初始时处于范围的哪个位置

**使用示例**：
```
生命值 Attribute
├── MinValue: 0
├── MaxValue: → 体质 Stat (假设当前值 = 100)
└── StartPercent: 1.0 (100%)

初始 Value = 0 + (100 - 0) * 1.0 = 100

如果体质 Stat 提升到 150：
MaxValue 自动变为 150
当前 Value 如果是 80，则保持 80 (不会自动填满)
```

---

### 5. RuntimeStatData (运行时属性数据)

**位置**: `Runtime/Classes/Traits/Stats/RuntimeStatData.cs`

```csharp
public class RuntimeStatData
{
    private readonly GameObject m_Self;
    private readonly Stat m_Stat;
    private readonly Modifiers m_Modifiers;  // 修改器容器
    
    private double m_Base;                    // 当前基础值
    private readonly Formula m_Formula;       // 公式引用
    
    // 核心属性
    public double Base { get; set; }          // 基础值（可修改）
    public double Value { get; }              // 最终值（计算得出）
    public double ModifiersValue { get; }     // 修改器贡献值
    
    public event Action<IdString, double> EventChange;
}
```

**Value 计算逻辑**：
```csharp
public double Value
{
    get
    {
        // 1. 先获取基础值（公式优先）
        double value = this.m_Formula != null && this.m_Formula.Exists
            ? this.m_Formula.Calculate(this.m_Self, this.m_Self)
            : this.m_Base;

        // 2. 应用修改器
        return this.m_Modifiers.Calculate(value);
    }
}
```

**修改器操作**：
```csharp
// 添加常量修改器 (+15 力量)
runtimeStat.AddModifier(ModifierType.Constant, 15);

// 添加百分比修改器 (+20% 力量)
runtimeStat.AddModifier(ModifierType.Percent, 0.2);

// 移除修改器
runtimeStat.RemoveModifier(ModifierType.Constant, 15);

// 清空所有修改器
runtimeStat.ClearModifiers();
```

---

### 6. RuntimeAttributeData (运行时特性数据)

**位置**: `Runtime/Classes/Traits/Attributes/RuntimeAttributeData.cs`

```csharp
public class RuntimeAttributeData
{
    private readonly Traits m_Traits;
    private readonly Attribute m_Attribute;
    
    private readonly double m_MinValue;       // 固定最小值
    private readonly Stat m_MaxValue;         // 最大值引用的 Stat
    private double m_Value;                   // 当前值
    
    // 属性
    public double MinValue => this.m_MinValue;
    public double MaxValue => this.m_MaxValue != null
        ? this.m_Traits.RuntimeStats.Get(this.m_MaxValue.ID).Value
        : 0f;
    
    public double Value { get; set; }         // 自动 Clamp
    public double Ratio => (this.Value - this.MinValue) / (this.MaxValue - this.MinValue);
    
    public event Action<IdString, double> EventChange;
}
```

**Value 自动限制**：
```csharp
public double Value
{
    get => this.m_Value;
    set
    {
        double oldValue = this.Value;
        double newValue = Math.Clamp(value, this.MinValue, this.MaxValue);
        if (Math.Abs(this.m_Value - newValue) < float.Epsilon) return;

        this.m_Value = newValue;
        this.EventChange?.Invoke(this.m_Attribute.ID, newValue - oldValue);
    }
}
```

**动态最大值监听**：
```csharp
public RuntimeAttributeData(Traits traits, AttributeItem attribute)
{
    // ... 初始化 ...
    
    // 如果 MaxValue 引用了一个 Stat，监听其变化
    if (this.m_MaxValue != null)
    {
        traits.RuntimeStats.EventChange += this.RecalculateValue;
    }
}

private void RecalculateValue(IdString statID)
{
    // 当关联的 Stat 改变时，重新 Clamp 当前值
    double value = Math.Clamp(this.m_Value, this.MinValue, this.MaxValue);
    if (Math.Abs(this.Value - value) < float.Epsilon) return;
    
    this.Value = this.m_Value; // 触发 Clamp 和事件
}
```

---

### 7. Modifiers (修改器系统)

**位置**: `Runtime/Classes/Modifiers/Modifiers.cs`

```csharp
internal class Modifiers
{
    [NonSerialized] private ModifierList m_Percentages;  // 百分比修改器
    [NonSerialized] private ModifierList m_Constants;    // 常量修改器
    
    public double Calculate(double value)
    {
        // 先计算百分比，再加常量
        value *= 1f + this.m_Percentages.Value;
        value += this.m_Constants.Value;
        return value;
    }
}
```

**计算示例**：
```
假设某个 Stat 的 Base = 100

添加修改器：
- 常量 +20
- 百分比 +15% (0.15)
- 常量 +10
- 百分比 +10% (0.10)

计算过程：
1. value = 100 * (1 + 0.15 + 0.10) = 100 * 1.25 = 125
2. value = 125 + 20 + 10 = 155

最终值 = 155
```

**ModifierList 内部实现**：
```csharp
internal class ModifierList
{
    private int m_StatID;
    private List<Modifier> m_List;
    
    public double Value
    {
        get
        {
            double value = 0;
            foreach (Modifier modifier in this.m_List)
            {
                if (modifier.StatID == this.m_StatID)
                {
                    value += modifier.Value;
                }
            }
            return value;
        }
    }
    
    public void Add(double value)
    {
        this.m_List.Add(new Modifier(this.m_StatID, value));
    }
    
    public bool Remove(double value)
    {
        for (int i = 0; i < this.m_List.Count; ++i)
        {
            if (Math.Abs(this.m_List[i].Value - value) < float.Epsilon)
            {
                this.m_List.RemoveAt(i);
                return true;
            }
        }
        return false;
    }
}
```

---

## 数值计算系统

### 1. Formula (公式系统)

**位置**: `Runtime/ScriptableObjects/Formula.cs`

Formula 是一个强大的数学表达式解析器，支持：
- ✅ 基础算术运算：`+`, `-`, `*`, `/`, `%`, `^`
- ✅ 数学函数：`sqrt`, `sin`, `cos`, `tan`, `floor`, `ceil`, `round`, `min`, `max`
- ✅ 随机函数：`random(min, max)`, `dice(count, sides)`, `chance(probability)`
- ✅ 变量引用：访问 Source/Target 的属性和变量
- ✅ 表格查询：`table.level`, `table.value` 等

```csharp
[CreateAssetMenu(fileName = "Formula", menuName = "Game Creator/Stats/Formula")]
public class Formula : ScriptableObject
{
    [SerializeField] private string m_Formula;    // 公式字符串
    [SerializeField] private Table m_Table;       // 关联的表格
    
    [NonSerialized] private Expression m_Expression;  // 编译后的表达式
    [NonSerialized] private Domain m_Domain;          // 运行时上下文
    
    public double Calculate(GameObject source, GameObject target)
    {
        // 1. 初始化（首次或编辑器中公式改变时）
        if (this.m_Expression == null) this.Initialize();
        
        // 2. 设置上下文
        this.m_Domain.Set(this.m_Table, source, target);
        this.SetInputs();
        
        // 3. 计算表达式
        this.m_Expression.Evaluate(this.m_Domain, this.m_Input, out double result);
        return result;
    }
}
```

**公式语法示例**：

1. **基础计算**：
```
10 + 5 * 2        // = 20
(10 + 5) * 2      // = 30
10 ^ 2            // = 100
sqrt(16)          // = 4
```

2. **访问属性值**：
```
source.base[strength]               // Source 的 Strength Stat 基础值
source.stat[strength]               // Source 的 Strength Stat 最终值（含修改器）
source.attr[health]                 // Source 的 Health Attribute 当前值

target.base[defense]                // Target 的 Defense Stat 基础值
target.stat[defense]                // Target 的 Defense Stat 最终值
target.attr[mana]                   // Target 的 Mana Attribute 当前值
```

3. **访问变量**：
```
source.var[player-level]            // Source 的 Global 变量
target.var[enemy-difficulty]        // Target 的 Global 变量
```

4. **复杂公式**：
```
// 伤害计算：攻击者力量 - 防御者防御
source.stat[strength] - target.stat[defense]

// 暴击伤害：基础伤害 * (1 + 暴击率)
source.stat[attack] * (1 + source.stat[crit-rate])

// 经验值公式：等级 * 100
table.level * 100

// 随机伤害：50 到 100 之间
random(50, 100)

// 掷骰：2d6 (掷两个6面骰子)
dice(2, 6)

// 30% 概率触发
chance(0.3)
```

**公式编译过程**：

```csharp
private void Initialize()
{
    StringBuilder formula = new StringBuilder(this.m_Formula);
    List<Parameter> variables = new List<Parameter>();
    
    // 1. 查找并替换所有变量引用
    while (FindParameter(formula.ToString(), out Match match, out int index))
    {
        // 将 "source.stat[strength]" 替换为 "#" 占位符
        formula = formula
            .Remove(match.Index, match.Length)
            .Insert(match.Index, '#');
        
        // 保存变量提取函数
        Parameter variable = new Parameter(
            ClauseName(match.Value),
            Inputs[index].Function
        );
        variables.Add(variable);
    }
    
    // 2. 编译表达式（现在只包含数字和运算符）
    this.m_Expression = new Expression(formula.ToString());
    
    // 3. 创建运行时域
    this.m_Domain = new Domain();
}
```

---

### 2. Expression (表达式解析器)

**位置**: `Runtime/Math/Expression.cs`

Expression 实现了一个完整的数学表达式解析器，使用 **Shunting Yard 算法** 将中缀表达式转换为 **逆波兰表示法 (RPN)**。

**支持的运算符**：
```csharp
private static readonly Dictionary<string, Operator> Operators = new Dictionary<string, Operator>
{
    { "-",   new Operator(Function.Sub,   2, 2, Associativity.L) },  // 减法
    { "+",   new Operator(Function.Add,   2, 2, Associativity.L) },  // 加法
    { "/",   new Operator(Function.Div,   3, 2, Associativity.L) },  // 除法
    { "*",   new Operator(Function.Mul,   3, 2, Associativity.L) },  // 乘法
    { "%",   new Operator(Function.Mod,   3, 2, Associativity.L) },  // 取模
    { "^",   new Operator(Function.Pow,   5, 2, Associativity.R) },  // 幂运算
    { "_",   new Operator(Function.Neg,   5, 1, Associativity.L) },  // 负数
    { "sqrt", new Operator(Function.Sqrt, 4, 1, Associativity.L) },  // 平方根
    // ... 更多函数
};
```

**优先级和结合性**：
```
优先级 5: ^ (幂), _ (负号), sqrt (高优先级)
优先级 4: 函数 (sin, cos, min, max 等)
优先级 3: *, /, %
优先级 2: +, -
优先级 1: ( 括号 )
```

**计算流程**：

```csharp
internal bool Evaluate(Domain domain, double[] inputs, out double value)
{
    value = default;
    return EvaluateTokens(this.m_RPNTokens, domain, inputs, ref value);
}

private static bool EvaluateTokens(string[] tokens, Domain domain, double[] inputs, ref double value)
{
    EvaluationStack.Clear();
    
    foreach (string token in tokens)
    {
        // 1. 如果是数字，直接入栈
        if (IsNumeric(token))
        {
            EvaluationStack.Push(token);
            continue;
        }
        
        // 2. 如果是变量（#），获取其值
        if (IsVariable(token))
        {
            int index = VariableIndex(token);
            EvaluationStack.Push(inputs[index].ToString(CultureInfo.InvariantCulture));
            continue;
        }
        
        // 3. 如果是运算符，弹出操作数并计算
        if (Operators.TryGetValue(token, out Operator op))
        {
            EvaluationValues.Clear();
            for (int i = 0; i < op.Arguments; ++i)
            {
                string arg = EvaluationStack.Pop();
                EvaluationValues.Add(double.Parse(arg));
            }
            
            double result = Functions.Evaluate(op.Function, domain, EvaluationValues);
            EvaluationStack.Push(result.ToString(CultureInfo.InvariantCulture));
        }
    }
    
    // 4. 最终栈顶元素就是结果
    value = double.Parse(EvaluationStack.Pop());
    return true;
}
```

**示例解析**：
```
输入公式: "5 + 3 * 2"

步骤 1: 分词
Tokens: ["5", "+", "3", "*", "2"]

步骤 2: 转换为 RPN (Shunting Yard)
RPN: ["5", "3", "2", "*", "+"]

步骤 3: 计算 RPN
栈操作:
1. 读取 "5"    → 栈: [5]
2. 读取 "3"    → 栈: [5, 3]
3. 读取 "2"    → 栈: [5, 3, 2]
4. 读取 "*"    → 弹出 2, 3 → 计算 3*2=6 → 栈: [5, 6]
5. 读取 "+"    → 弹出 6, 5 → 计算 5+6=11 → 栈: [11]

结果: 11
```

---

### 3. Domain (运行时上下文)

**位置**: `Runtime/Math/Classes/Domain.cs`

Domain 提供了公式运行时需要的所有上下文信息：

```csharp
public class Domain
{
    private Table m_Table;
    private GameObject m_Source;
    private GameObject m_Target;
    
    public void Set(Table table, GameObject source, GameObject target)
    {
        this.m_Table = table;
        this.m_Source = source;
        this.m_Target = target;
    }
    
    // 获取 Source 的 Stat 基础值
    public double GetSourceStatBase(string statID) { ... }
    
    // 获取 Source 的 Stat 最终值
    public double GetSourceStatValue(string statID) { ... }
    
    // 获取 Source 的 Attribute 当前值
    public double GetSourceAttrValue(string attributeID) { ... }
    
    // 获取 Target 的值（同上）
    public double GetTargetStatBase(string statID) { ... }
    public double GetTargetStatValue(string statID) { ... }
    public double GetTargetAttrValue(string attributeID) { ... }
    
    // 获取变量
    public double GetSourceVariable(string variableID) { ... }
    public double GetTargetVariable(string variableID) { ... }
    
    // 表格查询
    public double GetTableLevel() { ... }
    public double GetTableValue(double experience) { ... }
    // ...
}
```

---

## 状态效果系统

### 1. StatusEffect (状态效果定义)

**位置**: `Runtime/ScriptableObjects/StatusEffect.cs`

```csharp
[CreateAssetMenu(fileName = "Status Effect", menuName = "Game Creator/Stats/Status Effect")]
public class StatusEffect : ScriptableObject
{
    [SerializeField] private StatusEffectData m_Data;
    [SerializeField] private StatusEffectInfo m_Info;
    
    // 生命周期指令
    [SerializeField] private RunInstructionsList m_OnStart;      // 开始时执行
    [SerializeField] private RunInstructionsList m_OnEnd;        // 结束时执行
    [SerializeField] private RunInstructionsList m_WhileActive;  // 持续期间执行
    
    [SerializeField] private SaveUniqueID m_ID;  // 唯一ID
    
    public StatusEffectType Type { get; }        // Positive/Negative/Neutral
    public bool HasDuration { get; }             // 是否有持续时间
    public bool IsHidden { get; }                // 是否在 UI 中隐藏
}
```

**StatusEffectData**：
```csharp
public class StatusEffectData
{
    [SerializeField] private StatusEffectType m_Type;           // 类型
    [SerializeField] private PropertyGetInteger m_MaxStack;     // 最大堆叠数
    [SerializeField] private bool m_HasDuration;                // 是否有时限
    [SerializeField] private bool m_IsHidden;                   // 是否隐藏
    [SerializeField] private PropertyGetDecimal m_Duration;     // 持续时间
}
```

**状态效果类型**：
```csharp
public enum StatusEffectType
{
    Positive = 1 << 0,   // 增益
    Negative = 1 << 1,   // 减益
    Neutral  = 1 << 2    // 中性
}
```

---

### 2. RuntimeStatusEffects (运行时管理)

**位置**: `Runtime/Classes/Traits/StatusEffects/RuntimeStatusEffects.cs`

```csharp
public class RuntimeStatusEffects
{
    private Traits m_Traits;
    private Dictionary<int, RuntimeStatusEffectList> m_Active;  // 按 ID Hash 存储
    
    public event Action<IdString> EventChange;
    
    internal void Update()
    {
        // 每帧更新所有激活的状态效果
        foreach (KeyValuePair<int, RuntimeStatusEffectList> entry in this.m_Active)
        {
            entry.Value?.Update();
        }
    }
    
    public void Add(StatusEffect statusEffect, float timeElapsed = 0f)
    {
        if (!this.m_Active.TryGetValue(statusEffect.ID.Hash, out RuntimeStatusEffectList list))
        {
            // 创建新的列表
            list = new RuntimeStatusEffectList(this.m_Traits, statusEffect);
            list.EventChange += this.ExecuteEventChange;
            this.m_Active.Add(statusEffect.ID.Hash, list);
        }
        
        // 添加一个实例（处理堆叠）
        list.Add(timeElapsed);
    }
    
    public void Remove(StatusEffect statusEffect, int amount = 1)
    {
        if (this.m_Active.TryGetValue(statusEffect.ID.Hash, out RuntimeStatusEffectList list))
        {
            list.Remove(amount);
        }
    }
    
    public void ClearByType(StatusEffectTypeMask maskType)
    {
        foreach (var entry in this.m_Active)
        {
            entry.Value?.RemoveByType((int) maskType);
        }
    }
}
```

---

### 3. RuntimeStatusEffectList (单个效果的堆叠管理)

**位置**: `Runtime/Classes/Traits/StatusEffects/RuntimeStatusEffectList.cs`

```csharp
internal class RuntimeStatusEffectList
{
    private readonly List<RuntimeStatusEffectData> m_List;  // 堆叠实例
    private readonly Traits m_Traits;
    private readonly StatusEffect m_StatusEffect;
    
    public int Count => this.m_List.Count;
    public IdString ID => this.m_StatusEffect.ID;
    
    public event Action<IdString> EventChange;
    public event Action<IdString> EventAdd;
    public event Action<IdString> EventRemove;
    
    public void Update()
    {
        bool removeAny = false;
        
        // 倒序遍历，移除已过期的效果
        for (int i = this.m_List.Count - 1; i >= 0; --i)
        {
            RuntimeStatusEffectData data = this.m_List[i];
            if (data.Update())  // 返回 true 表示已过期
            {
                data.Stop();
                this.m_List.RemoveAt(i);
                removeAny = true;
            }
        }
        
        if (removeAny)
        {
            this.EventRemove?.Invoke(this.m_StatusEffect.ID);
            this.EventChange?.Invoke(this.m_StatusEffect.ID);
        }
    }
    
    public void Add(float timeElapsed)
    {
        int maxStack = this.m_StatusEffect.GetMaxStack(this.Args);
        if (maxStack <= 0) return;
        
        // 超过最大堆叠数，移除最旧的
        if (this.Count >= maxStack)
        {
            this.m_List[0].Stop();
            this.m_List.RemoveAt(0);
            this.EventRemove?.Invoke(this.m_StatusEffect.ID);
        }
        
        // 添加新实例
        this.m_List.Add(new RuntimeStatusEffectData(
            this.m_Traits,
            this.m_StatusEffect,
            timeElapsed
        ));
        
        this.EventAdd?.Invoke(this.m_StatusEffect.ID);
        this.EventChange?.Invoke(this.m_StatusEffect.ID);
    }
    
    public void Remove(int amount = 1)
    {
        while (this.Count > 0 && amount > 0)
        {
            // 总是移除最旧的（FIFO）
            this.m_List[0].Stop();
            this.m_List.RemoveAt(0);
            amount -= 1;
        }
        
        this.EventRemove?.Invoke(this.m_StatusEffect.ID);
        this.EventChange?.Invoke(this.m_StatusEffect.ID);
    }
}
```

---

### 4. RuntimeStatusEffectData (单个实例)

**位置**: `Runtime/Classes/Traits/StatusEffects/RuntimeStatusEffectData.cs`

```csharp
internal class RuntimeStatusEffectData
{
    private readonly Traits m_Traits;
    private readonly StatusEffect m_StatusEffect;
    
    private float m_StartTime;
    private float m_Duration;
    private float m_TimeElapsed;
    
    private Cancellable m_CancellableOnStart;
    private Cancellable m_CancellableWhileActive;
    
    public RuntimeStatusEffectData(Traits traits, StatusEffect statusEffect, float timeElapsed)
    {
        this.m_Traits = traits;
        this.m_StatusEffect = statusEffect;
        this.m_TimeElapsed = timeElapsed;
        
        Args args = new Args(traits.gameObject);
        this.m_Duration = statusEffect.GetDuration(args);
        this.m_StartTime = Time.time - timeElapsed;
        
        // 执行 OnStart 指令
        this.m_CancellableOnStart = new Cancellable();
        _ = statusEffect.RunOnStart(args, new RunnerConfig
        {
            Name = $"Status Effect {statusEffect.name} OnStart",
            Cancellable = this.m_CancellableOnStart
        });
        
        // 执行 WhileActive 指令（循环）
        this.m_CancellableWhileActive = new Cancellable();
        _ = this.RunWhileActive(args);
    }
    
    public bool Update()
    {
        // 更新已过时间
        this.m_TimeElapsed = Time.time - this.m_StartTime;
        
        // 检查是否过期
        if (this.m_Duration >= 0 && this.m_TimeElapsed >= this.m_Duration)
        {
            return true;  // 需要移除
        }
        
        return false;
    }
    
    public void Stop()
    {
        // 取消正在运行的指令
        this.m_CancellableOnStart?.Cancel();
        this.m_CancellableWhileActive?.Cancel();
        
        // 执行 OnEnd 指令
        Args args = new Args(this.m_Traits.gameObject);
        _ = this.m_StatusEffect.RunOnEnd(args, new RunnerConfig
        {
            Name = $"Status Effect {this.m_StatusEffect.name} OnEnd"
        });
    }
    
    private async Task RunWhileActive(Args args)
    {
        while (!this.m_CancellableWhileActive.IsCancelled)
        {
            await this.m_StatusEffect.RunWhileActive(args, new RunnerConfig
            {
                Name = $"Status Effect {this.m_StatusEffect.name} WhileActive",
                Cancellable = this.m_CancellableWhileActive
            });
            
            await Task.Yield();  // 等待下一帧
        }
    }
    
    public RuntimeStatusEffectValue GetValue()
    {
        float timeRemaining = this.m_Duration >= 0 
            ? this.m_Duration - this.m_TimeElapsed 
            : -1f;
            
        return new RuntimeStatusEffectValue(
            this.m_StatusEffect.ID.String,
            this.m_TimeElapsed,
            timeRemaining
        );
    }
}
```

---

## 数据持久化

### 1. Memory 系统

GameCreator 使用 `Memory` 系统来保存和恢复数据。

**MemoryTraits**：
```csharp
[Serializable]
public class MemoryTraits : Memory
{
    public override Token GetToken(GameObject target)
    {
        Traits traits = target.Get<Traits>();
        return traits != null ? new TokenTraits(traits) : null;
    }
    
    public override void OnRemember(GameObject target, Token token)
    {
        Traits traits = target.Get<Traits>();
        if (traits == null) return;
        
        TokenTraits.OnRemember(traits, token);
    }
}
```

**TokenTraits**：
```csharp
[Serializable]
public class TokenTraits : Token
{
    [SerializeField] private TokenStats m_Stats;
    [SerializeField] private TokenAttributes m_Attributes;
    [SerializeField] private TokenStatusEffects m_StatusEffects;
    
    public TokenTraits(Traits traits)
    {
        this.m_Stats = new TokenStats(traits.RuntimeStats);
        this.m_Attributes = new TokenAttributes(traits.RuntimeAttributes);
        this.m_StatusEffects = new TokenStatusEffects(traits.RuntimeStatusEffects);
    }
    
    public static void OnRemember(Traits traits, Token token)
    {
        if (token is not TokenTraits tokenTraits) return;
        
        // 恢复 Stats
        TokenStats.OnRemember(traits.RuntimeStats, tokenTraits.m_Stats);
        
        // 恢复 Attributes
        TokenAttributes.OnRemember(traits.RuntimeAttributes, tokenTraits.m_Attributes);
        
        // 恢复 Status Effects
        TokenStatusEffects.OnRemember(traits, tokenTraits.m_StatusEffects);
    }
}
```

**TokenStats** (保存所有 Stat 的基础值):
```csharp
[Serializable]
public class TokenStats : Token
{
    [Serializable]
    private struct Entry
    {
        public int hash;
        public double baseValue;
    }
    
    [SerializeField] private Entry[] m_Entries;
    
    public TokenStats(RuntimeStats runtimeStats)
    {
        List<Entry> entries = new List<Entry>();
        
        foreach (int statID in runtimeStats.StatsKeys)
        {
            RuntimeStatData stat = runtimeStats.Get(new IdString(statID));
            entries.Add(new Entry
            {
                hash = statID,
                baseValue = stat.Base
            });
        }
        
        this.m_Entries = entries.ToArray();
    }
    
    public static void OnRemember(RuntimeStats runtimeStats, TokenStats token)
    {
        foreach (Entry entry in token.m_Entries)
        {
            RuntimeStatData stat = runtimeStats.Get(new IdString(entry.hash));
            if (stat != null)
            {
                stat.SetBaseWithoutNotify(entry.baseValue);
            }
        }
    }
}
```

---

## 可视化脚本集成

Stats 系统提供了完整的 Visual Scripting 集成，包括 Instructions、Conditions 和 Events。

### 1. Instructions (指令)

#### InstructionStatsChangeStat
```csharp
[Title("Change Stat")]
[Description("Changes the base Stat value of a game object's Traits component")]
public class InstructionStatsChangeStat : Instruction
{
    [SerializeField] private PropertyGetGameObject m_Target = GetGameObjectPlayer.Create();
    [SerializeField] private PropertyGetStat m_Stat = new PropertyGetStat();
    [SerializeField] private ChangeDecimal m_Change = new ChangeDecimal(100f);
    
    public override string Title => $"{this.m_Target}[{this.m_Stat}] {this.m_Change}";
    
    protected override Task Run(Args args)
    {
        GameObject target = this.m_Target.Get(args);
        Traits traits = target.Get<Traits>();
        Stat stat = this.m_Stat.Get(args);
        
        RuntimeStatData runtimeStat = traits.RuntimeStats.Get(stat.ID);
        runtimeStat.Base = (float) this.m_Change.Get(runtimeStat.Base, args);
        
        return DefaultResult;
    }
}
```

#### InstructionStatsAddModifier
```csharp
[Title("Add Stat Modifier")]
[Description("Adds a value Modifier to the selected Stat")]
public class InstructionStatsAddModifier : Instruction
{
    [SerializeField] private PropertyGetGameObject m_Target;
    [SerializeField] private PropertyGetStat m_Stat;
    [SerializeField] private ModifierType m_Type;  // Constant / Percent
    [SerializeField] private PropertyGetDecimal m_Value;
    
    protected override Task Run(Args args)
    {
        GameObject target = this.m_Target.Get(args);
        Traits traits = target.Get<Traits>();
        Stat stat = this.m_Stat.Get(args);
        
        RuntimeStatData runtimeStat = traits.RuntimeStats.Get(stat.ID);
        float value = (float) this.m_Value.Get(args);
        
        runtimeStat.AddModifier(this.m_Type, value);
        return DefaultResult;
    }
}
```

#### InstructionStatsAddStatusEffect
```csharp
[Title("Add Status Effect")]
[Description("Adds a Status Effect to a game object's Traits component")]
public class InstructionStatsAddStatusEffect : Instruction
{
    [SerializeField] private PropertyGetGameObject m_Target;
    [SerializeField] private PropertyGetStatusEffect m_StatusEffect;
    [SerializeField] private PropertyGetDecimal m_TimeElapsed;
    
    protected override Task Run(Args args)
    {
        GameObject target = this.m_Target.Get(args);
        Traits traits = target.Get<Traits>();
        StatusEffect statusEffect = this.m_StatusEffect.Get(args);
        
        float timeElapsed = (float) this.m_TimeElapsed.Get(args);
        traits.RuntimeStatusEffects.Add(statusEffect, timeElapsed);
        
        return DefaultResult;
    }
}
```

---

### 2. Conditions (条件)

#### ConditionCompareStat
```csharp
[Title("Compare Stat")]
[Description("Checks if a Stat value compares against another value")]
public class ConditionCompareStat : Condition
{
    [SerializeField] private PropertyGetGameObject m_Target;
    [SerializeField] private PropertyGetStat m_Stat;
    [SerializeField] private CompareDouble m_Comparison;
    
    protected override bool Run(Args args)
    {
        GameObject target = this.m_Target.Get(args);
        Traits traits = target.Get<Traits>();
        Stat stat = this.m_Stat.Get(args);
        
        RuntimeStatData runtimeStat = traits.RuntimeStats.Get(stat.ID);
        return this.m_Comparison.Match(runtimeStat.Value, args);
    }
}
```

#### ConditionHasStatusEffect
```csharp
[Title("Has Status Effect")]
[Description("Returns true if the target has the specified Status Effect")]
public class ConditionHasStatusEffect : Condition
{
    [SerializeField] private PropertyGetGameObject m_Target;
    [SerializeField] private PropertyGetStatusEffect m_StatusEffect;
    
    protected override bool Run(Args args)
    {
        GameObject target = this.m_Target.Get(args);
        Traits traits = target.Get<Traits>();
        StatusEffect statusEffect = this.m_StatusEffect.Get(args);
        
        int count = traits.RuntimeStatusEffects.GetActiveStackCount(statusEffect.ID);
        return count > 0;
    }
}
```

---

### 3. Events (事件)

#### EventStatsStatChange
```csharp
[Title("On Stat Change")]
[Description("Executed when a Stat value changes")]
public class EventStatsStatChange : Event
{
    [SerializeField] private PropertyGetGameObject m_Target;
    [SerializeField] private PropertyGetStat m_Stat;
    
    protected override void OnEnable(Trigger trigger)
    {
        base.OnEnable(trigger);
        
        GameObject target = this.m_Target.Get(trigger);
        Traits traits = target.Get<Traits>();
        
        traits.RuntimeStats.EventChange += this.OnChange;
    }
    
    protected override void OnDisable(Trigger trigger)
    {
        base.OnDisable(trigger);
        
        GameObject target = this.m_Target.Get(trigger);
        Traits traits = target?.Get<Traits>();
        
        if (traits != null)
        {
            traits.RuntimeStats.EventChange -= this.OnChange;
        }
    }
    
    private void OnChange(IdString statID)
    {
        Stat targetStat = this.m_Stat.Get(this.Args);
        if (targetStat != null && statID == targetStat.ID)
        {
            _ = this.m_Trigger.Execute(this.Self);
        }
    }
}
```

---

## 使用示例

### 示例 1: 创建一个战士角色

#### 步骤 1: 创建 Stats 和 Attributes

**创建 Stat: Strength (力量)**
```
右键 → Game Creator → Stats → Stat
配置:
- ID: "strength"
- Name: "力量"
- Base: 10
- Color: Red
```

**创建 Stat: Constitution (体质)**
```
右键 → Game Creator → Stats → Stat
配置:
- ID: "constitution"
- Name: "体质"
- Base: 8
- Color: Green
```

**创建 Attribute: Health (生命值)**
```
右键 → Game Creator → Stats → Attribute
配置:
- ID: "health"
- Name: "生命值"
- Min Value: 0
- Max Value: → Constitution Stat
- Start Percent: 100%
- Color: Red
```

#### 步骤 2: 创建 Class

**创建 Class: Warrior**
```
右键 → Game Creator → Stats → Class
配置:
- Name: "战士"
- Attributes:
  - [0] Health (生命值)
- Stats:
  - [0] Strength (力量, Base: 10)
  - [1] Constitution (体质, Base: 8)
```

#### 步骤 3: 添加到游戏对象

```
选择角色游戏对象
Add Component → Game Creator → Stats → Traits
配置:
- Class: → Warrior Class
```

#### 步骤 4: 在代码中访问

```csharp
// 获取 Traits 组件
Traits traits = gameObject.Get<Traits>();

// 访问 Stat
RuntimeStatData strength = traits.RuntimeStats.Get(new IdString("strength"));
Debug.Log($"力量值: {strength.Value}");

// 修改 Stat
strength.Base = 15;

// 添加修改器
strength.AddModifier(ModifierType.Constant, 5);  // +5 力量
strength.AddModifier(ModifierType.Percent, 0.2); // +20% 力量

// 访问 Attribute
RuntimeAttributeData health = traits.RuntimeAttributes.Get(new IdString("health"));
Debug.Log($"生命值: {health.Value} / {health.MaxValue}");

// 修改 Attribute
health.Value -= 20;  // 受到 20 点伤害

// 订阅事件
traits.RuntimeStats.EventChange += (statID) =>
{
    Debug.Log($"Stat {statID.String} changed!");
};
```

---

### 示例 2: 创建中毒状态效果

#### 步骤 1: 创建 Status Effect

**创建 StatusEffect: Poison**
```
右键 → Game Creator → Stats → Status Effect
配置:
- ID: "poison"
- Name: "中毒"
- Type: Negative
- Max Stack: 3
- Has Duration: true
- Duration: 10 (秒)
- Color: Green
```

#### 步骤 2: 配置生命周期指令

**On Start (开始时)**:
```
Instructions:
- Debug Message: "中毒效果开始"
```

**While Active (持续期间 - 每帧执行)**:
```
Instructions:
- Change Attribute:
  - Target: Self
  - Attribute: Health
  - Change: - 1 per second
```

**On End (结束时)**:
```
Instructions:
- Debug Message: "中毒效果结束"
```

#### 步骤 3: 应用状态效果

**使用 Visual Scripting**:
```
Trigger: On Interact
Conditions: None
Instructions:
- Add Status Effect:
  - Target: Player
  - Status Effect: Poison
  - Time Elapsed: 0
```

**使用代码**:
```csharp
Traits traits = target.Get<Traits>();
StatusEffect poison = /* 获取 Poison ScriptableObject */;

traits.RuntimeStatusEffects.Add(poison);
```

---

### 示例 3: 使用 Formula 计算伤害

#### 步骤 1: 创建 Formula

**创建 Formula: Physical Damage**
```
右键 → Game Creator → Stats → Formula
配置:
- Formula: "source.stat[strength] * 2 - target.stat[defense]"
```

#### 步骤 2: 在 Stat 中使用

**创建 Stat: Attack Power**
```
配置:
- ID: "attack-power"
- Base: 0
- Formula: → Physical Damage Formula
```

现在 Attack Power 会根据公式动态计算！

#### 步骤 3: 复杂伤害公式

```
// 暴击伤害计算
"(source.stat[attack] * (1 + source.stat[crit-damage])) * chance(source.stat[crit-rate])"

// 等级惩罚
"source.stat[base-damage] * (1 - (target.stat[level] - source.stat[level]) * 0.05)"

// 随机伤害范围
"random(source.stat[min-damage], source.stat[max-damage])"

// 技能伤害缩放
"source.stat[intelligence] * 1.5 + source.var[skill-level] * 10"
```

---

### 示例 4: 等级系统

#### 步骤 1: 创建 Table

**创建 Table: Player Leveling**
```
右键 → Game Creator → Stats → Table
配置:
- Type: Linear Progression
  - Base: 100
  - Increment: 50
  
等级经验需求:
Level 1 → 2: 100 XP
Level 2 → 3: 150 XP
Level 3 → 4: 200 XP
...
```

#### 步骤 2: 在 Formula 中使用

```
// 获取当前等级
"table.level"

// 基于等级的属性
"10 + table.level * 2"

// 升级进度百分比
"table.ratio"
```

#### 步骤 3: 在代码中使用

```csharp
Table levelTable = /* 获取 Table ScriptableObject */;

// 获取当前等级
int currentLevel = levelTable.CurrentLevel(totalExperience);

// 获取升级所需经验
int expNeeded = levelTable.ExperienceForLevel(currentLevel + 1);

// 获取当前等级进度
float progress = levelTable.RatioFromCurrentLevel(totalExperience);
```

---

## 总结

### 系统优势

1. **模块化设计**
   - Stat, Attribute, StatusEffect 各司其职
   - Class 作为模板，方便复用
   - 运行时数据与定义分离

2. **强大的计算能力**
   - Formula 系统支持复杂表达式
   - 支持变量、函数、随机数
   - 可以引用 Source/Target 的属性

3. **灵活的修改器系统**
   - 常量和百分比分离
   - 可以动态添加/移除
   - 计算顺序明确（百分比先，常量后）

4. **完善的状态效果**
   - 支持堆叠
   - 支持持续时间
   - 生命周期钩子（OnStart/WhileActive/OnEnd）

5. **无缝 Visual Scripting 集成**
   - 提供大量 Instructions
   - 提供 Conditions 和 Events
   - 无需代码即可实现复杂逻辑

6. **数据持久化**
   - Memory 系统自动保存/恢复
   - 支持保存 Stats 基础值
   - 支持保存 Attributes 当前值
   - 支持保存 Status Effects 状态

### 适用场景

- ✅ RPG 角色属性系统
- ✅ MOBA/动作游戏的角色数值
- ✅ 装备系统（通过修改器）
- ✅ Buff/Debuff 系统
- ✅ 等级/经验系统
- ✅ 技能伤害计算
- ✅ 战斗系统数值设计

### 扩展建议

1. **自定义 Formula 函数**
   - 可以在 `Expression` 中添加更多函数
   - 例如：`clamp`, `lerp`, `smoothstep` 等

2. **状态效果互斥**
   - 可以扩展 `StatusEffect` 添加互斥逻辑
   - 例如：中毒和免疫不能共存

3. **属性依赖链**
   - 扩展 `Attribute` 支持更复杂的依赖
   - 例如：生命恢复速度取决于体质

4. **战斗日志**
   - 在事件中记录所有数值变化
   - 用于调试和平衡性分析

---

**文档完成时间**: 2025年10月28日
**系统版本**: GameCreator Stats Package
**作者**: AI Assistant
