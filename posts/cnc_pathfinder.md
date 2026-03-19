---
title: "cnc 寻路解析"
date: "2025-10-22"
tags: ["GameDev", "Pafhfinding"]
excerpt: "cnc 寻路解析"
---      

## 📍 **命令与征服：寻路和编队系统深度剖析**

---

### 🎯 **一、核心寻路算法架构**

#### **1. 寻路算法概述**

C&C使用的是一种**混合寻路算法**，结合了：
- **直线逼近（LOS - Line of Sight）**
- **边缘跟随（Edge Following）**
- **路径优化（Path Optimization）**

**核心思路**（从代码注释中提取）：
```cpp
/* 
 * The path algorithm works by following a LOS path to the target. If it
 * collides with an impassable spot, it uses an Edge following routine to
 * get around it. The edge follower moves along the edge in a clockwise or
 * counter clockwise fashion until finding the destination spot.
 */
```

---

### 🧠 **二、寻路核心流程详解**

#### **主函数：`FootClass::Find_Path()`**

```cpp
PathType * FootClass::Find_Path(CELL dest, FacingType *final_moves, int maxlen, MoveType threshhold)
```

**核心数据结构：**
```cpp
PathType {
    CELL Start;                  // 起点
    int Cost;                    // 路径代价
    int Length;                  // 路径长度
    FacingType *Command;         // 移动指令数组（方向序列）
    unsigned long *Overlap;      // 重叠检测位图
    int LastOverlap;            // 上次重叠位置
    int LastFixup;              // 上次修正位置
}
```

---

### 📊 **三、寻路流程图解**

```
┌─────────────────────────────────────┐
│   1. 直线逼近（LOS Path）              │
│   沿直线前往目标                       │
└──────────┬──────────────────────────┘
           │
           ▼
      遇到障碍？
           │
    ┌──────┴──────┐
    │YES          │NO
    ▼             ▼
┌────────────┐  继续前进
│ 2. 穿透扫描 │  直到到达
│Walk Through│
└──────┬─────┘
       │
       ▼
  找到可通过点？
       │
  ┌────┴────┐
  │YES      │NO
  ▼         ▼
┌──────────────┐  提升威胁容忍度
│ 3. 边缘跟随   │  重新尝试
│Follow Edge   │
│左右两边同时  │
│搜索最短路径  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 4. 路径优化   │
│消除回头路径  │
│合并对角移动  │
└──────────────┘
```

---

### 🔍 **四、具体问题解答**

#### **问题1：如果目标地点被多个单位围住，剩余单位如何处理？**

**答案：分层通行性检查 + 动态路径重算**

**可通行性等级（MoveType）：**
```cpp
enum MoveType {
    MOVE_OK,              // 完全可通行 (权重=1)
    MOVE_CLOAK,           // 隐形单位阻挡 (权重=1)
    MOVE_MOVING_BLOCK,    // 临时阻挡（单位正在移动）(权重=3)
    MOVE_DESTROYABLE,     // 可摧毁障碍 (权重=8)
    MOVE_TEMP,            // 友军临时阻挡 (权重=10)
    MOVE_NO               // 完全不可通行 (权重=0)
};
```

**处理逻辑：**

1. **首次尝试**（最优路径）：
```cpp
// 在 Basic_Path() 中
path = Find_Path(cell, &workpath1[0], sizeof(workpath1), MOVE_CLOAK);
// 只寻找完全空闲的路径
```

2. **如果失败，逐步放宽条件**：
```cpp
for (MoveType move = MOVE_MOVING_BLOCK; move < maxtype; move++) {
    path = Find_Path(cell, &workpath2[0], sizeof(workpath2), move);
    if (path && path->Cost && path->Cost < MAX((path1.Cost + (path1.Cost/2)), 3)) {
        // 找到了更好的路径，接受它
        memcpy(&path1, path, sizeof(path1));
    }
}
```

3. **具体场景处理：**

```cpp
int FootClass::Passable_Cell(CELL cell, FacingType face, int threat, MoveType threshhold)
{
    MoveType move = Can_Enter_Cell(cell, face);
    
    // 如果距离目标较远，降低对移动阻挡的容忍度
    if (move < MOVE_MOVING_BLOCK && Distance(cell) > 1) 
        threshhold = MOVE_MOVING_BLOCK;
    
    // 超过阈值，返回0表示不可通行
    if (move > threshhold) return(0);
    
    // 返回代价值
    static int _value[MOVE_COUNT] = {
        1,   // MOVE_OK
        1,   // MOVE_CLOAK
        3,   // MOVE_MOVING_BLOCK  ← 等待移动中的友军
        8,   // MOVE_DESTROYABLE
        10,  // MOVE_TEMP          ← 等待静止的友军
        0    // MOVE_NO
    };
    return(_value[move]);
}
```

**实际效果：**
- **目标被围住时**：单位会找到代价为3-10的路径（绕过或等待）
- **完全围死时**：`Basic_Path()` 返回 false，单位停止并播放"无法到达"音效
```cpp
if (!Basic_Path()) {
    if (IsNewNavCom) Sound_Effect(VOC_SCOLD);  // 播放"嘟嘟"声
}
```

---

#### **问题2：如果有两条路径，一条已占满，是否会选择另一条？**

**答案：会！通过 Overlap 位图和边缘跟随算法**

**关键机制1：Overlap List（重叠检测）**

```cpp
// 三个独立的重叠检测位图
static unsigned long MainOverlap[MAP_CELL_TOTAL/32];   // 主路径
static unsigned long LeftOverlap[MAP_CELL_TOTAL/32];   // 左侧绕行
static unsigned long RightOverlap[MAP_CELL_TOTAL/32];  // 右侧绕行
```

每个格子用1个bit标记是否已经被此路径访问过，防止**循环路径**。

**关键机制2：双向边缘跟随**

当遇到障碍时，同时尝试**顺时针**和**逆时针**绕行：

```cpp
// 左侧绕行
left = Follow_Edge(startcell, next, &pleft, COUNTERCLOCK, direction, ...);

// 右侧绕行  
right = Follow_Edge(startcell, next, &pright, CLOCK, direction, ...);

// 选择较短的路径
if (left && right) {
    if (pleft.Length < pright.Length) {
        which = &pleft;
    } else {
        which = &pright;
    }
}
```

**实际场景模拟：**

```
目标点 [T]
    ↑
    │
┌───┼───┐
│ A │ B │  ← 路径A已被单位占满（MOVE_TEMP）
├───┼───┤
│ C │ D │  ← 路径B仍然畅通（MOVE_OK）
└───┴───┘
    ↑
  单位起点
```

**寻路过程：**

1. **直线逼近**：尝试走 A → T
2. **检测到阻挡**：`Can_Enter_Cell(A) = MOVE_TEMP`（代价=10）
3. **启动边缘跟随**：
   - 左路：C → D → T（代价=3）
   - 右路：B → T（代价=10，因为B也有单位）
4. **选择左路**：pleft.Cost (3) < pright.Cost (10)

**关键代码证据：**

```cpp
// 在 Follow_Edge 中避免已经走过的路径
if (path->Overlap[pos] & (1 << bit)) {
    // 这个格子已经在路径中了！
    // 触发回溯或放弃此路径
    return(false);
}
```

---

### 🚗 **五、动态路径调整机制**

#### **实时阻挡检测**

```cpp
// 在 AI() 循环中不断检查
if (Path[0] != FACING_NONE && 
    Can_Enter_Cell(Adjacent_Cell(Coord_Cell(Center_Coord()), Path[0])) != MOVE_OK) {
    Path[0] = FACING_NONE;  // 清空路径，强制重算
}
```

#### **路径缩短优化**

```cpp
// 如果目标靠近了（比如目标也在移动），缩短预计算的路径
int d = Lepton_To_Cell(Distance(NavCom));
if (d < CONQUER_PATH_MAX) {
    Path[d] = FACING_NONE;  // 截断路径
}
```

---

### 🎮 **六、编队协同移动**

#### **步兵特殊机制：共享路径**

```cpp
#ifdef SPECIAL
if (What_Am_I() == RTTI_INFANTRY) {
    ObjectClass *obj = Map[mycell].Cell_Occupier();
    while (obj) {
        if (obj != this && obj->What_Am_I() == RTTI_INFANTRY) {
            InfantryClass *inf = (InfantryClass *)obj;
            // 如果友军步兵有相同目标且已有路径
            if (inf->NavCom == NavCom && inf->Path[0] != FACING_NONE) {
                // 复制路径，避免重复计算！
                Mem_Copy(inf->Path, Path, sizeof(Path));
                skip_path = true;
                break;
            }
        }
        obj = obj->Next;
    }
}
#endif
```

这个优化使得**多个步兵前往同一目标时，只需计算一次路径**！

---

### 🔧 **七、性能优化技巧**

#### **1. 路径延迟重算**

```cpp
TCountDownTimerClass PathDelay;
enum {PATH_DELAY=15, PATH_RETRY=10};

if (!PathDelay.Expired()) {
    return;  // 避免频繁重算路径
}
PathDelay = PATH_DELAY;
```

#### **2. 威胁评估**

```cpp
// 避开高威胁区域
if (Map.Cell_Threat(cell, Owner()) > threat) {
    return(0);  // 此格子太危险，不走！
}
```

#### **3. 路径长度限制**

```cpp
#define MAX_MLIST_SIZE 300  // 最多300步
```

避免计算超长路径导致卡顿。

---

### 🎯 **八、总结：C&C寻路系统的设计亮点**

| 特性 | 实现方法 | 优势 |
|------|----------|------|
| **多路径探索** | 双向边缘跟随 | 能找到被堵住的替代路径 |
| **动态阻挡处理** | 分层可通行性 + 实时重算 | 适应战场实时变化 |
| **性能优化** | 路径缓存 + 延迟重算 | 90年代硬件也能流畅运行 |
| **路径共享** | 同目标单位复用路径 | 大规模编队不卡顿 |
| **循环避免** | Overlap位图 | 防止单位原地打转 |
| **智能回退** | Unravel_Loop | 处理对角线导致的死循环 |

这套系统在1995年就已经非常成熟，至今仍值得学习！