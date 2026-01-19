---
title: "dual grid"
date: "2025-10-20"
tags: ["Unity", "2d", "tilemap","dualgrid"]
excerpt: "DualGrid 是一个为 Unity 设计的双网格瓦片地图系统，它使用两个网格来渲染瓦片"
ispublish: true
---       

# DualGrid 类库详细讲解

## 📚 库概述

**DualGrid** 是一个为 Unity 设计的双网格瓦片地图系统，它使用两个网格来渲染瓦片：
- **数据网格（Data Tilemap）**：存储逻辑瓦片数据
- **渲染网格（Render Tilemap）**：实际显示的视觉效果，相对数据网格偏移半个瓦片单位

## 🎯 核心概念

### 什么是双网格系统？

传统瓦片地图系统中，每个瓦片只能表示一种状态。而双网格系统通过**半瓦片偏移**的方式，让每个渲染瓦片代表**4个数据瓦片的交点**，从而用仅仅 **16 个瓦片** 就能表示所有可能的角落组合。

**优势：**
1. 🚀 **可扩展性**：只需16个瓦片就能创建所有组合，大大减少工作量
2. ✨ **灵活性**：支持完全圆角的设计，传统瓦片系统无法实现

## 🏗️ 核心架构

### 1. **DualGridRuleTile（双网格规则瓦片）**

```csharp
// 位置：Runtime/Tiles/DualGridRuleTile.cs
public class DualGridRuleTile : RuleTile<DualGridNeighbor>
```

**关键特性：**
- 继承自 Unity 的 `RuleTile`，扩展了自定义邻居检测逻辑
- 包含 `DualGridNeighbor` 常量定义：
  - `Filled = 1`：该方向的数据瓦片已填充
  - `NotFilled = 2`：该方向的数据瓦片未填充

**核心方法：**

```csharp
public override bool RuleMatches(TilingRule ruleToValidate, Vector3Int renderTilePosition, 
                                 ITilemap tilemap, ref Matrix4x4 transform)
{
    // 获取渲染瓦片对应的4个数据瓦片位置
    Vector3Int[] dataTilemapPositions = DualGridUtils.GetDataTilePositions(renderTilePosition);
    
    // 检查每个数据瓦片是否符合规则
    foreach (Vector3Int dataTilePosition in dataTilemapPositions)
    {
        if (!DoesRuleMatchWithDataTile(ruleToValidate, dataTilePosition, renderTilePosition))
            return false;
    }
    return true;
}
```

**工作原理：**
1. 当渲染瓦片需要更新时，检查其周围4个数据瓦片的状态
2. 根据这4个数据瓦片的填充情况（Filled/NotFilled）匹配规则
3. 选择对应的精灵（Sprite）进行渲染

---

### 2. **DualGridDataTile（数据瓦片）**

```csharp
// 位置：Runtime/Tiles/DualGridDataTile.cs
public class DualGridDataTile : Tile
```

**功能：**
- 简单的 `Tile` 扩展，存储在数据网格中
- 根据 `DualGridTilemapModule` 的配置决定是否显示 GameObject
- 不负责渲染，只记录逻辑状态

---

### 3. **DualGridTilemapModule（核心模块）**

```csharp
// 位置：Runtime/Components/DualGridTilemapModule.cs
[RequireComponent(typeof(Tilemap))]
public class DualGridTilemapModule : MonoBehaviour
```

**职责：**
- 连接数据网格和渲染网格
- 监听数据网格的变化，自动更新渲染网格

**关键属性：**
```csharp
public DualGridRuleTile RenderTile { get; }      // 渲染瓦片
public Tilemap DataTilemap { get; }              // 数据网格
public Tilemap RenderTilemap { get; }            // 渲染网格（子对象）
public GameObjectOrigin GameObjectOrigin { get; } // GameObject归属位置
```

**核心方法：**

```csharp
// 监听瓦片变化
internal void HandleTilemapChange(Tilemap tilemap, Tilemap.SyncTile[] tileChanges)
{
    if (tilemap == DataTilemap)
    {
        foreach (Tilemap.SyncTile tileChange in tileChanges)
        {
            RefreshRenderTiles(tileChange.position); // 刷新对应的渲染瓦片
        }
    }
}

// 刷新渲染瓦片
public virtual void RefreshRenderTiles(Vector3Int dataTilePosition)
{
    bool hasDataTile = DataTilemap.HasTile(dataTilePosition);
    
    // 获取该数据瓦片影响的4个渲染瓦片
    foreach (Vector3Int renderTilePosition in DualGridUtils.GetRenderTilePositions(dataTilePosition))
    {
        if (hasDataTile)
            SetRenderTile(renderTilePosition);
        else
            UnsetRenderTile(renderTilePosition);
    }
}
```

---

### 4. **DualGridUtils（工具类）**

```csharp
// 位置：Runtime/Utils/DualGridUtils.cs
public static class DualGridUtils
```

**核心算法：**

```csharp
// 从数据瓦片位置获取4个渲染瓦片位置
public static Vector3Int[] GetRenderTilePositions(Vector3Int dataTilePosition)
{
    return new Vector3Int[]
    {
        dataTilePosition + new Vector3Int(0, 0, 0),  // 左下
        dataTilePosition + new Vector3Int(1, 0, 0),  // 右下
        dataTilePosition + new Vector3Int(0, 1, 0),  // 左上
        dataTilePosition + new Vector3Int(1, 1, 0)   // 右上
    };
}

// 从渲染瓦片位置获取4个数据瓦片位置
public static Vector3Int[] GetDataTilePositions(Vector3Int renderTilePosition)
{
    return new Vector3Int[]
    {
        renderTilePosition - new Vector3Int(0, 0, 0),  // 自己
        renderTilePosition - new Vector3Int(1, 0, 0),  // 左边
        renderTilePosition - new Vector3Int(0, 1, 0),  // 下边
        renderTilePosition - new Vector3Int(1, 1, 0)   // 左下
    };
}
```

**坐标转换逻辑：**
- 渲染网格相对数据网格偏移 `(-0.5, -0.5, 0)`
- 每个数据瓦片对应4个渲染瓦片（右下、右上、左下、左上）
- 每个渲染瓦片被4个数据瓦片影响（自己、左、下、左下）

---

## 🎨 编辑器功能

### 1. **AutoDualGridRuleTileProvider（自动规则生成）**

```csharp
// 位置：Editor/AutoDualGridRuleTileProvider.cs
```

**功能：**
- 自动为16个瓦片配置规则
- 硬编码了16种邻居配置模式

**配置模式示例：**
```csharp
private static readonly Dictionary<int, List<NeighborPattern>> NeighborConfigurationsByIndex = new()
{
    { 0, CreatePattern(NotFilled, NotFilled, Filled, NotFilled) },  // 只有左下角填充
    { 1, CreatePattern(NotFilled, Filled, NotFilled, Filled) },     // 右上和右下填充
    // ... 其他14种组合
    { 15, CreatePattern(Filled, NotFilled, NotFilled, NotFilled) }, // 只有左上角填充
};
```

**使用方式：**
1. 导入16格的瓦片图（4x4切片）
2. 右键图片 → Create → 2D → Tiles → Dual Grid Rule Tile
3. 自动生成完整配置的规则瓦片

---

### 2. **DualGridBrush（自定义笔刷）**

```csharp
// 位置：Editor/DualGridBrush.cs
[CustomGridBrush(true, true, true, "Dual Grid Brush")]
public class DualGridBrush : GridBrush
```

**功能：**
- 扩展了标准的 `GridBrush`
- 在数据网格上绘制时，自动刷新渲染网格

**核心逻辑：**
```csharp
public override void BoxFill(GridLayout gridLayout, GameObject brushTarget, BoundsInt bounds)
{
    if (brushTarget.TryGetComponent(out DualGridTilemapModule module))
    {
        SetDualGridTiles(module, module.DataTile, bounds); // 使用DataTile填充
    }
}

private void SetDualGridTiles(DualGridTilemapModule module, DualGridDataTile tile, BoundsInt bounds)
{
    // 批量设置瓦片
    module.DataTilemap.SetTiles(tileChangeData.ToArray(), ignoreLockFlags: false);
    
    // 刷新渲染网格
    foreach (var position in bounds.allPositionsWithin)
    {
        module.RefreshRenderTiles(position);
    }
}
```

---

### 3. **DualGridTilemapModuleEditor（模块编辑器）**

```csharp
// 位置：Editor/Editors/DualGridTilemapModuleEditor.cs
```

**功能：**
1. **自动创建双网格结构**：
   ```csharp
   public static DualGridTilemapModule CreateNewDualGridTilemap(Grid grid = null)
   {
       // 创建数据瓦片地图
       var newDataTilemap = new GameObject("DataTilemap");
       var module = newDataTilemap.AddComponent<DualGridTilemapModule>();
       
       // 创建渲染瓦片地图（子对象，偏移-0.5）
       InitializeRenderTilemap(module);
       
       return module;
   }
   ```

2. **自动管理碰撞器**：
   - 根据瓦片的 `ColliderType` 自动添加/删除 `TilemapCollider2D`
   - `ColliderType.Sprite` → 渲染网格添加碰撞器
   - `ColliderType.Grid` → 数据网格添加碰撞器
   - `ColliderType.None` → 移除所有碰撞器

3. **可视化调试工具**：
   ```csharp
   private void DrawDataTileHandles()    // 绿色边框显示数据瓦片
   private void DrawRenderTileHandles()  // 黄色边框显示渲染瓦片
   private void DrawRenderTileConnections() // 红色箭头显示依赖关系
   ```

---

## 🔄 完整工作流程

### 用户操作流程

```
1. 准备16格瓦片图 (4x4切片)
   ↓
2. 创建 DualGridRuleTile（自动生成规则）
   ↓
3. 创建 Dual Grid Tilemap（GameObject → 2D Object → Tilemap → Dual Grid Tilemap）
   ↓
4. 配置 DualGridTilemapModule（分配 RenderTile）
   ↓
5. 在 DataTilemap 上绘制
   ↓
6. 自动在 RenderTilemap 上显示
```

### 数据流程

```
用户在 DataTilemap 绘制瓦片
    ↓
触发 Tilemap.tilemapTileChanged 事件
    ↓
DualGridTilemapModule.HandleTilemapChange()
    ↓
RefreshRenderTiles(dataTilePosition)
    ↓
DualGridUtils.GetRenderTilePositions() // 获取4个渲染位置
    ↓
对每个渲染位置：
    SetRenderTile() 或 UnsetRenderTile()
    ↓
RenderTilemap.SetTile() 或 RefreshTile()
    ↓
DualGridRuleTile.GetTileData()
    ↓
RuleMatches() // 检查规则
    ↓
DualGridUtils.GetDataTilePositions() // 检查4个数据瓦片
    ↓
匹配规则后选择正确的 Sprite 显示
```

---

## 💡 使用示例

### 基础使用

```csharp
// 1. 通过菜单创建
GameObject → 2D Object → Tilemap → Dual Grid Tilemap

// 2. 配置模块
DualGridTilemapModule module = GetComponent<DualGridTilemapModule>();
module.RenderTile = myDualGridRuleTile; // 分配规则瓦片
module.EnableTilemapCollider = true;    // 启用碰撞器
module.GameObjectOrigin = GameObjectOrigin.DataTilemap; // GameObject位置

// 3. 运行时操作
module.DataTilemap.SetTile(new Vector3Int(0, 0, 0), module.DataTile); // 添加瓦片
module.RefreshRenderTilemap(); // 手动刷新整个渲染网格
```

### 高级功能

```csharp
// 碰撞器配置
- ColliderType.None：无碰撞
- ColliderType.Sprite：基于精灵形状（用于渲染网格）
- ColliderType.Grid：基于网格形状（用于数据网格）

// GameObject 配置
- GameObjectOrigin.None：不生成GameObject
- GameObjectOrigin.DataTilemap：在数据网格生成
- GameObjectOrigin.RenderTilemap：在渲染网格生成
```

---

## 🔑 核心设计模式

1. **观察者模式**：监听 `Tilemap.tilemapTileChanged` 事件自动更新
2. **策略模式**：`DualGridRuleTile` 使用规则系统选择合适的精灵
3. **工具类模式**：`DualGridUtils` 提供坐标转换工具
4. **编辑器扩展**：大量自定义编辑器提供无缝 Unity 集成

---

## 📊 性能考虑

- **批量更新**：`RefreshRenderTilemap()` 批量处理所有瓦片
- **增量更新**：单个瓦片变化只更新相关的4个渲染瓦片
- **硬编码规则**：16种配置模式预定义，避免运行时计算

---

## 🎯 总结

DualGrid 是一个设计精巧的库，核心思想是：
- **用空间换效率**：两个网格（数据+渲染）实现强大功能
- **自动化流程**：从规则生成到瓦片更新全自动
- **深度集成**：完全兼容 Unity 的 Tilemap 系统

适用场景：
✅ 2D 地形生成
✅ 需要圆角设计的瓦片地图
✅ 快速原型开发
✅ 减少美术资源工作量

## 对xz平面的支持

- 1. 直接旋转grid
- 2. 修改grid,data tilemap,render tilemap的轴向(注意anchor,需要手动修改以适配对应轴向)
 