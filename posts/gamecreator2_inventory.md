---
title: "gamecreator2 框架 character review"
date: "2025-10-20"
tags: ["Unity", "GameCreator", "Network","GameCreator"]
excerpt: "GameCreator 是一个功能丰富的unity框架。"
---   

## GameCreator Inventory 系统代码架构与实现细节分析

根据对代码的全面review，我为你详细讲解Inventory目录下的代码框架和关键技术细节。

---

## 📋 **一、系统整体架构**

### 1.1 核心模块划分

Inventory系统采用**分层模块化设计**，主要包含以下几个核心模块：

```
Inventory/Runtime/
├── ScriptableObjects/      # 数据定义层（配置资产）
│   ├── Item.cs            # 物品定义
│   ├── Equipment.cs       # 装备槽配置
│   ├── Currency.cs        # 货币定义
│   ├── LootTable.cs       # 掉落表
│   └── BagSkin.cs         # UI皮肤
│
├── Components/            # 运行时组件层
│   ├── Bag.cs            # 背包组件
│   ├── Merchant.cs       # 商人组件
│   └── Prop.cs           # 物品道具
│
├── Classes/              # 核心逻辑层
│   ├── Items/           # 物品系统
│   │   └── Runtime/RuntimeItem.cs  # 运行时物品实例
│   ├── Bag/             # 背包系统
│   │   ├── Bags/        # 背包类型实现
│   │   ├── Content/     # 内容管理
│   │   ├── Equipment/   # 装备管理
│   │   ├── Wealth/      # 货币管理
│   │   └── Cooldown/    # 冷却管理
│   ├── Properties/      # 属性系统
│   └── Loot/           # 掉落系统
│
├── UI/                  # UI表现层
│   └── UnityUI/
│       ├── Components/  # UI组件
│       └── Classes/     # UI逻辑类
│
└── VisualScripting/    # 可视化脚本集成
    ├── Instructions/   # 指令节点
    ├── Conditions/     # 条件节点
    └── Events/         # 事件节点
```

---

## 🎯 **二、核心类详解**

### 2.1 **Item.cs - 物品定义基类**

**架构设计要点**：

```csharp
public class Item : ScriptableObject, ISerializationCallbackReceiver
{
    // 【设计模式】使用唯一ID系统进行物品识别
    [SerializeField] private UniqueID m_ID = new UniqueID();
    
    // 【继承体系】支持物品继承，实现属性复用
    [SerializeField] private Item m_Parent;
    
    // 【模块化组合】物品功能通过组合模式实现
    [SerializeField] private Info m_Info;          // 基础信息
    [SerializeField] private Shape m_Shape;        // 形状/重量
    [SerializeField] private Price m_Price;        // 价格系统
    [SerializeField] private Properties m_Properties; // 属性系统
    [SerializeField] private Sockets m_Sockets;    // 插槽系统
    [SerializeField] private Equip m_Equip;        // 装备系统
    [SerializeField] private Usage m_Usage;        // 使用系统
    [SerializeField] private Crafting m_Crafting;  // 制造系统
}
```

**关键技术细节**：

1. **继承查询机制**：
```csharp
public bool InheritsFrom(IdString itemID)
{
    if (this.ID.Hash == itemID.Hash) return true;
    // 递归查询父级链
    return this.m_Parent != null && this.Parent.InheritsFrom(itemID);
}
```

2. **工厂方法创建运行时实例**：
```csharp
public RuntimeItem CreateRuntimeItem(Args args)
{
    RuntimeItem newRuntimeItem = new RuntimeItem(this);
    LastItemCreated = newRuntimeItem;
    // 执行创建时回调
    this.m_Info.RunOnCreate(this, args);
    return newRuntimeItem;
}
```

3. **静态事件系统**：用于全局监听物品实例化、掉落等事件
```csharp
public static event Action EventInstantiate;
public static GameObject LastItemInstanceInstantiated;
public static RuntimeItem LastItemCreated;
```

---

### 2.2 **RuntimeItem.cs - 运行时物品实例**

**设计核心**：将ScriptableObject定义的静态数据实例化为可修改的运行时对象。

```csharp
public class RuntimeItem
{
    // 【双ID系统】
    [SerializeField] private IdString m_ItemID;     // 指向原型Item
    [SerializeField] private IdString m_RuntimeID;  // 运行时唯一ID (GUID)
    
    // 【运行时数据】
    [SerializeField] private RuntimeProperties m_Properties;  // 可变属性
    [SerializeField] private RuntimeSockets m_Sockets;        // 插槽附件
    
    // 【懒加载】延迟加载Item引用
    [NonSerialized] private Item m_Item;
    [NonSerialized] private Bag m_Bag;  // 所属背包引用
}
```

**关键特性**：

1. **堆叠判定算法**：
```csharp
public bool CanStack(RuntimeItem runtimeItem)
{
    if (this.ItemID.Hash != runtimeItem.ItemID.Hash) return false;
    
    // 检查所有属性是否等价
    foreach (var entry in this.m_Properties)
    {
        if (!runtimeItem.m_Properties.TryGetValue(entry.Key, out var otherProperty))
            return false;
        if (!entry.Value.Equivalent(otherProperty)) 
            return false;
    }
    
    // 插槽必须为空才能堆叠
    return this.m_Sockets.Count == 0 && runtimeItem.m_Sockets.Count == 0;
}
```

2. **重量计算（包含附件）**：
```csharp
public int Weight
{
    get
    {
        int weight = this.Item.Shape.Weight;
        // 累加所有插槽附件的重量
        foreach (var entry in this.m_Sockets)
        {
            if (entry.Value.HasAttachment)
                weight += entry.Value.Attachment.Weight;
        }
        return weight;
    }
}
```

3. **静态上下文追踪**：用于事件系统传递上下文
```csharp
public static RuntimeItem Bag_LastItemAdded { get; internal set; }
public static RuntimeItem Socket_LastAttachmentAttached { get; internal set; }
public static RuntimeItem UI_LastItemSelected { get; internal set; }
```

---

### 2.3 **Bag.cs - 背包组件**

**架构设计**：采用**策略模式**支持不同背包类型（列表/网格）

```csharp
public class Bag : MonoBehaviour
{
    // 【策略模式】可序列化多态实现
    [SerializeReference] private TBag m_Bag = new BagList();
    
    // 【初始库存】
    [SerializeField] private Stock m_Stock = new Stock();
    
    // 【接口访问器】统一访问不同功能模块
    public IBagShape Shape => this.m_Bag.Shape;
    public IBagContent Content => this.m_Bag.Content;
    public IBagEquipment Equipment => this.m_Bag.Equipment;
    public IBagCooldowns Cooldowns => this.m_Bag.Cooldowns;
    public IBagWealth Wealth => this.m_Bag.Wealth;
    
    // 【事件系统】
    public event Action EventChange;
    public event Action EventOpenUI;
}
```

**初始化流程**：

```csharp
private void Awake()
{
    // 1. 创建Args上下文
    this.Args = new Args(self, this.m_Wearer.Get(self));
    
    // 2. 级联事件订阅
    this.Shape.EventChange += () => this.EventChange?.Invoke();
    this.Content.EventChange += () => this.EventChange?.Invoke();
    
    // 3. 初始化子系统
    this.m_Bag.OnAwake(this);
    
    // 4. 加载初始库存
    for (int i = 0; i < this.m_Stock.StockLength; ++i)
    {
        for (int j = 0; j < this.m_Stock.GetStockAmount(i); ++j)
            this.Content.AddType(this.m_Stock.GetStockItem(i), true);
    }
    
    // 5. 加载初始货币
    for (int i = 0; i < this.m_Stock.WealthLength; ++i)
    {
        Currency currency = this.m_Stock.GetWealthCurrency(i);
        int amount = this.m_Stock.GetWealthAmount(i);
        if (currency != null) this.Wealth.Add(currency, amount);
    }
}
```

---

### 2.4 **Cell.cs - 背包格子**

**核心数据结构**：使用**链表栈**实现物品堆叠

```csharp
public class Cell
{
    // 【链表栈】存储堆叠的物品
    [SerializeField] private Stack m_Stack = new Stack();
    
    // 【根节点】堆叠的第一个物品
    [SerializeField] private RuntimeItem m_RuntimeItem;
    
    // 【计数属性】
    public int Count => this.m_RuntimeItem != null 
        ? this.m_Stack.Count + 1 
        : 0;
    
    public int CountRemaining => this.m_RuntimeItem != null
        ? this.m_RuntimeItem.Item.Shape.MaxStack - this.Count
        : 0;
}
```

**堆叠操作**：

```csharp
public bool Add(RuntimeItem runtimeItem, bool canStack)
{
    // 空格子：直接设置根节点
    if (this.m_RuntimeItem == null)
    {
        this.m_RuntimeItem = runtimeItem;
        this.m_Stack = new Stack();
        return true;
    }
    
    // 可堆叠：加入链表
    if (canStack && this.CanStack(runtimeItem))
    {
        this.m_Stack.AddLast(runtimeItem);
        return true;
    }
    
    return false;
}

// LIFO出栈操作
public RuntimeItem Pop()
{
    if (this.m_RuntimeItem == null) return null;
    
    // 栈为空时取根节点
    if (this.m_Stack.Count == 0)
    {
        RuntimeItem result = this.m_RuntimeItem;
        this.m_RuntimeItem = null;
        return result;
    }
    
    // 否则取栈顶
    return this.m_Stack.RemoveLast();
}
```

---

### 2.5 **TBag/BagList/BagGrid - 背包类型层次**

**继承体系**：

```csharp
// 【抽象基类】定义背包接口
public abstract class TBag : IBag
{
    [SerializeField] private BagEquipment m_Equipment;
    [SerializeField] private BagCooldowns m_Cooldown;
    [SerializeField] private BagWealth m_Wealth;
    
    // 子类必须实现
    public abstract IBagShape Shape { get; }
    public abstract IBagContent Content { get; }
}

// 【具体实现】列表型背包
public class BagList : TBag
{
    [SerializeField] private BagShapeList m_Shape;
    [SerializeField] private BagContentList m_Content;
    
    public override IBagShape Shape => this.m_Shape;
    public override IBagContent Content => this.m_Content;
}

// 【具体实现】网格型背包
public class BagGrid : TBag
{
    [SerializeField] private BagShapeGrid m_Shape;
    [SerializeField] private BagContentGrid m_Content;
}
```

**设计优势**：
- 使用`[SerializeReference]`实现多态序列化
- 支持运行时切换背包类型
- 各功能模块（装备、冷却、财富）复用

---

### 2.6 **BagContent - 内容管理系统**

**抽象接口设计**：

```csharp
public abstract class TBagContent : IBagContent
{
    // 【存储结构】
    protected class Cells : TSerializableDictionary<IdString, Cell> {}
    protected class Stack : TSerializableDictionary<IdString, IdString> {}
    
    // 【事件系统】
    public event Action EventChange;
    public event Action<RuntimeItem> EventAdd;
    public event Action<RuntimeItem> EventRemove;
    public event Action<RuntimeItem> EventUse;
    
    // 【核心接口】
    public abstract bool CanAdd(RuntimeItem runtimeItem, bool allowStack);
    public abstract Vector2Int Add(RuntimeItem runtimeItem, bool allowStack);
    public abstract RuntimeItem Remove(RuntimeItem runtimeItem);
    public abstract bool Move(Vector2Int positionA, Vector2Int positionB, bool allowStack);
}
```

**BagContentList 实现要点**：

```csharp
public class BagContentList : TBagContent
{
    [SerializeField] private Cells m_Cells;       // RuntimeID -> Cell
    [SerializeField] private Stack m_Stack;       // StackItemID -> RootItemID
    [SerializeField] private List<IdString> m_Items;  // 顺序列表
    
    public override bool CanAdd(RuntimeItem runtimeItem, bool allowStack)
    {
        // 1. 检查是否已存在
        if (this.m_Cells.ContainsKey(runtimeItem.RuntimeID)) return false;
        
        // 2. 尝试堆叠到现有格子
        if (allowStack)
        {
            foreach (var entry in this.m_Cells)
            {
                if (entry.Value.CanStack(runtimeItem)) return true;
            }
        }
        
        // 3. 检查是否有空位
        return this.m_Items.Count + 1 <= this.Bag.Shape.MaxHeight;
    }
}
```

**关键算法 - 查找根节点**：

```csharp
protected IdString FindStackRoot(IdString runtimeItemID)
{
    // 从堆叠映射表中查找根节点ID
    return this.m_Stack.TryGetValue(runtimeItemID, out IdString rootID)
        ? rootID
        : runtimeItemID;
}
```

---

### 2.7 **BagEquipment - 装备系统**

**核心数据结构**：

```csharp
public class BagEquipment : IBagEquipment
{
    // 【配置引用】装备槽定义
    [SerializeField] private Equipment m_Equipment;
    
    // 【运行时数据】装备槽 -> RuntimeItem映射
    [SerializeField] private EquipmentRuntime m_EquipmentRuntime;
    
    // 【反向索引】ItemID -> 可装备槽位列表
    [NonSerialized] private Dictionary<IdString, List<int>> Equipment;
}
```

**装备算法**：

```csharp
public async Task<RuntimeItem> Equip(RuntimeItem runtimeItem)
{
    // 1. 查找兼容槽位
    int targetIndex = this.FindSlot(runtimeItem, out bool isEmpty);
    if (targetIndex < 0) return null;
    
    // 2. 卸载旧装备
    if (!isEmpty)
    {
        RuntimeItem oldItem = await this.UnequipFromIndex(targetIndex);
        if (oldItem != null) this.Bag.Content.Add(oldItem, true);
    }
    
    // 3. 装备新物品
    return await this.EquipToIndex(runtimeItem, targetIndex);
}

private int FindSlot(RuntimeItem runtimeItem, out bool isEmpty)
{
    IdString itemID = runtimeItem.ItemID;
    isEmpty = false;
    
    // 1. 查找该物品类型的所有可用槽位
    if (!this.Equipment.TryGetValue(itemID, out List<int> slots))
        return -1;
    
    // 2. 优先查找空槽
    foreach (int index in slots)
    {
        if (this.m_EquipmentRuntime[index] == null)
        {
            isEmpty = true;
            return index;
        }
    }
    
    // 3. 返回第一个非空槽（将替换）
    return slots.Count > 0 ? slots[0] : -1;
}
```

---

### 2.8 **RuntimeProperties - 属性系统**

**设计理念**：运行时可变属性+继承链属性合并

```csharp
public class RuntimeProperties : TSerializableDictionary<IdString, RuntimeProperty>
{
    public event Action EventChangeProperties;
    
    public RuntimeProperties(RuntimeItem parent)
    {
        // 【关键】展平继承链，收集所有属性
        Dictionary<IdString, Property> properties = 
            Properties.FlattenHierarchy(parent.Item);
        
        foreach (var entry in properties)
        {
            RuntimeProperty runtimeProperty = new RuntimeProperty(parent, entry.Value);
            runtimeProperty.EventChange += this.ExecuteEventChange;
            this[entry.Key] = runtimeProperty;
        }
    }
}
```

**属性继承展平算法**（在Properties类中）：

```csharp
public static Dictionary<IdString, Property> FlattenHierarchy(Item item)
{
    Dictionary<IdString, Property> result = new Dictionary<IdString, Property>();
    Stack<Item> hierarchy = new Stack<Item>();
    
    // 1. 构建继承链栈（从父到子）
    while (item != null)
    {
        hierarchy.Push(item);
        item = item.Parent;
    }
    
    // 2. 从父到子合并属性（子类覆盖父类）
    while (hierarchy.Count > 0)
    {
        Item current = hierarchy.Pop();
        foreach (var property in current.Properties.List)
        {
            result[property.ID] = property;  // 覆盖父类同名属性
        }
    }
    
    return result;
}
```

---

### 2.9 **RuntimeSockets - 插槽系统**

**设计特点**：支持物品附件、递归重量计算

```csharp
public class RuntimeSockets : TSerializableDictionary<IdString, RuntimeSocket>
{
    public static event Action<RuntimeItem, RuntimeItem> EventAttachRuntimeItem;
    public static event Action<RuntimeItem, RuntimeItem> EventDetachRuntimeItem;
    
    // 【附加物品】自动查找可用插槽
    public bool Attach(RuntimeItem parent, RuntimeItem attachment)
    {
        IdString socketID = IdString.EMPTY;
        
        // 1. 查找第一个兼容且空闲的插槽
        foreach (var entry in this)
        {
            if (!entry.Value.CanAttach(attachment)) continue;
            
            socketID = entry.Key;
            if (!entry.Value.HasAttachment) break;  // 优先空插槽
        }
        
        return this.AttachToSocket(parent, socketID, attachment);
    }
    
    internal bool AttachToSocket(RuntimeItem parent, IdString socketID, RuntimeItem attachment)
    {
        if (!this.TryGetValue(socketID, out RuntimeSocket socket)) return false;
        
        bool success = socket.Attach(attachment);
        if (!success) return false;
        
        // 【关键】触发属性重算
        parent.Properties.OnAttach(attachment);
        
        // 触发事件
        RuntimeItem.Socket_LastParentAttached = parent;
        RuntimeItem.Socket_LastAttachmentAttached = attachment;
        EventAttachRuntimeItem?.Invoke(parent, attachment);
        
        return true;
    }
}
```

---

### 2.10 **Usage - 使用系统**

**条件检查 + 指令执行模式**：

```csharp
public class Usage
{
    [SerializeField] private bool m_CanUse;
    [SerializeField] private bool m_ConsumeWhenUse;
    [SerializeField] private PropertyGetDecimal m_Cooldown;
    
    [SerializeField] private RunConditionsList m_ConditionsCanUse;
    [SerializeField] private RunInstructionsList m_InstructionsOnUse;
    
    // 【递归检查】支持父类条件继承
    private static bool RunCanUse(Item item, Args args, bool isLeaf)
    {
        if (isLeaf && !item.Usage.m_CanUse) return false;
        
        // 先检查父类条件
        if (item.Usage.m_ExecuteFromParent && item.Parent != null)
        {
            if (!RunCanUse(item.Parent, args, false)) return false;
        }
        
        // 再检查自身条件
        return item.Usage.m_ConditionsCanUse.Check(args, config);
    }
    
    // 【异步执行】
    public static async Task RunOnUse(Item item, Args args)
    {
        if (item.Usage.m_ExecuteFromParent && item.Parent != null)
            await RunOnUse(item.Parent, args);
        
        await item.Usage.m_InstructionsOnUse.Run(args, config);
    }
}
```

---

### 2.11 **Crafting - 制造系统**

**配方验证 + 原子性操作**：

```csharp
public class Crafting
{
    [SerializeField] private Ingredient[] m_Ingredients;
    [SerializeField] private RunConditionsList m_ConditionsCraft;
    [SerializeField] private RunInstructionsList m_InstructionsOnCraft;
    
    public static RuntimeItem Craft(Item item, Bag inputBag, Bag outputBag)
    {
        // 1. 前置检查
        if (!CanCraft(item, inputBag, outputBag)) return null;
        if (!EnoughCraftingIngredients(item, inputBag)) return null;
        
        // 2. 【关键】收集要删除的物品（用于回滚）
        List<RuntimeItem> removeList = new List<RuntimeItem>();
        
        for (int i = 0; i < item.Crafting.Ingredients.Length; ++i)
        {
            Ingredient ingredient = item.Crafting.Ingredients[i];
            for (int j = 0; j < ingredient.Amount; ++j)
            {
                RuntimeItem removeItem = inputBag.Content.RemoveType(ingredient.Item);
                if (removeItem != null)
                {
                    removeList.Add(removeItem);
                    continue;
                }
                
                // 【原子性】失败时回滚
                foreach (var restoreItem in removeList)
                    inputBag.Content.Add(restoreItem, true);
                return null;
            }
        }
        
        // 3. 尝试添加制造物品
        RuntimeItem craftItem = outputBag.Content.AddType(item, true);
        if (craftItem == null)
        {
            // 失败回滚
            foreach (var restoreItem in removeList)
                inputBag.Content.Add(restoreItem, true);
            return null;
        }
        
        // 4. 执行制造后指令
        item.Crafting.m_InstructionsOnCraft.Run(args, config);
        return craftItem;
    }
}
```

---

### 2.12 **Merchant - 商人系统**

**双背包交易模型**：

```csharp
public class Merchant : MonoBehaviour
{
    [SerializeField] private bool m_InfiniteCurrency;  // 无限金币
    [SerializeField] private bool m_InfiniteStock;     // 无限库存
    [SerializeField] private PropertyGetDecimal m_BuyRate;   // 购买倍率
    [SerializeField] private PropertyGetDecimal m_SellRate;  // 出售倍率
    
    public Bag Bag => this.m_Bag.Get<Bag>(this.gameObject);
    
    // 【购买逻辑】客户 -> 商人
    public RuntimeItem Buy(Bag clientBag, RuntimeItem merchantItem)
    {
        int price = this.GetBuyPrice(merchantItem);
        Currency currency = merchantItem.Currency;
        
        // 1. 检查客户金币
        if (clientBag.Wealth.Get(currency) < price) return null;
        
        // 2. 从商人背包移除物品
        RuntimeItem boughtItem = this.Bag.Content.Remove(merchantItem);
        if (boughtItem == null) return null;
        
        // 3. 转移金币
        clientBag.Wealth.Subtract(currency, price);
        if (!this.m_InfiniteCurrency)
            this.Bag.Wealth.Add(currency, price);
        
        // 4. 添加到客户背包
        bool success = clientBag.Content.Add(boughtItem, true) != Vector2Int.zero;
        if (!success)
        {
            // 【回滚】
            this.Bag.Content.Add(boughtItem, true);
            clientBag.Wealth.Add(currency, price);
            if (!this.m_InfiniteCurrency)
                this.Bag.Wealth.Subtract(currency, price);
            return null;
        }
        
        // 5. 无限库存模式：重新添加物品
        if (this.m_InfiniteStock)
        {
            RuntimeItem clone = new RuntimeItem(boughtItem, false);
            this.Bag.Content.Add(clone, true);
        }
        
        return boughtItem;
    }
    
    // 【价格计算】应用倍率
    public int GetBuyPrice(RuntimeItem item)
    {
        float rate = (float)this.m_BuyRate.Get(this.gameObject);
        return Mathf.CeilToInt(item.Price * rate);
    }
}
```

---

### 2.13 **LootTable - 掉落表系统**

**加权随机算法**：

```csharp
public class LootTable : ScriptableObject
{
    [SerializeField] private int m_NoDropRate;        // 不掉落权重
    [SerializeField] private LootList m_LootList;
    
    public bool Run(Bag outputBag)
    {
        List<Loot> chances = new List<Loot>();
        int totalRate = 0;
        
        // 1. 添加"不掉落"选项
        if (this.m_NoDropRate > 0)
        {
            totalRate += this.m_NoDropRate;
            chances.Add(new Loot(null, 0, this.m_NoDropRate));
        }
        
        // 2. 收集所有掉落项
        foreach (Loot loot in this.m_LootList.List)
        {
            chances.Add(loot);
            totalRate += loot.Rate;
        }
        
        // 3. 【关键】按权重降序排序（优化查找）
        chances.Sort((x, y) => y.Rate.CompareTo(x.Rate));
        
        // 4. 生成随机数
        int random = UnityEngine.Random.Range(0, totalRate);
        
        // 5. 线性查找掉落项
        foreach (Loot loot in chances)
        {
            if (random < loot.Rate)
            {
                // 执行掉落
                if (loot.IsItem)
                {
                    for (int i = 0; i < loot.Amount; ++i)
                    {
                        RuntimeItem item = outputBag.Content.AddType(loot.Item, true);
                        // 触发事件...
                    }
                }
                else if (loot.IsCurrency)
                {
                    outputBag.Wealth.Add(loot.Currency, loot.Amount);
                }
                return true;
            }
            random -= loot.Rate;  // 累减查找
        }
        
        return false;
    }
}
```

---

## 🎨 **三、UI系统架构**

### 3.1 UI层次结构

```
TBagUI (抽象基类)
├── BagListUI    # 列表视图
├── BagGridUI    # 网格视图
└── BagEquipUI   # 装备视图

TItemUI (物品UI基类)
├── ItemUI          # 静态物品
└── RuntimeItemUI   # 运行时物品

其他UI组件：
├── BagCellUI       # 格子UI
├── PropertyUI      # 属性显示
├── SocketUI        # 插槽UI
├── TooltipUI       # 提示框
├── MerchantUI      # 商人界面
└── TinkerUI        # 工匠界面（制造/分解）
```

### 3.2 BagListUI 实现要点

```csharp
public class BagListUI : TBagUI
{
    [SerializeField] private RectTransform m_Content;
    [SerializeField] private Item m_FilterByParent;  // 过滤器
    [SerializeField] private bool m_HideEquipped;    // 隐藏已装备
    
    public override void RefreshUI()
    {
        int cellListCount = this.Bag.Content.CountWithoutStack;
        List<int> cellIndices = new List<int>();
        
        // 1. 【过滤】收集要显示的格子索引
        for (int i = 0; i < cellListCount; ++i)
        {
            Cell cell = this.Bag.Content.GetContent(new Vector2Int(0, i));
            
            // 跳过已装备物品
            if (this.m_HideEquipped && this.Bag.Equipment.IsEquipped(cell.RootRuntimeItem))
                continue;
            
            cellIndices.Add(i);
        }
        
        // 2. 【动态UI池】调整子对象数量
        int numCells = cellIndices.Count;
        int numChildren = this.m_Content.childCount;
        
        int numCreate = numCells - numChildren;
        int numDelete = numChildren - numCells;
        
        for (int i = 0; i < numCreate; ++i) this.CreateCell();
        for (int i = 0; i < numDelete; ++i) this.DeleteCell(numCells + i);
        
        // 3. 刷新每个格子UI
        for (int i = 0; i < numCells; ++i)
        {
            BagCellUI cellUI = this.m_Content.GetChild(i).Get<BagCellUI>();
            if (cellUI != null) cellUI.RefreshUI(0, cellIndices[i]);
        }
    }
}
```

---

## 🔧 **四、关键设计模式**

### 4.1 **策略模式 (Strategy Pattern)**

**应用场景**：背包类型切换

```csharp
// Context
public class Bag : MonoBehaviour
{
    [SerializeReference] private TBag m_Bag;  // 可切换实现
}

// Strategy Interface
public abstract class TBag : IBag
{
    public abstract IBagShape Shape { get; }
    public abstract IBagContent Content { get; }
}

// Concrete Strategies
public class BagList : TBag { /* ... */ }
public class BagGrid : TBag { /* ... */ }
```

### 4.2 **组合模式 (Composite Pattern)**

**应用场景**：Item功能模块化

```csharp
public class Item : ScriptableObject
{
    private Info m_Info;
    private Shape m_Shape;
    private Price m_Price;
    private Properties m_Properties;
    private Sockets m_Sockets;
    private Equip m_Equip;
    private Usage m_Usage;
    private Crafting m_Crafting;
}
```

### 4.3 **工厂模式 (Factory Pattern)**

**应用场景**：RuntimeItem创建

```csharp
public class Item : ScriptableObject
{
    public RuntimeItem CreateRuntimeItem(Args args)
    {
        RuntimeItem newRuntimeItem = new RuntimeItem(this);
        this.m_Info.RunOnCreate(this, args);
        return newRuntimeItem;
    }
}
```

### 4.4 **观察者模式 (Observer Pattern)**

**应用场景**：事件系统

```csharp
// Subject
public class Cell
{
    public event Action EventChange;
}

// Observer
public class BagContentList : TBagContent
{
    public event Action EventChange;
    
    private void OnCellChange()
    {
        this.EventChange?.Invoke();
    }
}
```

### 4.5 **命令模式 (Command Pattern)**

**应用场景**：可视化脚本指令

```csharp
public abstract class Instruction
{
    protected abstract Task Run(Args args);
}

public class InstructionInventoryAddItem : Instruction
{
    protected override Task Run(Args args)
    {
        Bag bag = this.m_Bag.Get<Bag>(args);
        bag.Content.AddType(this.m_Item, true);
        return DefaultResult;
    }
}
```

---

## 🎯 **五、核心技术亮点**

### 5.1 **序列化多态**

使用`[SerializeReference]`实现接口序列化：

```csharp
[SerializeReference] private TBag m_Bag = new BagList();
```

### 5.2 **懒加载 + 缓存**

```csharp
[NonSerialized] private Item m_Item;

public Item Item
{
    get
    {
        if (this.m_Item == null)
        {
            InventoryRepository inventory = Settings.From<InventoryRepository>();
            this.m_Item = inventory.Items.Get(this.m_ItemID);
        }
        return this.m_Item;
    }
}
```

### 5.3 **GUID + Hash双重ID**

```csharp
public class RuntimeItem
{
    private IdString m_RuntimeID = new IdString($"{itemID}-{Guid.NewGuid():N}");
    
    // IdString内部：
    // - String: 原始字符串（用于Debug）
    // - Hash: int哈希值（用于快速比较）
}
```

### 5.4 **事件驱动 + 级联通知**

```csharp
private void Awake()
{
    // 级联订阅
    this.Shape.EventChange += () => this.EventChange?.Invoke();
    this.Content.EventChange += () => this.EventChange?.Invoke();
    this.Equipment.EventChange += (_, _) => this.EventChange?.Invoke();
}
```

### 5.5 **原子性操作 + 回滚机制**

在Crafting和Merchant系统中广泛使用：

```csharp
List<RuntimeItem> removeList = new List<RuntimeItem>();
// ... 执行操作 ...
if (失败)
{
    foreach (var item in removeList)
        Restore(item);  // 回滚
}
```

### 5.6 **属性继承展平算法**

```csharp
public static Dictionary<IdString, Property> FlattenHierarchy(Item item)
{
    Stack<Item> hierarchy = new Stack<Item>();
    while (item != null)
    {
        hierarchy.Push(item);
        item = item.Parent;
    }
    
    Dictionary<IdString, Property> result = new Dictionary<IdString, Property>();
    while (hierarchy.Count > 0)
    {
        Item current = hierarchy.Pop();
        foreach (var property in current.Properties.List)
            result[property.ID] = property;  // 子类覆盖父类
    }
    return result;
}
```

---

## 📊 **六、性能优化技巧**

### 6.1 **对象池模式**

UI系统使用动态调整：

```csharp
int numCreate = targetCount - currentCount;
for (int i = 0; i < numCreate; ++i) 
    CreateCell();

int numDelete = currentCount - targetCount;
for (int i = 0; i < numDelete; ++i) 
    DeleteCell(i);
```

### 6.2 **哈希查找优化**

使用`TSerializableDictionary`代替列表查找：

```csharp
protected class Cells : TSerializableDictionary<IdString, Cell> {}

// O(1)查找
if (this.m_Cells.TryGetValue(runtimeItemID, out Cell cell))
    return cell;
```

### 6.3 **延迟初始化**

```csharp
private void RequireSkinUI()
{
    if (this.SkinUI != null) return;
    
    // 只在需要时实例化UI
    GameObject prefab = this.m_SkinUI.Prefab;
    this.SkinUI = Instantiate(prefab).GetComponent<TBagUI>();
}
```

---

## 🧪 **七、可扩展性设计**

### 7.1 **开放接口**

所有核心类都提供接口访问：

```csharp
public interface IBagContent
{
    bool CanAdd(RuntimeItem runtimeItem, bool allowStack);
    Vector2Int Add(RuntimeItem runtimeItem, bool allowStack);
    RuntimeItem Remove(RuntimeItem runtimeItem);
}
```

### 7.2 **事件钩子**

提供丰富的事件监听点：

```csharp
public static event Action<RuntimeItem, RuntimeItem> EventAttachRuntimeItem;
public event Action<RuntimeItem> EventAdd;
public event Action<RuntimeItem> EventRemove;
```

### 7.3 **可视化脚本集成**

提供150+指令/条件/事件节点，支持无代码扩展。

---

## 📚 **八、总结**

### 核心架构优势：

1. **模块化分层**：ScriptableObject配置层 + 运行时逻辑层 + UI表现层清晰分离
2. **策略模式**：支持多种背包类型无缝切换
3. **事件驱动**：松耦合的通信机制
4. **原子性操作**：关键操作支持回滚，保证数据一致性
5. **继承体系**：支持物品属性继承与覆盖
6. **插槽系统**：支持递归物品组合与重量计算
7. **可扩展性**：接口化设计+可视化脚本集成

### 关键技术点：

- 序列化多态（SerializeReference）
- GUID + Hash双重ID系统
- 懒加载 + 缓存优化
- 字典优化查找性能
- UI对象池管理
- 属性展平算法
- 加权随机掉落算法

这是一个**企业级、生产就绪**的Inventory系统实现，代码质量高、架构清晰、性能优异，非常值得学习和参考！