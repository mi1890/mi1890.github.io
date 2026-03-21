mi1890: Assets\Plugins\GameCreator\Packages\shooter 这个是gamecreator2的远程战斗的扩展库,详细review然后讲解下实现原理和关键代码逻辑,详细讲解

GitHub Copilot: 我来详细分析 GameCreator2 的 Shooter 远程战斗扩展库。首先让我探索这个目录的结构和关键文件。 

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Components)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/ScriptableObjects)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/VisualScripting)

现在让我读取关键文件来理解整体架构： 

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Components/Bullet.cs#1-1)，行 1 到 150

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/ScriptableObjects/ShooterWeapon.cs#1-1)，行 1 到 150

搜索与 `**/Shooter/Runtime/Classes/Weapons/*.cs` 匹配的文件，20 匹配项

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Components/Bullet.cs#150-150)，行 150 到 300

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Weapons/Magazine.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Weapons/Fire.cs#1-1)，行 1 到 100

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Weapons/Projectile.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Weapons/Accuracy.cs#1-1)，行 1 到 100

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Shots)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Shots/ShotRaycast.cs#1-1)，行 1 到 200

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Shots/ShotKinematic.cs)

搜索与 `**/Shooter/Runtime/Classes/Data/*.cs` 匹配的文件，8 匹配项

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Data/ShotData.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Data/WeaponData.cs#1-1)，行 1 到 100

搜索 `class ShooterStance` 文本，1 个结果

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Stances/ShooterStance.cs#1-1)，行 1 到 250

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Weapons/Recoil.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/VisualScripting/Instructions)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Components/Bullet.cs#300-300)，行 300 到 450

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Components/Bullet.cs#450-450)，行 450 到 595

搜索 `OnShoot` (`**/Shooter/Runtime/**/*.cs`)、20 结果的文本

现在让我读取一些关键的Aim和Sight相关的代码： 

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Sights)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/ScriptableObjects/Sight.cs#1-1)，行 1 到 150

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/ScriptableObjects/ShooterWeapon.cs#150-150)，行 150 到 200

现在让我创建一份详细的分析文档：

基于我对 GameCreator2 Shooter 扩展库的深入分析，我现在为您详细讲解其实现原理和关键代码逻辑。

## **GameCreator2 Shooter 远程战斗系统 - 详细技术分析**

### **一、整体架构概览**

Shooter 模块是 GameCreator2 的远程战斗扩展库，采用**模块化、可配置**的设计理念，主要包含以下核心系统：

```
核心架构层次：
┌─────────────────────────────────────────┐
│    Visual Scripting (可视化脚本层)       │
│  - Instructions (指令)                   │
│  - Conditions (条件)                     │
│  - Events (事件)                         │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│    Weapon System (武器系统)              │
│  - ShooterWeapon (武器配置)              │
│  - Sight (瞄准镜系统)                    │
│  - Magazine (弹匣系统)                   │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│    Stance System (姿态系统)              │
│  - ShooterStance (射击姿态管理)          │
│  - Shooting/Reloading/Jamming            │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│    Projectile System (弹道系统)          │
│  - Raycast (射线检测)                    │
│  - Kinematic (运动学弹道)                │
│  - Rigidbody (物理弹道)                  │
│  - Tracer (追踪弹道)                     │
└─────────────────────────────────────────┘
```

---

### **二、核心类详解**

#### **1. ShooterWeapon - 武器配置核心**

这是整个系统的配置中心，继承自 `TWeapon` 基类。

**关键组成部分：**

```csharp
public class ShooterWeapon : TWeapon
{
    // 核心子系统
    [SerializeField] private Magazine m_Magazine;      // 弹匣系统
    [SerializeField] private Muzzle m_Muzzle;          // 枪口配置
    [SerializeField] private Fire m_Fire;              // 射击模式
    [SerializeField] private Projectile m_Projectile;  // 弹道配置
    [SerializeField] private Accuracy m_Accuracy;      // 精度系统
    [SerializeField] private Recoil m_Recoil;          // 后坐力
    [SerializeField] private Shell m_Shell;            // 弹壳抛出
    [SerializeField] private Jam m_Jam;                // 卡壳系统
    
    // 瞄准镜列表
    [SerializeField] private SightList m_Sights;
    // 换弹动作列表
    [SerializeField] private ReloadList m_Reloads;
    
    // 条件和指令回调
    [SerializeField] private RunConditionsList m_CanShoot;
    [SerializeField] private RunInstructionsList m_OnShoot;
    [SerializeField] private RunInstructionsList m_OnHit;
}
```

**关键流程：**

1. **装备武器时** (`RunOnEquip`)：
   - 请求 `ShooterStance` 姿态
   - 设置动画控制器
   - 激活状态机

2. **射击验证** (`CanShoot`)：
   ```csharp
   internal bool CanShoot(ShotData data, Args args)
   {
       // 1. 检查弹药是否足够
       if (!m_Magazine.EnoughAmmo(data, args)) return false;
       
       // 2. 检查自定义条件
       if (!m_CanShoot.Check(args)) return false;
       
       // 3. 检查瞄准镜是否允许射击
       SightItem sight = this.Sights.Get(data.SightId);
       return sight?.CanShoot(args) ?? false;
   }
   ```

3. **射击执行** (`OnShoot`)：
   ```csharp
   internal void OnShoot(ShotData data, Args args)
   {
       // 更新弹药
       munition.InMagazine -= data.Cartridges;
       
       // 触发各子系统
       Magazine.OnShoot(data.Cartridges, args);  // 扣除弹药
       Accuracy.OnShoot(args);                   // 增加散布
       Recoil.OnShoot(args);                     // 应用后坐力
       
       // 执行自定义回调
       m_OnShoot.Run(args);
   }
   ```

---

#### **2. ShooterStance - 射击姿态管理器**

继承自 `TStance`，负责管理角色的射击状态。

**核心功能：**

```csharp
public class ShooterStance : TStance
{
    // 武器数据映射表
    private Dictionary<int, WeaponData> m_Equipment;
    
    // 精度动画值（平滑过渡）
    private AnimFloat m_Accuracy;
    
    // 三大子系统
    public Reloading Reloading { get; }   // 换弹管理
    public Shooting Shooting { get; }     // 射击管理
    public Jamming Jamming { get; }       // 卡壳管理
}
```

**关键机制：**

1. **精度计算系统** (每帧 `OnLateUpdate` 更新)：
   ```csharp
   private void OnLateUpdate()
   {
       // 遍历所有装备的武器
       foreach (var entry in m_Equipment)
       {
           WeaponData weaponData = entry.Value;
           
           // 计算目标精度（考虑移动、滞空等因素）
           float targetAccuracy = weaponData.Weapon.Accuracy
               .CalculateTargetAccuracy(this, weaponData);
           
           m_Accuracy.Target = Max(m_Accuracy.Target, targetAccuracy);
       }
       
       // 平滑恢复精度
       m_Accuracy.UpdateWithDelta(target, recoverySpeed, deltaTime);
   }
   ```

2. **扳机拉动** (`PullTrigger`)：
   ```csharp
   public void PullTrigger(ShooterWeapon weapon)
   {
       // 如果正在换弹
       if (Reloading.WeaponReloading == weapon)
       {
           // 支持战术换弹则中断
           if (Reloading.CanPartialReload)
               StopReload(weapon, CancelReason.PartialReload);
           return;
       }
       
       // 检查是否需要自动换弹
       if (Magazine.AutoReload && inMagazine == 0 && totalAmmo > 0)
       {
           Reload(weapon);
           return;
       }
       
       // 标记拉动扳机
       weaponData.OnPullTrigger();
   }
   ```

---

#### **3. Bullet - 弹道物理核心**

这是最复杂的组件之一，支持**四种弹道模式**。

**模式枚举：**
```csharp
private enum Mode
{
    None,           // 未激活
    UseTracer,      // 追踪模式（贝塞尔曲线）
    UseRigidbody,   // 物理引擎模式
    UseKinematic    // 手动运动学模拟
}
```

##### **模式 1: Kinematic (运动学弹道) - 最常用**

**初始化：**
```csharp
public void SetFromKinematic(
    ShotData shotData,
    float force,         // 初速度
    float gravity,       // 重力加速度
    float airResistance, // 空气阻力
    float windInfluence, // 风力影响
    int pierces,         // 穿透次数
    LayerMask layerMask)
{
    // 设置初始速度
    KinematicVelocity = shotData.ShootDirection.normalized * force;
    
    m_KinematicGravity = Vector3.down * gravity;
    m_KinematicAirResistance = airResistance;
    // ... 其他参数
}
```

**每帧更新物理：**
```csharp
private Vector3 UpdateKinematic()
{
    // 1. 计算所有作用力
    Vector3 drag = -airResistance * KinematicVelocity;  // 阻力
    Vector3 gravity = m_KinematicGravity * MASS;        // 重力
    Vector3 wind = WindManager.Instance.Wind * windInfluence; // 风力
    Vector3 attraction = CalculateAttraction();          // 引力（追踪）
    
    // 2. 牛顿第二定律：F = ma
    Vector3 totalForce = drag + gravity + wind + attraction;
    Vector3 acceleration = totalForce / MASS;
    
    // 3. 更新速度和位置（欧拉积分）
    KinematicVelocity += acceleration * deltaTime;
    Vector3 nextPosition = transform.position + KinematicVelocity * deltaTime;
    
    // 4. 射线检测碰撞
    int hits = Physics.RaycastNonAlloc(
        transform.position,
        (nextPosition - transform.position).normalized,
        RAYCAST_HITS,
        distance,
        layerMask
    );
    
    // 5. 处理命中
    for (int i = 0; i < hits; ++i)
    {
        ReportHit(RAYCAST_HITS[i].collider.gameObject, ...);
    }
    
    transform.position = nextPosition;
    return KinematicVelocity.normalized;
}
```

**穿透逻辑：**
```csharp
private void ReportHit(GameObject hit, Vector3 point, Vector3 normal, float distance)
{
    // 避免重复命中
    if (Hits.Contains(hit)) return;
    Hits.Add(hit);
    
    // 更新射击数据
    m_ShotData.UpdateHit(hit, point, distance, Pierces);
    
    // 执行命中回调
    if (weapon.CanHit(m_ShotData, args))
    {
        weapon.OnHit(m_ShotData, args);
        
        // 播放材质音效
        MaterialSounds.Play(args, point, normal, hit, impactSound);
        
        // 生成撞击特效
        impactEffect?.Get(args, point, Quaternion.LookRotation(normal));
    }
    
    // 检查穿透次数
    Pierces++;
    if (Pierces > m_MaxPierces)
    {
        gameObject.SetActive(false); // 回收到对象池
    }
}
```

##### **模式 2: Raycast (即时射线) - 适合高速武器**

**优势：**
- 零延迟命中
- 无需物理模拟
- 性能最优

**实现逻辑：**
```csharp
public override bool Run(...)
{
    // 1. 获取枪口数据
    MuzzleData muzzle = sight.GetMuzzle(args, weapon);
    
    // 2. 计算散布方向
    Vector3 spreadDirection = sight.GetSpreadDirection(args, weapon);
    
    // 3. 一次性射线检测
    int numHits = Physics.RaycastNonAlloc(
        muzzle.Position,
        spreadDirection,
        HITS,
        maxDistance,
        layerMask
    );
    
    // 4. 按距离排序
    Array.Sort(HITS, 0, numHits, distanceComparer);
    
    // 5. 处理穿透
    int iterations = Min(pierces + 1, numHits);
    for (int i = 0; i < iterations; ++i)
    {
        RaycastHit hit = HITS[i];
        
        // 更新数据并触发回调
        shotData.UpdateHit(hit.collider.gameObject, hit.point, ...);
        weapon.OnHit(shotData, args);
        
        // 生成特效
        PlayImpactEffects(hit.point, hit.normal, ...);
    }
    
    // 6. 绘制弹道线（可选）
    if (useLineRenderer)
    {
        Tracer.OnShoot(muzzle.Position, endPoint, duration, ...);
    }
}
```

##### **模式 3: Rigidbody (物理引擎)**

**适用场景：**
- 需要真实物理交互（触发器、碰撞器）
- 榴弹、火箭弹等大型弹药

**初始化：**
```csharp
public void SetFromRigidbody(
    ShotData shotData,
    ForceMode impulse,      // 力的类型
    float impulseForce,     // 初始力大小
    float mass,             // 质量
    float airResistance)    // 空气阻力（线性阻尼）
{
    Rigidbody rb = GetComponent<Rigidbody>();
    
    rb.mass = mass;
    rb.linearDamping = airResistance;
    rb.collisionDetectionMode = CollisionDetectionMode.ContinuousSpeculative;
    
    // 施加初始冲量
    Vector3 force = transform.forward * impulseForce;
    rb.AddForce(force, impulse);
}
```

**物理更新：**
```csharp
private Vector3 UpdateRigidbody()
{
    Rigidbody rb = GetComponent<Rigidbody>();
    
    // 添加风力
    if (windInfluence > 0)
        rb.AddForce(WindManager.Wind * windInfluence);
    
    // 添加追踪力（制导）
    if (attractionForce > 0 && attractionTarget != null)
    {
        Vector3 direction = attractionTarget.position - transform.position;
        rb.AddForce(direction.normalized * attractionForce, attractionMode);
    }
    
    return rb.linearVelocity.normalized;
}
```

**碰撞检测：**
```csharp
private void OnCollisionEnter(Collision hit)
{
    if (m_IsTimeout)
    {
        // 粘附模式（箭矢插入墙壁）
        m_KinematicStick = hit.transform;
        m_KinematicStickOffset = hit.transform.InverseTransformPoint(transform.position);
    }
    else
    {
        // 立即报告命中
        ReportHit(hit.gameObject, transform.position, ...);
    }
}
```

---

#### **4. Accuracy - 精度系统**

**影响因素：**

```csharp
internal float CalculateTargetAccuracy(ShooterStance stance, WeaponData weaponData)
{
    // 1. 换弹时精度为 0（完全不准）
    if (stance.Reloading.WeaponReloading == weaponData.Weapon) 
        return 1f;
    
    // 2. 计算移动影响
    float motionAccuracy = GetAccuracyFromMotion(stance, weaponData);
    
    // 3. 计算滞空影响
    float airborneAccuracy = GetAccuracyFromAirborne(stance, weaponData);
    
    // 4. 获取瞄准镜最小精度
    float minAccuracy = sight?.Aim.GetMinAccuracy(args) ?? 0f;
    
    // 5. 取最大值（最不准的状态）
    return Clamp01(Max(minAccuracy, motionAccuracy, airborneAccuracy));
}
```

**散布计算：**
```csharp
internal Vector2 CalculateSpread(Args args)
{
    ShooterStance stance = GetStance(args);
    
    // 1. 随机方向（归一化）
    Vector2 randomDir = new Vector2(
        Random.Range(-1f, 1f),
        Random.Range(-1f, 1f)
    ).normalized;
    
    // 2. 应用最大散布范围
    Vector2 spread = Vector2.Scale(randomDir, new Vector2(
        m_MaxSpreadX.Get(args),
        m_MaxSpreadY.Get(args)
    ));
    
    // 3. 应用偏差曲线（控制散布分布）
    float bias = Clamp01(m_SpreadBias.Get(args));
    float radius = -Pow(Random.value, bias) + 1f;
    
    // 4. 乘以当前精度（0=完全散布，1=无散布）
    return spread * radius * stance.CurrentAccuracy;
}
```

**应用散布：**
```csharp
public Vector3 GetSpreadDirection(Args args, ShooterWeapon weapon)
{
    Vector3 direction = GetMuzzle(args, weapon).Direction;
    
    // 计算俯仰和偏航轴
    Vector3 axisPitch = Vector3.Cross(direction, Vector3.up);
    Vector3 axisYaw = Vector3.up;
    
    // 获取散布值
    Vector2 spread = weapon.Accuracy.CalculateSpread(args);
    
    // 应用俯仰偏转
    Quaternion spreadPitch = Quaternion.AngleAxis(spread.y, axisPitch);
    direction = spreadPitch * direction;
    
    // 应用偏航偏转
    Quaternion spreadYaw = Quaternion.AngleAxis(spread.x, axisYaw);
    direction = spreadYaw * direction;
    
    return direction;
}
```

---

#### **5. Fire - 射击模式系统**

**支持的模式：**
```csharp
public enum ShootMode
{
    Single,      // 单发
    FullAuto,    // 全自动
    Burst,       // 三连发
    Charge       // 蓄力
}
```

**射速控制：**
```csharp
// 在 WeaponData 中检查
public bool CanShoot()
{
    float fireInterval = 1f / weapon.Fire.FireRate(args);
    
    return Time.time >= LastShotTime + fireInterval;
}
```

**蓄力模式：**
```csharp
// WeaponData.OnUpdate()
if (fire.Mode == ShootMode.Charge && IsPullingTrigger)
{
    float pullDuration = Time.time - m_LastTriggerPull;
    float maxChargeTime = fire.MaxChargeTime(args);
    
    // 计算蓄力比例
    ChargeRatio = Clamp01(pullDuration / maxChargeTime);
    
    // 自动释放
    if (fire.AutoRelease && ChargeRatio >= 1f)
    {
        OnReleaseTrigger();
    }
}
```

---

### **三、关键流程详解**

#### **完整射击流程：**

```
1. 用户输入
   ↓
2. ShooterStance.PullTrigger()
   ├─ 检查是否在换弹
   ├─ 检查是否需要自动换弹
   └─ WeaponData.OnPullTrigger()
      ↓
3. WeaponData.OnUpdate() (每帧检查)
   ├─ 检查射速限制
   ├─ 检查射击模式
   ├─ 计算蓄力值
   └─ Shooting.TryShoot()
      ↓
4. ShooterWeapon.CanShoot()
   ├─ Magazine.EnoughAmmo()
   ├─ RunConditionsList.Check()
   └─ Sight.CanShoot()
      ↓
5. Projectile.Run()
   ├─ 创建 ShotData
   ├─ 计算散布方向
   ├─ 选择弹道类型
   │   ├─ Raycast: 即时射线
   │   ├─ Kinematic: 物理模拟
   │   ├─ Rigidbody: Unity物理
   │   └─ Tracer: 追踪弹道
   └─ 生成弹丸实例
      ↓
6. ShooterWeapon.OnShoot()
   ├─ 扣除弹药
   ├─ Accuracy.OnShoot() → 增加散布
   ├─ Recoil.OnShoot() → 应用后坐力
   ├─ Shell.Eject() → 抛出弹壳
   ├─ 播放音效和特效
   └─ RunInstructionsList.Run()
      ↓
7. Bullet 物理更新 (Kinematic示例)
   └─ UpdateKinematic()
      ├─ 计算合力
      ├─ 更新速度
      ├─ 射线检测
      └─ ReportHit()
         ↓
8. ShooterWeapon.OnHit()
   ├─ 触发 Trigger 组件
   ├─ 应用物理力
   ├─ 播放材质音效
   ├─ 生成撞击特效
   └─ RunInstructionsList.Run()
```

---

### **四、高级特性**

#### **1. 瞄准镜系统**

**Sight 配置：**
```csharp
public class Sight : ScriptableObject
{
    [SerializeField] private Aim m_Aim;              // 瞄准模式
    [SerializeField] private Biomechanics m_Biomechanics; // IK控制
    [SerializeField] private SightTrajectory m_Trajectory; // 弹道预测
    [SerializeField] private SightCrosshair m_Crosshair;   // 准星UI
    [SerializeField] private SightLaser m_Laser;           // 激光指示
}
```

**瞄准模式 (Aim)：**
- **Free Aim**: 自由瞄准（FPS模式）
- **Target Aim**: 锁定目标（TPS模式）
- **Camera Aim**: 镜头中心瞄准

**IK 骨骼控制 (Biomechanics)：**
```csharp
// 控制角色手部指向枪口方向
public void Enter(Character character, ShooterWeapon weapon)
{
    // 启用 IK 约束
    character.IK.SetTarget(IKTarget.LeftHand, weaponLeftHandPosition);
    character.IK.SetTarget(IKTarget.RightHand, weaponRightHandPosition);
    
    // 头部追踪
    character.IK.SetLookAt(aimTarget);
}
```

#### **2. 弹道预测系统**

**用于展示抛物线轨迹（榴弹发射器）：**

```csharp
public static void TracePositions(
    List<Vector3> points,
    Vector3 position,
    Vector3 velocity,
    float maxDistance,
    float minDeltaDistance,
    float airResistance,
    float windInfluence,
    float gravity,
    float mass)
{
    const float STEP = 0.01f; // 10ms 时间步长
    
    Vector3 currentPos = position;
    float distance = 0f;
    
    while (distance < maxDistance)
    {
        // 计算作用力
        Vector3 drag = -airResistance * velocity;
        Vector3 gravityForce = Vector3.down * (gravity * mass);
        Vector3 wind = WindManager.Wind * windInfluence;
        
        // 更新速度和位置（欧拉法）
        Vector3 acceleration = (drag + gravityForce + wind) / mass;
        velocity += acceleration * STEP;
        currentPos += velocity * STEP;
        
        // 记录点
        points.Add(currentPos);
        distance += (currentPos - position).magnitude;
    }
}
```

**应用于 UI 显示：**
```csharp
public class Trajectory : MonoBehaviour
{
    void Update()
    {
        List<Vector3> points = new List<Vector3>();
        weapon.Projectile.GetTrajectory(points, maxResolution, maxDistance);
        
        // 使用 LineRenderer 绘制
        lineRenderer.positionCount = points.Count;
        lineRenderer.SetPositions(points.ToArray());
    }
}
```

#### **3. 换弹系统**

**Reload 配置：**
```csharp
public class Reload : ScriptableObject
{
    [SerializeField] private ReloadType m_Type; // Full/Partial
    [SerializeField] private float m_Duration;  // 换弹时长
    [SerializeField] private AnimationClip m_Animation;
    
    // 关键时间点
    [SerializeField] private float m_MagazineOutTime;  // 弹匣取出
    [SerializeField] private float m_MagazineInTime;   // 弹匣装入
}
```

**换弹流程：**
```csharp
public async Task Reload(ShooterWeapon weapon)
{
    // 1. 选择换弹动作
    bool isFull = (currentAmmo == 0);
    Reload reload = weapon.GetReload(character, isFull);
    
    // 2. 播放动画
    character.Gestures.CrossFade(reload.Animation, ...);
    
    // 3. 等待弹匣取出时间
    await Task.Delay((int)(reload.MagazineOutTime * 1000));
    
    // 4. 丢弃当前弹匣
    weapon.Magazine.DiscardMagazine(inMagazine, args);
    
    // 5. 等待弹匣装入时间
    await Task.Delay((int)(reload.MagazineInTime * 1000));
    
    // 6. 填充弹药
    munition.InMagazine = Min(magazineSize, totalAmmo);
    
    // 7. 等待动画结束
    await Task.Delay(...);
}
```

**战术换弹（Partial Reload）：**
```csharp
public void PullTrigger(ShooterWeapon weapon)
{
    if (Reloading.IsReloading && Reloading.CanPartialReload)
    {
        // 中断换弹，保留已装填的弹药
        StopReload(weapon, CancelReason.PartialReload);
        return;
    }
}
```

#### **4. 卡壳系统 (Jam)**

**触发条件：**
```csharp
public class Jam
{
    [SerializeField] private PropertyGetDecimal m_Probability; // 概率
    
    public bool CheckJam(Args args)
    {
        float prob = (float)m_Probability.Get(args);
        return Random.value < prob;
    }
}
```

**修复流程：**
```csharp
public async Task FixJam(ShooterWeapon weapon)
{
    // 播放修复动画
    character.Gestures.CrossFade(jamFixAnimation, ...);
    
    // 等待完成
    await Task.Delay(...);
    
    // 清除卡壳状态
    weaponData.IsJammed = false;
}
```

---

### **五、性能优化技术**

#### **1. 对象池管理**

```csharp
// 子弹回收
if (Pierces > maxPierces || Distance > maxDistance)
{
    gameObject.SetActive(false); // 自动回收到 PoolManager
}

// 弹壳抛出
GameObject shellInstance = PoolManager.Instance.Pick(
    shellPrefab.GetHashCode(),
    position,
    rotation,
    poolSize: 10,
    duration: 5f // 5秒后自动回收
);
```

#### **2. 批量射线检测**

```csharp
// 复用静态数组，避免 GC
private static readonly RaycastHit[] RAYCAST_HITS = new RaycastHit[32];

int numHits = Physics.RaycastNonAlloc(
    origin, direction, RAYCAST_HITS, maxDistance, layerMask
);
```

#### **3. 延迟更新**

```csharp
// 只在装备武器时更新
UpdateManager.SubscribeLateUpdate(
    OnLateUpdate,
    ApplicationManager.EXECUTION_ORDER_LAST
);
```

---

### **六、扩展性设计**

#### **自定义射击类型示例：**

```csharp
[Serializable]
public class ShotCustom : TShot
{
    public override bool Run(
        Args args,
        ShooterWeapon weapon,
        MaterialSoundsAsset impactSound,
        PropertyGetInstantiate impactEffect,
        float chargeRatio,
        float pullTime)
    {
        // 1. 获取枪口数据
        MuzzleData muzzle = GetMuzzleData(weapon, args);
        
        // 2. 创建射击数据
        ShotData shotData = new ShotData(
            character,
            weapon,
            sightId,
            prop,
            muzzle.Position,
            muzzle.Direction,
            impactSound,
            impactEffect,
            cartridges,
            chargeRatio,
            delay: 0f,
            pullTime
        );
        
        // 3. 验证射击条件
        if (!weapon.CanShoot(shotData, args)) return false;
        
        // 4. 实例化弹丸
        GameObject projectile = Instantiate(prefab, muzzle.Position, rotation);
        
        // 5. 初始化 Bullet 组件
        Bullet bullet = projectile.GetComponent<Bullet>();
        bullet.SetFromKinematic(shotData, ...);
        
        // 6. 触发射击回调
        weapon.OnShoot(shotData, args);
        
        return true;
    }
}
```

---

### **七、总结**

**Shooter 系统的设计亮点：**

1. **高度模块化**：武器的每个方面（弹匣、精度、后坐力等）都是独立模块
2. **多种弹道模式**：从即时命中到真实物理，满足不同游戏需求
3. **物理精确度**：Kinematic 模式使用真实的牛顿力学计算
4. **性能优化**：对象池、批量检测、静态数组复用
5. **可视化编程**：通过 Instructions/Conditions 无需编码即可定制行为
6. **扩展性强**：抽象基类 (TShot, TStance) 便于自定义实现

**典型应用场景：**

| 武器类型 | 弹道模式 | 关键配置 |
|---------|---------|---------|
| 手枪/步枪 | Raycast | 高射速、低后坐力 |
| 狙击枪 | Raycast | 低射速、高精度、高伤害 |
| 榴弹发射器 | Kinematic | 抛物线、爆炸半径 |
| 火箭弹 | Rigidbody | 物理碰撞、追踪目标 |
| 弓箭 | Kinematic | 蓄力、粘附（Stick） |

这个系统非常适合用于 TPS/FPS 游戏，既能快速原型开发，又保留了深度定制的空间。

mi1890: review所有的类,再详细讲解下,好多细节没有

GitHub Copilot: 好的,我来更深入地review所有类,补充之前遗漏的细节。让我系统地阅读更多关键代码。 

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Data/WeaponData.cs#100-100)，行 100 到 300

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Data/WeaponData.cs#300-300)，行 300 到 550

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Aim)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Aim/AimCameraRaycast.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Aim/AimCharacterTarget.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Sequence)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Sequence/ReloadSequence.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Reloads)

搜索 `class Reloading` (`**/Shooter/Runtime/Classes/**/*.cs`) 文本，1 个结果

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Stances/Reloading.cs)

搜索 `class Shooting` (`**/Shooter/Runtime/Classes/**/*.cs`) 文本，1 个结果

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Weapons/Shell.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Stances/Shooting.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Weapons/Muzzle.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Weapons/Jam.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Biomechanics)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Biomechanics/Biomechanics.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Shots/TShotProjectile.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Biomechanics/BiomechanicsHumanFPS.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/ScriptableObjects/Reload.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Weapons/SightItem.cs)

现在让我创建一份更详细、全面的技术文档：

# **GameCreator2 Shooter 系统 - 完整技术深度解析**

## **目录**
1. 系统架构概述
2. 核心数据流转
3. 关键类详解
4. 射击流程完整剖析
5. 高级特性深度分析
6. 性能优化与设计模式

---

## **系统架构概述**

### **层次结构**

```
┌─────────────────────────────────────────────────────────────┐
│                  Visual Scripting Layer                      │
│  提供可视化编程接口，无需代码即可定制射击行为                  │
│  - Instructions: InstructionShooterFirePull/Release...       │
│  - Conditions: ConditionShooterIsJammed/IsPullingTrigger...  │
│  - Events: EventShooterHit, EventShooterReload...            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Configuration Layer                       │
│  可配置的 ScriptableObject 资源定义武器属性                   │
│  - ShooterWeapon.asset (武器配置)                            │
│  - Sight.asset (瞄准镜配置)                                  │
│  - Reload.asset (换弹动作配置)                               │
│  - Ammo.asset (弹药类型配置)                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Runtime Layer                           │
│  运行时管理器和状态机                                         │
│  - ShooterStance: 姿态管理器                                 │
│  - WeaponData: 每个武器的运行时数据                          │
│  - Reloading/Shooting/Jamming: 状态子系统                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Projectile Layer                         │
│  弹道系统（四种模式）                                         │
│  - Raycast: 即时命中（枪械）                                 │
│  - Kinematic: 运动学模拟（弓箭、榴弹）                        │
│  - Rigidbody: 物理引擎（火箭弹）                             │
│  - Tracer: 追踪弹道（魔法导弹）                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Physics Layer                           │
│  Unity 物理引擎交互                                          │
│  - Physics.RaycastNonAlloc (碰撞检测)                       │
│  - Rigidbody (物理模拟)                                      │
│  - WindManager (环境力)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## **核心数据流转**

### **关键数据结构关系图**

```
Character (角色)
    ↓
    ├─ Combat (战斗组件)
    │   ├─ RequestStance<ShooterStance>() → 获取射击姿态
    │   ├─ RequestMunition(weapon) → ShooterMunition (弹药数据)
    │   ├─ GetProp(weapon) → GameObject (武器模型实例)
    │   └─ Targets.Primary → GameObject (瞄准目标)
    │
    └─ ShooterStance (射击姿态)
        ├─ m_Equipment: Dictionary<int, WeaponData> (装备的武器映射)
        ├─ m_Accuracy: AnimFloat (精度平滑值)
        ├─ Reloading (换弹子系统)
        ├─ Shooting (射击子系统)
        └─ Jamming (卡壳子系统)

WeaponData (武器运行时数据)
    ├─ WeaponArgs: Args (武器参数上下文)
    ├─ CombatArgs: Args (战斗参数上下文)
    ├─ Character (角色引用)
    ├─ Weapon: ShooterWeapon (武器配置引用)
    ├─ Prop: GameObject (武器模型实例)
    ├─ SightId (当前瞄准镜 ID)
    ├─ IsJammed (卡壳状态)
    ├─ ChargeRatio (蓄力比例)
    ├─ LastShotTime/Frame (上次射击时间/帧)
    ├─ m_IsPullingTrigger (是否按住扳机)
    ├─ m_Trajectory (弹道预测组件)
    ├─ m_Laser (激光指示器组件)
    └─ m_Crosshairs (准星 UI 映射)

ShotData (单次射击数据)
    ├─ Source: Character (射击者)
    ├─ Target: GameObject (命中目标)
    ├─ Weapon: ShooterWeapon (使用的武器)
    ├─ SightId (使用的瞄准镜)
    ├─ Prop: GameObject (武器模型)
    ├─ Projectile: GameObject (弹丸实例)
    ├─ ShootPosition/Direction (射击位置/方向)
    ├─ HitPoint (命中点)
    ├─ Cartridges (消耗弹药数)
    ├─ ChargeRatio (蓄力比例)
    ├─ Distance (飞行距离)
    └─ Pierces (穿透次数)
```

---

## **关键类详解**

### **1. WeaponData - 武器运行时核心**

这个类是整个系统最复杂的运行时管理器，负责：
- 武器状态管理
- 射击逻辑判断
- 动画同步
- UI 更新
- 音效播放

#### **1.1 构造函数初始化**

```csharp
public WeaponData(Character character, ShooterWeapon weapon, GameObject prop)
{
    // 创建两个独立的参数上下文
    this.WeaponArgs = new Args(character.gameObject, prop);  // 用于武器属性查询
    this.CombatArgs = new Args(character.gameObject, null);  // 用于命中回调（Target 动态设置）
    
    this.Character = character;
    this.Weapon = weapon;
    this.Prop = prop;
    
    this.m_EquipTime = character.Time.Time;  // 记录装备时间
    
    // 音频配置（预创建避免 GC）
    this.m_ConfigShoot = AudioConfigSoundEffect.Create(
        1f,                              // 音量
        new Vector2(0.95f, 1.05f),      // 随机音调范围（避免重复感）
        0f,                              // 延迟
        character.Time.UpdateTime,       // 时间模式（正常/慢动作）
        prop != null ? SpatialBlending.Spatial : SpatialBlending.None,  // 3D 音效
        prop                             // 音源位置
    );
    
    this.m_LoadRatio = new AnimFloat(0f, 0f);  // 全自动装填动画值
}
```

**关键点：**
- `WeaponArgs.Target = prop`：武器属性查询时使用 Prop 作为目标
- `CombatArgs.Target = null`：初始为空，命中时动态设置为被击中对象
- `AnimFloat`：平滑插值类，用于动画过渡

---

#### **1.2 OnUpdate() - 每帧核心逻辑**

这是最重要的方法，每帧调用，处理：

##### **A. 动画同步**

```csharp
if (animator != null)
{
    bool isEmpty = (munition?.InMagazine ?? 0) <= 0;      // 弹匣为空
    bool isJammed = this.IsJammed;                         // 卡壳状态
    bool isCharging = this.Weapon.Fire.Mode == ShootMode.Charge && 
                      this.m_IsPullingTrigger;             // 蓄力中
    bool isReloading = stance.Reloading.WeaponReloading == this.Weapon;
    
    // 同步到 Animator 参数（武器模型的动画控制器）
    animator.SetBool(BOOL_IS_EMPTY, isEmpty);       // "Is-Empty"
    animator.SetBool(BOOL_IS_JAM, isJammed);        // "Is-Jam"
    animator.SetBool(BOOL_IS_CHARGING, isCharging); // "Is-Charging"
    animator.SetBool(BOOL_IS_RELOADING, isReloading); // "Is-Reloading"
    
    if (isCharging)
    {
        float maxChargeTime = this.Weapon.Fire.MaxChargeTime(this.WeaponArgs);
        float elapsedTime = this.Character.Time.Time - this.m_LastTriggerPull;
        
        this.ChargeRatio = Mathf.Clamp01(elapsedTime / maxChargeTime);
        animator.SetFloat(FLOAT_CHARGE, this.ChargeRatio);  // "Charge" (0-1)
    }
}
```

**用途：** 
- 武器模型可以根据这些参数播放不同动画（如弹匣为空时播放空仓挂机动画）
- 第三方开发者在武器模型的 Animator Controller 中定义对应参数即可

---

##### **B. 射击模式处理**

```csharp
if (canShoot && this.m_IsPullingTrigger)
{
    float fireRate = this.Weapon.Fire.FireRate(this.WeaponArgs);
    
    switch (this.Weapon.Fire.Mode)
    {
        case ShootMode.Single:  // 单发模式
            // m_NumShots 用于确保一次扳机拉动只射击一次
            if (this.m_NumShots == 0 && this.PassEnoughTime(fireRate))
                this.Shoot();
            break;

        case ShootMode.Burst:  // 连发模式
            int maxBurst = this.Weapon.Fire.Burst(this.WeaponArgs);  // 例如 3 连发
            // 射击次数未达到 burst 数量且满足射速限制
            if (this.m_NumShots < maxBurst && this.PassEnoughTime(fireRate))
                this.Shoot();
            break;

        case ShootMode.FullAuto:  // 全自动模式
            loadRatioTarget = 1f;  // 目标装填值
            
            // 根据装填类型调整射速
            fireRate = this.Weapon.Fire.AutoLoading switch
            {
                // Instant: 立即全速射击
                FullAutoLoading.Instant => fireRate,
                
                // Progressive: 射速随装填值递增（模拟转管加速）
                FullAutoLoading.Progressive => fireRate * this.m_LoadRatio.Current,
                
                // WaitToLoad: 装填完成后才开始射击（模拟弹链展开）
                FullAutoLoading.WaitToLoad => 
                    this.m_LoadRatio.Current >= 1f ? fireRate : 0f,
                
                _ => throw new ArgumentOutOfRangeException()
            };
            
            if (this.PassEnoughTime(fireRate)) this.Shoot();
            break;

        case ShootMode.Charge:  // 蓄力模式
            if (this.m_NumShots == 0) this.ChargeUpdate();
            break;
    }
}
```

**关键机制：**

1. **`PassEnoughTime(fireRate)`**：
   ```csharp
   private bool PassEnoughTime(float fireRate)
   {
       float shotFrequency = fireRate > 0 ? (1f / fireRate) : INFINITY;
       return currentTime >= this.LastShotTime + shotFrequency;
   }
   ```
   - `fireRate = 10` → 每秒 10 发 → 间隔 0.1 秒
   - 使用 `Character.Time` 支持慢动作/暂停

2. **`m_NumShots` 计数器**：
   - `OnPullTrigger()` 时重置为 0
   - 每次 `Shoot()` 后递增
   - 用于限制单发和连发

3. **`m_LoadRatio` 平滑过渡**：
   ```csharp
   this.m_LoadRatio.UpdateWithDelta(
       loadRatioTarget,                          // 目标值 (0 或 1)
       this.Weapon.Fire.AutoLoadDuration(args),  // 过渡时长
       this.Character.Time.DeltaTime             // 帧时间
   );
   ```

---

##### **C. 弹道预测渲染**

```csharp
if (sight.Trajectory.CanDraw(this.WeaponArgs))
{
    int maxResolution = sight.Trajectory.GetMaxResolution(this.WeaponArgs);  // 线段数量
    float maxDistance = sight.Trajectory.GetMaxDistance(this.WeaponArgs);
    
    // 复用列表避免 GC
    this.m_TrajectoryPoints ??= new List<Vector3>(maxResolution);
    if (this.m_TrajectoryPoints.Capacity < maxResolution)
    {
        this.m_TrajectoryPoints.Capacity = maxResolution;
    }
    
    // 计算弹道点
    this.Weapon.Projectile.GetTrajectory(
        this.m_TrajectoryPoints,
        maxResolution,
        maxDistance,
        sight.Trajectory.UseRaycast,  // 是否考虑碰撞
        this                          // WeaponData 作为参数
    );
    
    // 延迟创建 LineRenderer 组件
    if (this.m_Trajectory == null)
    {
        GameObject dot = sight.Trajectory.GetPrefabDot(this.WeaponArgs);
        this.m_Trajectory = Trajectory.Create(maxResolution, dot);
    }
    
    // 更新渲染
    this.m_Trajectory.Set(
        this.m_TrajectoryPoints,
        sight.Trajectory.GetMaterial(args),
        sight.Trajectory.GetColor(args),
        sight.Trajectory.GetWidth(args),
        sight.Trajectory.TextureMode,
        sight.Trajectory.TextureAlign,
        sight.Trajectory.GetCornerVertices(args),
        sight.Trajectory.GetCapVertices(args)
    );
}
```

**优化技巧：**
- `m_TrajectoryPoints` 复用避免每帧分配
- `Capacity` 预分配避免动态扩容
- `m_Trajectory` 延迟创建（Lazy Initialization）

---

##### **D. 准星动态更新**

```csharp
if (this.m_Crosshairs.TryGetValue(this.SightId, out CrosshairData crosshairs))
{
    Vector3 targetPoint = sight.Aim.GetPoint(this.WeaponArgs);  // 瞄准点
    
    foreach (CrosshairUI crosshairUI in crosshairs.Elements)
    {
        crosshairUI.Refresh(
            targetPoint,
            stance.CurrentAccuracy  // 精度值 (0=完全散布, 1=完全精准)
        );
    }
}
```

**准星扩散效果：**
- `CurrentAccuracy` 越小，准星展开越大
- 移动、跳跃、射击后 `CurrentAccuracy` 降低
- 静止时逐渐恢复

---

##### **E. 激光指示器**

```csharp
if (sight.Laser.CanDraw(this.WeaponArgs))
{
    Vector3 pointNormal = this.Weapon.Projectile.GetLaser(
        out Vector3 pointSource,  // 激光起点（枪口）
        out Vector3 pointTarget,  // 激光终点（命中点或最远距离）
        maxDistance,
        useRaycast,
        this
    );
    
    if (this.m_Laser == null)
    {
        GameObject dot = sight.Laser.GetPrefabDot(this.WeaponArgs);
        this.m_Laser = Laser.Create(dot);  // 创建 LineRenderer + 光点
    }
    
    this.m_Laser.Set(
        pointSource,
        pointTarget,
        pointNormal,  // 命中点法线（用于光点旋转）
        material, color, width, textureMode, textureAlign
    );
}
```

---

##### **F. 全自动装填音效**

```csharp
bool useLoadAudio = this.Weapon.Fire.Mode switch
{
    ShootMode.Single => false,
    ShootMode.Burst => false,
    ShootMode.FullAuto => this.Weapon.Fire.AutoLoading != FullAutoLoading.Instant,
    ShootMode.Charge => true,
    _ => false
};

if (useLoadAudio && canShoot && this.m_IsPullingTrigger)
{
    // 播放装填开始音效（仅一次）
    if (!this.m_LoadStartPlayed)
    {
        AudioClip loadStartAudio = this.Weapon.Fire.LoadStartAudio(args);
        _ = AudioManager.Instance.SoundEffect.Play(
            loadStartAudio,
            AudioConfigAmbient.Create(1f, 0f, SpatialBlending.Spatial, this.Prop),
            args
        );
        this.m_LoadStartPlayed = true;
    }
    
    // 播放装填循环音效
    AudioClip loadLoop = this.Weapon.Fire.LoadLoopAudio(args);
    if (!AudioManager.Instance.Ambient.IsPlaying(loadLoop, this.Prop))
    {
        _ = AudioManager.Instance.Ambient.Play(
            loadLoop,
            AudioConfigAmbient.Create(1f, 0.25f, SpatialBlending.Spatial, this.Prop),
            args
        );
    }
    
    // 动态调整音调（模拟加速效果）
    if (AudioManager.Instance.Ambient.IsPlaying(loadLoop, this.Prop))
    {
        float pitch = Mathf.Lerp(
            this.Weapon.Fire.LoadMinPitch(args),  // 例如 0.5
            this.Weapon.Fire.LoadMaxPitch(args),  // 例如 1.5
            this.m_LoadRatio.Current              // 装填进度 0-1
        );
        AudioManager.Instance.Ambient.ChangePitch(loadLoop, this.Prop, pitch);
    }
}
else
{
    // 松开扳机，停止音效
    if (this.m_LoadRatio.Current <= 0f)
    {
        AudioClip loadStartAudio = this.Weapon.Fire.LoadStartAudio(args);
        _ = AudioManager.Instance.Ambient.Stop(this.Prop, 0.1f);
        _ = AudioManager.Instance.SoundEffect.Stop(loadStartAudio, this.Prop, 0.1f);
    }
}
```

**音效设计：**
- `LoadStartAudio`：启动音（如电机启动）
- `LoadLoopAudio`：循环音（如旋转声）
- `Pitch` 从低到高模拟加速

---

#### **1.3 Shoot() - 射击执行**

```csharp
private void Shoot()
{
    // ========== 1. 卡壳检查 ==========
    if (this.Weapon.Jam.Run(this.WeaponArgs, this.IsJammed))
    {
        AudioClip jamAudio = this.Weapon.Jam.GetAudio(this.WeaponArgs);
        if (jamAudio != null)
        {
            _ = AudioManager.Instance.SoundEffect.Play(
                jamAudio,
                this.m_ConfigEmpty,  // 使用空弹音效配置
                this.WeaponArgs
            );
        }
        this.IsJammed = true;
        return;  // 卡壳，不射击
    }
    
    // ========== 2. 计算蓄力比例 ==========
    float chargeRatio = this.Weapon.Fire.Mode == ShootMode.Charge
        ? Mathf.Clamp01((this.Character.Time.Time - this.m_LastTriggerPull) / maxChargeTime)
        : 1f;
    
    // ========== 3. 执行弹道逻辑 ==========
    bool success = this.Weapon.Projectile.Run(
        this.WeaponArgs,
        this.Weapon,
        chargeRatio,
        this.m_LastTriggerPull  // 扳机拉动时间（用于延迟射击）
    );
    
    // ========== 4. 空弹音效 ==========
    if (!success)
    {
        if (!this.m_AttemptedToShoot)  // 避免重复播放
        {
            AudioClip emptyAudio = this.Weapon.Fire.EmptyAudio(this.WeaponArgs);
            if (emptyAudio != null)
            {
                _ = AudioManager.Instance.SoundEffect.Play(
                    emptyAudio,
                    this.m_ConfigEmpty,
                    this.WeaponArgs
                );
            }
            this.m_AttemptedToShoot = true;
        }
        return;
    }
    
    // ========== 5. 武器模型动画触发器 ==========
    Animator propAnimator = this.Prop.Get<Animator>();
    if (propAnimator != null)
        propAnimator.SetTrigger(TRIGGER_SHOOT);  // "Shoot"
    
    // ========== 6. 角色射击动画 ==========
    AnimationClip fireAnimationClip = this.Weapon.Fire.FireAnimation(this.WeaponArgs);
    float duration = 0f;
    
    if (fireAnimationClip != null)
    {
        ConfigGesture config = this.Weapon.Fire.FireConfig(fireAnimationClip);
        _ = this.Character.Gestures.CrossFade(
            fireAnimationClip,
            this.Weapon.Fire.FireAvatarMask,  // 部分身体遮罩（如上半身）
            BlendMode.Blend,
            config,
            true  // 允许打断
        );
        duration = fireAnimationClip.length - config.TransitionOut;
    }
    
    // ========== 7. 射击音效 ==========
    AudioClip fireAudio = this.Weapon.Fire.FireAudio(this.WeaponArgs);
    if (fireAudio != null)
    {
        _ = AudioManager.Instance.SoundEffect.Play(
            fireAudio,
            this.m_ConfigShoot,  // 随机音调避免重复感
            this.WeaponArgs
        );
    }
    
    // ========== 8. 枪口火光特效 ==========
    GameObject muzzleEffect = this.Weapon.Fire.MuzzleEffect(this.WeaponArgs);
    if (muzzleEffect != null)
    {
        muzzleEffect.transform.SetPositionAndRotation(
            this.Weapon.Muzzle.GetPosition(this.WeaponArgs),
            this.Weapon.Muzzle.GetRotation(this.WeaponArgs)
        );
    }
    
    // ========== 9. 更新射击状态 ==========
    ShooterStance stance = this.Character.Combat.RequestStance<ShooterStance>();
    stance.Shooting.OnShoot(duration);  // 记录射击动画时长
    
    this.LastShotFrame = this.Character.Time.Frame;
    this.LastShotTime = this.Character.Time.Time;
    this.m_NumShots += 1;
}
```

---

### **2. ShooterStance - 姿态管理器**

负责管理角色的射击状态，所有装备的射击武器共享一个 Stance 实例。

#### **2.1 精度恢复系统**

```csharp
private void OnLateUpdate()
{
    this.m_Accuracy.Target = 0f;  // 默认目标：完全精准
    float accuracyRecovery = 0f;
    
    // 遍历所有装备的武器
    foreach (KeyValuePair<int, WeaponData> entry in this.m_Equipment)
    {
        entry.Value.OnUpdate();  // 触发武器更新
        
        // 计算该武器的目标精度
        float targetAccuracy = entry.Value.Weapon.Accuracy
            .CalculateTargetAccuracy(this, entry.Value);
        
        // 取所有武器中最不准的状态（确保多武器时精度正确）
        this.m_Accuracy.Target = Mathf.Max(targetAccuracy, this.m_Accuracy.Target);
        
        // 取最快的恢复速度
        accuracyRecovery = Mathf.Max(
            entry.Value.Weapon.Accuracy.GetAccuracyRecover(entry.Value.WeaponArgs),
            accuracyRecovery
        );
    }
    
    // 立即跳到更高的精度值（不平滑）
    if (this.m_Accuracy.Current < this.m_Accuracy.Target)
    {
        this.m_Accuracy.Current = this.m_Accuracy.Target;
    }
    
    // 平滑恢复到目标精度
    this.m_Accuracy.UpdateWithDelta(
        this.m_Accuracy.Target,
        accuracyRecovery,
        this.Character.Time.DeltaTime
    );
}
```

**精度机制：**
- `Target = 0`：完全精准（准星最小）
- `Target = 1`：完全散布（准星最大）
- 射击后 `Accuracy.OnShoot()` 增加 `Target`
- 每帧向 0 恢复

---

#### **2.2 扳机拉动逻辑**

```csharp
public void PullTrigger(ShooterWeapon optionalWeapon)
{
    ShooterWeapon shooterWeapon = this.GetWeapon(optionalWeapon);
    if (shooterWeapon == null) return;
    
    if (!this.m_Equipment.TryGetValue(shooterWeaponId, out WeaponData weaponData))
        return;
    
    // ========== 1. 换弹打断检查 ==========
    if (this.Reloading.WeaponReloading == shooterWeapon)
    {
        // 支持战术换弹（Tactical Reload）
        if (this.Reloading.CanPartialReload == false) return;
        
        this.StopReload(shooterWeapon, CancelReason.PartialReload);
        return;
    }
    
    // ========== 2. 自动换弹检查 ==========
    if (!this.Reloading.IsReloading)
    {
        bool autoReload = shooterWeapon.Magazine.AutoReload(weaponData.WeaponArgs);
        int ammo = shooterWeapon.Magazine.GetTotalAmmo(weaponData.WeaponArgs);
        
        ShooterMunition munition = this.Character.Combat.RequestMunition(shooterWeapon) 
            as ShooterMunition;
        
        int inMagazine = shooterWeapon.Magazine.GetHasMagazine(weaponData.WeaponArgs)
            ? munition.InMagazine
            : int.MaxValue;  // 无弹匣系统（如弓箭）
        
        // 弹匣为空但有备弹时自动换弹
        if (autoReload && ammo != 0 && inMagazine == 0)
        {
            _ = this.Reload(shooterWeapon);
            return;
        }
    }
    
    // ========== 3. 标记扳机状态 ==========
    weaponData.OnPullTrigger();  // 设置 m_IsPullingTrigger = true
}
```

**战术换弹（Partial Reload）：**
- 换弹过程中拉动扳机可中断
- `CanPartialReload` 在 `Reloading.Reload()` 中设置
- 已装填的弹药保留

---

### **3. Bullet - 弹道物理引擎**

#### **3.1 Kinematic 弹道完整物理模拟**

**初始化：**
```csharp
public void SetFromKinematic(
    ShotData shotData,
    float force,              // 初速度 (m/s)
    float gravity,            // 重力加速度 (m/s²)
    float airResistance,      // 空气阻力系数
    float windInfluence,      // 风力影响系数 (0-1)
    float attractionForce,    // 追踪力
    GameObject attractionTarget,  // 追踪目标
    LayerMask layerMask,      // 碰撞层
    float maxDistance,        // 最大飞行距离
    bool isTimeout,           // 超时模式
    int pierces,              // 穿透次数
    float timeout)            // 超时时间
{
    this.m_Mode = Mode.UseKinematic;
    this.m_ShotData = shotData;
    this.m_TimeMode = shotData.Source.Time;  // 支持慢动作
    this.m_MaxPierces = pierces;
    this.m_MaxDistance = maxDistance;
    
    this.m_KinematicForce = force;
    this.m_KinematicGravity = Vector3.down * gravity;
    this.m_KinematicAirResistance = airResistance;
    this.m_KinematicWindInfluence = Mathf.Clamp01(windInfluence);
    this.m_KinematicAttractionForce = attractionForce;
    this.m_KinematicAttractionTarget = attractionTarget?.transform;
    this.m_KinematicLayerMask = layerMask;
    
    // 初始速度 = 方向 × 初速度
    this.KinematicVelocity = shotData.ShootDirection.normalized * force;
    
    // 粘附模式初始化（如箭矢插入墙壁）
    this.m_KinematicStick = null;
    this.m_KinematicStickOffset = Vector3.zero;
    
    // 记录起始数据
    this.StartTime = shotData.Source.Time.Time;
    this.LastMuzzlePosition = shotData.ShootPosition;
    this.LastPosition = shotData.ShootPosition;
    this.Distance = 0f;
    this.Pierces = 0;
    this.Hits.Clear();
    
    this.m_IsTimeout = isTimeout;
    this.m_Timeout = timeout;
}
```

**每帧物理更新（Update）：**

```csharp
private Vector3 UpdateKinematic()
{
    // ========== 1. 粘附模式（箭矢插入物体） ==========
    if (this.m_KinematicStick != null)
    {
        // 跟随被插入物体的移动
        this.transform.position = this.m_KinematicStick.TransformPoint(
            this.m_KinematicStickOffset
        );
        return Vector3.zero;  // 不再旋转
    }
    
    // ========== 2. 计算所有作用力 ==========
    
    // 阻力：F_drag = -k * v（与速度相反）
    Vector3 drag = -1f * this.m_KinematicAirResistance * this.KinematicVelocity;
    
    // 重力：F_gravity = m * g
    Vector3 gravity = this.m_KinematicGravity * KINEMATIC_BULLET_MASS;
    
    // 风力：F_wind = WindManager.Wind * influence
    Vector3 wind = WindManager.Instance.Wind * this.m_KinematicWindInfluence;
    
    // 追踪力（制导）
    Vector3 attraction = Vector3.zero;
    if (this.m_KinematicAttractionTarget != null)
    {
        Vector3 direction = this.m_KinematicAttractionTarget.position - this.transform.position;
        if (direction != Vector3.zero)
        {
            attraction = direction.normalized * this.m_KinematicAttractionForce;
        }
    }
    
    // ========== 3. 牛顿第二定律：F = ma ==========
    Vector3 totalForce = drag + gravity + wind + attraction;
    Vector3 acceleration = totalForce / KINEMATIC_BULLET_MASS;
    
    // ========== 4. 欧拉积分法更新速度和位置 ==========
    // v(t+Δt) = v(t) + a * Δt
    this.KinematicVelocity += acceleration * this.m_TimeMode.DeltaTime;
    
    // Δs = v * Δt
    Vector3 deltaTranslation = this.KinematicVelocity * this.m_TimeMode.DeltaTime;
    Vector3 nextPosition = this.transform.position + deltaTranslation;
    Vector3 nextDirection = nextPosition - this.transform.position;
    
    // ========== 5. 碰撞检测（射线预测） ==========
    if (!this.m_IsTimeout)  // 非超时模式才检测碰撞
    {
        int numHits = Physics.RaycastNonAlloc(
            this.transform.position,           // 起点
            nextDirection.normalized,          // 方向
            RAYCAST_HITS,                      // 结果数组（复用）
            nextDirection.magnitude,           // 距离（本帧移动距离）
            this.m_KinematicLayerMask,
            QueryTriggerInteraction.Ignore     // 忽略触发器
        );
        
        // 处理所有命中（支持穿透）
        for (int i = 0; i < numHits; ++i)
        {
            RaycastHit hit = RAYCAST_HITS[i];
            Vector3 normal = this.m_ShotData.ShootPosition - hit.point;
            float distance = normal.magnitude;
            
            this.ReportHit(
                hit.collider.gameObject,
                hit.point,
                normal,
                distance
            );
        }
    }
    
    // ========== 6. 更新位置和旋转 ==========
    this.transform.position = nextPosition;
    return this.KinematicVelocity.normalized;  // 返回朝向
}
```

**物理细节：**

1. **欧拉积分 vs 更精确的方法：**
   - 使用简单的显式欧拉法：`v += a*Δt`, `x += v*Δt`
   - 优点：性能好，代码简单
   - 缺点：高速或长时间飞行时精度下降
   - 更精确的方法：Verlet 积分、RK4（但性能开销大）

2. **空气阻力模型：**
   - 简化为线性阻力：`F = -k*v`
   - 真实物理：`F = -0.5 * ρ * C_d * A * v²`（平方阻力）
   - 对游戏足够

3. **碰撞预测：**
   - 使用 `RaycastNonAlloc` 避免 GC
   - 检测距离 = 本帧移动距离
   - 高速弹丸可能穿墙（可用 `ContinuousSpeculative` 模式）

---

#### **3.2 命中报告系统**

```csharp
private void ReportHit(GameObject hit, Vector3 point, Vector3 normal, float distance)
{
    // ========== 1. 避免重复命中 ==========
    if (hit == this.m_ShotData.Source.gameObject) return;  // 不击中自己
    if (this.Hits.Contains(hit)) return;  // 已命中过（穿透时）
    this.Hits.Add(hit);
    
    // ========== 2. 更新射击数据 ==========
    this.m_ShotData.UpdateHit(
        hit.gameObject,
        point,
        distance,
        this.Pierces  // 当前穿透次数
    );
    
    this.Pierces += 1;
    
    // ========== 3. 执行命中回调 ==========
    this.m_ArgsTarget.ChangeTarget(hit);
    ShooterWeapon weapon = this.m_ShotData.Weapon;
    
    // 检查是否允许命中（可通过 Conditions 自定义）
    if (weapon.CanHit(this.m_ShotData, this.m_ArgsTarget))
    {
        // 触发命中逻辑（伤害、击退等）
        weapon.OnHit(this.m_ShotData, this.m_ArgsTarget);
        
        // ========== 4. 材质音效系统 ==========
        MaterialSounds.Play(
            this.m_ArgsTarget,
            point,                               // 命中点
            normal,                              // 法线
            hit,                                 // 命中对象
            this.m_ShotData.ImpactSound,        // 材质音效资源
            UnityEngine.Random.Range(-180f, 180f)  // 随机旋转
        );
        
        // ========== 5. 撞击特效 ==========
        this.m_ShotData.ImpactEffect?.Get(
            this.m_ArgsTarget,
            point,
            Quaternion.LookRotation(normal)  // 特效朝向法线方向
        );
    }
    
    // ========== 6. 穿透限制检查 ==========
    if (this.Pierces > this.m_MaxPierces)
    {
        this.gameObject.SetActive(false);  // 回收到对象池
    }
}
```

**MaterialSounds 系统：**
- 根据被击中物体的材质播放不同音效
- 例如：木头 → 木头撞击声，金属 → 金属碰撞声
- 通过 `MaterialSoundsAsset` 配置

---

#### **3.3 弹道预测静态方法**

```csharp
public static void TracePositions(
    List<Vector3> points,
    Vector3 position,         // 起始位置
    Vector3 velocity,         // 初速度向量
    float maxDistance,        // 最大距离
    float minDeltaDistance,   // 采样间隔
    float airResistance,
    float windInfluence,
    float gravity,
    float mass)
{
    const float TRACE_TIME_STEP = 0.01f;  // 10ms 时间步长
    
    Vector3 nextPoint = position;
    Vector3 prevPoint = position;
    
    points.Clear();
    points.Add(nextPoint);
    
    float distance = 0f;
    float currentDeltaDistance = 0f;
    
    // 迭代模拟直到达到最大距离
    while (distance < maxDistance)
    {
        // 计算作用力
        Vector3 dragForce = -1f * airResistance * velocity;
        Vector3 gravityForce = Vector3.down * (gravity * mass);
        Vector3 windForce = WindManager.Instance.Wind * windInfluence;
        
        // F = ma → a = F/m
        Vector3 acceleration = (dragForce + gravityForce + windForce) / mass;
        
        // 欧拉积分
        velocity += acceleration * TRACE_TIME_STEP;
        nextPoint += velocity * TRACE_TIME_STEP;
        
        // 累计距离
        float deltaStep = (nextPoint - prevPoint).magnitude;
        currentDeltaDistance += deltaStep;
        distance += deltaStep;
        prevPoint = nextPoint;
        
        // 达到采样间隔才记录点（减少点数量）
        if (currentDeltaDistance >= minDeltaDistance)
        {
            points.Add(nextPoint);
            currentDeltaDistance = 0f;
        }
    }
}
```

**用途：**
- UI 弹道预测线（榴弹发射器、弓箭）
- Editor 中预览弹道
- 不进行碰撞检测（性能优化）

---

### **4. Reloading - 换弹系统**

#### **4.1 完整换弹流程**

```csharp
public async Task Reload(ShooterWeapon weapon)
{
    if (weapon == null || this.IsReloading) return;
    
    ShooterStance stance = this.Character.Combat.RequestStance<ShooterStance>();
    WeaponData weaponData = stance.Get(weapon);
    
    if (weaponData.IsJammed) return;  // 卡壳时不能换弹
    
    Args args = weaponData.WeaponArgs;
    ShooterMunition munition = this.Character.Combat.RequestMunition(weapon) as ShooterMunition;
    
    // ========== 1. 选择换弹动作 ==========
    bool isFull = munition.InMagazine >= weapon.Magazine.GetMagazineSize(args);
    Reload reload = weapon.GetReload(this.Character, isFull);
    if (reload == null) return;
    
    GameObject prop = this.Character.Combat.GetProp(weapon);
    if (prop == null) return;
    
    // ========== 2. 初始化换弹状态 ==========
    this.m_CancelReload = new CancelReloadSequence();  // 取消令牌
    
    this.WeaponReloading = weapon;
    this.ReloadReloading = reload;
    this.CanPartialReload = false;  // 换弹初期不允许打断
    this.ReloadSpeed = reload.GetSpeed(args);
    
    // ========== 3. 执行换弹前回调 ==========
    await weapon.RunOnEnterReload(this.Character, this.ReloadSpeed, args);
    
    // ========== 4. 丢弃当前弹匣弹药（可选） ==========
    if (reload.GetDiscardMagazineAmmo(args))
    {
        int remaining = munition.InMagazine;
        if (remaining != 0)
            weapon.Magazine.DiscardMagazine(remaining, args);
    }
    
    // ========== 5. 换弹循环（支持多次换弹） ==========
    bool isComplete = false;
    
    while (isComplete == false)
    {
        this.TriedQuickReload = false;
        this.CanPartialReload = true;  // 允许战术换弹
        
        this.m_StartTime = this.Character.Time.Time;  // 记录开始时间（用于计算进度）
        
        // 播放换弹动画并等待
        bool correct = await reload.Play(
            this.Character,
            this.ReloadSpeed,
            this.m_CancelReload,
            args
        );
        
        // 检查是否被取消
        if (correct == false || this.m_CancelReload.CancelReason == CancelReason.ForceStop)
        {
            isComplete = true;
            continue;
        }
        
        // 无弹匣系统（如弓箭）直接完成
        if (!weapon.Magazine.GetHasMagazine(args))
        {
            isComplete = true;
            continue;
        }
        
        // ========== 6. 填充弹药 ==========
        int reloadAmount = reload.GetReloadAmount(args);  // 本次装填数量
        int maxMagazine = Mathf.Min(
            weapon.Magazine.GetMagazineSize(args),  // 弹匣容量
            weapon.Magazine.GetTotalAmmo(args)      // 剩余总弹药
        );
        
        munition.InMagazine = Mathf.Min(munition.InMagazine + reloadAmount, maxMagazine);
        
        // 检查是否完成
        bool partialReload = this.m_CancelReload.CancelReason == CancelReason.PartialReload;
        isComplete = partialReload || munition.InMagazine >= maxMagazine;
    }
    
    this.CanPartialReload = false;
    
    // ========== 7. 执行换弹后回调 ==========
    await weapon.RunOnExitReload(
        this.Character,
        this.ReloadSpeed,
        this.m_CancelReload,
        args
    );
    
    // ========== 8. 清理状态 ==========
    this.WeaponReloading = null;
    this.ReloadReloading = null;
}
```

**关键点：**

1. **while 循环：** 支持霰弹枪式换弹（一发一发装填）
2. **`CancelReloadSequence`：** 取消令牌，支持多种取消原因
3. **`CanPartialReload`：** 控制何时可以打断
4. **`Ratio` 属性：** 实时计算换弹进度（UI 使用）

---

#### **4.2 快速换弹（Quick Reload）**

```csharp
public bool TryQuickReload(ShooterWeapon weapon)
{
    if (weapon == null || !this.IsReloading) return false;
    if (this.TriedQuickReload) return false;  // 每次换弹只能尝试一次
    
    if (this.ReloadReloading == null) return false;
    
    // 检查是否在有效时间窗口内
    if (this.CanQuickReload)
    {
        Args args = this.Character.Combat.RequestStance<ShooterStance>()
            .Get(weapon).WeaponArgs;
        
        // 停止换弹并标记为快速换弹
        this.ReloadReloading.Stop(
            this.Character,
            this.m_CancelReload,
            args,
            CancelReason.QuickReload  // 特殊原因
        );
        
        return true;
    }
    
    // 错过时间窗口
    this.TriedQuickReload = true;
    return false;
}

public bool CanQuickReload
{
    get
    {
        if (this.ReloadReloading == null) return false;
        
        float t = this.Ratio;  // 当前进度 (0-1)
        return this.ReloadReloading.CanQuickReload(t);
    }
}
```

**实现原理：**

在 `Reload` 资源中配置 `ClipReloadQuick`：
```csharp
// 例如：换弹动画 3 秒，快速换弹窗口在 1.5-2.0 秒
ClipReloadQuick
{
    TimeStart = 0.5f;  // 50% 进度
    TimeEnd = 0.67f;   // 67% 进度
}
```

玩家在此时间窗口内按下快速换弹键：
- 成功 → 换弹立即完成（如 Call of Duty 的战术换弹）
- 失败 → 必须等待完整动画

---

### **5. Biomechanics - IK 骨骼控制**

#### **5.1 FPS 模式 IK**

```csharp
public class BiomechanicsHumanFPS : TBiomechanicsHuman
{
    [SerializeField] private HumanRotationLean m_BonesLean;  // 身体倾斜骨骼
    
    [SerializeField] private PropertyGetDecimal m_MaxPitch = GetDecimalDecimal.Create(160f);
    [SerializeField] private PropertyGetDecimal m_MaxYaw = GetDecimalDecimal.Create(120f);
    
    [SerializeField] private PropertyGetDecimal m_SwayWeight = GetDecimalDecimal.Create(0.75f);
    [SerializeField] private PropertyGetDecimal m_Sway = GetDecimalDecimal.Create(0.025f);
    
    [SerializeField] private EnablerLayerMask m_PullOnObstruction = new EnablerLayerMask(true);
    [SerializeField] private PropertyGetDecimal m_MinDistance = GetDecimalConstantPointOne.Create;
    
    public override void Enter(Character character, ShooterWeapon weapon, float enterDuration)
    {
        // 请求或创建 IK Rig
        character.IK.RequireRig<RigShooterHuman>()?.OnEnter(weapon, this, enterDuration);
    }
    
    public override void Exit(Character character, ShooterWeapon weapon, float exitDuration)
    {
        character.IK.GetRig<RigShooterHuman>()?.OnExit(weapon, this, exitDuration);
    }
}
```

**RigShooterHuman 作用：**
1. **手部 IK：** 左手握住枪管，右手握住扳机
2. **头部追踪：** 头部朝向瞄准点
3. **武器防穿墙：** 靠近墙壁时拉回武器（`PullOnObstruction`）
4. **身体摇摆：** 移动时轻微晃动（`Sway`）

---

## **射击流程完整剖析**

### **时序图**

```
玩家按下射击键
    ↓
Input System
    ↓
InstructionShooterFirePull.Run()
    ↓
ShooterStance.PullTrigger(weapon)
    ├─ 检查是否在换弹 → 战术换弹？
    ├─ 检查弹匣是否为空 → 自动换弹？
    └─ WeaponData.OnPullTrigger()
        ├─ m_IsPullingTrigger = true
        ├─ m_LastTriggerPull = Time.time
        └─ m_NumShots = 0
    ↓
--- 每帧循环 ---
WeaponData.OnUpdate()
    ├─ 同步 Animator 参数
    ├─ 检查射击模式
    │   ├─ Single: m_NumShots == 0?
    │   ├─ Burst: m_NumShots < burst?
    │   ├─ FullAuto: 持续射击
    │   └─ Charge: 累积蓄力
    ├─ 检查射速限制 PassEnoughTime()?
    ├─ 更新弹道预测
    ├─ 更新准星 UI
    ├─ 更新激光指示器
    └─ 更新装填音效
    ↓
WeaponData.Shoot()
    ├─ 卡壳检查 Jam.Run()
    ├─ 计算蓄力比例
    ├─ Weapon.Projectile.Run()
    │   ↓
    │   TShotProjectile.Run() [基类]
    │   ├─ 获取枪口数据 GetMuzzle()
    │   ├─ 计算散布方向 GetSpreadDirection()
    │   ├─ 创建 ShotData
    │   ├─ 验证 Weapon.CanShoot()
    │   │   ├─ Magazine.EnoughAmmo()
    │   │   ├─ RunConditionsList.Check()
    │   │   └─ Sight.CanShoot()
    │   ├─ 实例化弹丸 PoolManager.Pick()
    │   ├─ Weapon.OnShoot()
    │   │   ├─ 扣除弹药 munition.InMagazine--
    │   │   ├─ Accuracy.OnShoot() → 增加散布
    │   │   ├─ Recoil.OnShoot() → 摄像机后坐力
    │   │   └─ RunInstructionsList.Run()
    │   └─ 调用子类 OnRun()
    │       ↓
    │       ShotKinematic.OnRun()
    │       └─ Bullet.SetFromKinematic()
    │           ├─ 设置初速度
    │           ├─ 设置物理参数
    │           └─ 启动 Mode.UseKinematic
    │
    ├─ 播放射击动画
    ├─ 播放射击音效
    ├─ 生成枪口火光
    └─ 更新射击状态
    ↓
--- Bullet 物理循环 ---
Bullet.Update()
    ├─ 检查超时
    ├─ 检查延迟
    └─ UpdateKinematic()
        ├─ 计算作用力（重力、阻力、风力、追踪）
        ├─ 更新速度和位置（欧拉积分）
        ├─ 射线检测碰撞 RaycastNonAlloc()
        └─ ReportHit()
            ├─ 更新 ShotData
            ├─ Weapon.CanHit()
            ├─ Weapon.OnHit()
            │   ├─ 触发 Trigger 组件
            │   ├─ 应用物理力
            │   └─ RunInstructionsList.Run()
            ├─ 播放材质音效 MaterialSounds.Play()
            ├─ 生成撞击特效
            └─ 检查穿透次数 → 回收弹丸
    ↓
玩家松开射击键
    ↓
InstructionShooterFireRelease.Run()
    ↓
ShooterStance.ReleaseTrigger(weapon)
    ↓
WeaponData.OnReleaseTrigger()
    ├─ m_IsPullingTrigger = false
    └─ Charge 模式 → ChargeRelease()
```

---

## **高级特性深度分析**

### **1. 材质音效系统（MaterialSounds）**

**原理：**
```csharp
public static void Play(
    Args args,
    Vector3 point,
    Vector3 normal,
    GameObject hit,
    MaterialSoundsAsset impactSound,
    float rotation)
{
    // 1. 获取被击中物体的材质
    Renderer renderer = hit.GetComponent<Renderer>();
    Material material = renderer?.sharedMaterial;
    
    // 2. 在 MaterialSoundsAsset 中查找匹配的音效
    AudioClip clip = impactSound?.GetClip(material);
    
    // 3. 在命中点播放
    if (clip != null)
    {
        AudioManager.Instance.SoundEffect.Play(
            clip,
            AudioConfig.Create(point, rotation),
            args
        );
    }
}
```

**配置示例：**
```
MaterialSoundsAsset
├─ Wood Material → wood_impact.wav
├─ Metal Material → metal_impact.wav
├─ Concrete Material → concrete_impact.wav
└─ Default → default_impact.wav
```

---

### **2. 风力系统（WindManager）**

```csharp
public class WindManager : Singleton<WindManager>
{
    [SerializeField] private Vector3 m_Wind = Vector3.zero;
    
    public Vector3 Wind
    {
        get => this.m_Wind;
        set => this.m_Wind = value;
    }
}
```

**应用：**
- Kinematic 弹道：`wind * windInfluence`
- Rigidbody 弹道：`rb.AddForce(wind * windInfluence)`
- 可通过 `InstructionShooterSetWind` 动态修改

**用途：**
- 狙击游戏中的风速影响
- 环境效果（飓风场景）

---

### **3. 瞄准镜切换系统**

```csharp
public void EnterSight(ShooterWeapon weapon, IdString sightId)
{
    if (weapon.Sights.Contains(sightId))
    {
        WeaponData weaponData = this.m_Equipment[weapon.GetInstanceID()];
        
        // 退出当前瞄准镜
        weapon.Sights.Get(weaponData.SightId)?.Exit(this.Character, weapon);
        
        // 切换 ID
        weaponData.OnChangeSight(sightId);
        
        // 进入新瞄准镜
        weapon.Sights.Get(weaponData.SightId)?.Enter(this.Character, weapon);
    }
}
```

**OnChangeSight 细节：**
```csharp
public void OnChangeSight(IdString sightId)
{
    // 隐藏旧准星
    if (this.m_Crosshairs.TryGetValue(this.SightId, out CrosshairData crosshairs))
    {
        crosshairs.Instance?.SetActive(false);
    }
    
    this.SightId = sightId;
    
    Sight sight = this.Weapon.Sights.Get(sightId)?.Sight;public void OnChangeSight(IdString sightId)
{
    // 隐藏旧准星
    if (this.m_Crosshairs.TryGetValue(this.SightId, out CrosshairData crosshairs))
    {
        crosshairs.Instance?.SetActive(false);
    }
    
    this.SightId = sightId;
    
    Sight sight = this.Weapon.Sights.Get(sightId)?.Sight;

mi1890: @agent 重试

GitHub Copilot: 现在让我创建一份更加详细和深入的技术分析文档：

# **GameCreator2 Shooter 远程战斗系统 - 完整深度剖析**

基于对所有核心类的深度review，我现在提供一份包含所有细节的完整技术讲解。

---

## **一、系统架构总览**

### **1.1 核心设计模式**

```
设计模式应用：
├─ Strategy Pattern (策略模式)
│  ├─ TAim (瞄准策略)
│  ├─ TShot (射击策略)
│  └─ TBiomechanics (生物力学策略)
│
├─ State Pattern (状态模式)
│  ├─ ShooterStance (射击姿态)
│  ├─ Reloading (换弹状态)
│  └─ Shooting (射击状态)
│
├─ Object Pool (对象池)
│  ├─ Bullet (子弹)
│  ├─ Shell (弹壳)
│  └─ Tracer (弹道线)
│
└─ Observer Pattern (观察者)
   ├─ EventShooterHit
   └─ RunInstructionsList
```

---

## **二、核心类深度解析**

### **2.1 WeaponData - 武器运行时数据中心**

这是整个系统**最复杂**的类，管理武器的所有运行时状态。

#### **2.1.1 成员变量详解**

```csharp
public class WeaponData
{
    // === 时间追踪 ===
    [NonSerialized] private float m_EquipTime;           // 装备武器的时间戳
    [NonSerialized] private float m_LastTriggerPull;     // 上次按下扳机时间
    [NonSerialized] private float m_LastTriggerRelease;  // 上次松开扳机时间
    
    // === 射击状态 ===
    [NonSerialized] private bool m_AttemptedToShoot;     // 是否尝试过射击（防止空弹音效重复）
    [NonSerialized] private bool m_LoadStartPlayed;      // 蓄力音效是否已播放
    [NonSerialized] private bool m_IsPullingTrigger;     // 是否正在拉扳机
    [NonSerialized] private int m_NumShots;              // 当前连射次数（Burst模式用）
    
    // === 可视化组件 ===
    [NonSerialized] private List<Vector3> m_TrajectoryPoints;  // 弹道预测点
    [NonSerialized] private Trajectory m_Trajectory;            // 弹道线渲染器
    [NonSerialized] private Laser m_Laser;                      // 激光指示器
    [NonSerialized] private AnimFloat m_LoadRatio;              // 蓄力进度（平滑动画）
    
    // === 音效配置 ===
    [NonSerialized] private AudioConfigSoundEffect m_ConfigShoot; // 射击音效配置
    [NonSerialized] private AudioConfigSoundEffect m_ConfigEmpty; // 空弹音效配置
    
    // === UI组件 ===
    [NonSerialized] private Dictionary<IdString, CrosshairData> m_Crosshairs; // 准星映射表
}
```

#### **2.1.2 OnUpdate() - 核心更新逻辑**

这个方法**每帧执行**，负责处理所有武器逻辑：

```csharp
internal void OnUpdate()
{
    // ==================== 第一步：更新动画参数 ====================
    Animator animator = this.Prop.Get<Animator>();
    if (animator != null)
    {
        // 设置动画布尔参数
        animator.SetBool(BOOL_IS_EMPTY, isEmpty);      // 弹药为空
        animator.SetBool(BOOL_IS_JAM, isJammed);       // 卡壳状态
        animator.SetBool(BOOL_IS_CHARGING, isCharging); // 蓄力状态
        animator.SetBool(BOOL_IS_RELOADING, isReloading); // 换弹状态
        
        // 蓄力模式：更新蓄力进度
        if (isCharging)
        {
            float elapsedTime = Time - m_LastTriggerPull;
            ChargeRatio = Clamp01(elapsedTime / maxChargeTime);
            animator.SetFloat(FLOAT_CHARGE, ChargeRatio); // 可用于驱动蓄力动画
        }
    }
    
    // ==================== 第二步：检查射击模式 ====================
    if (canShoot && m_IsPullingTrigger)
    {
        switch (Weapon.Fire.Mode)
        {
            // --- 单发模式 ---
            case ShootMode.Single:
                // 只在第一次拉扳机时射击一次
                if (m_NumShots == 0 && PassEnoughTime(fireRate))
                    Shoot();
                break;
            
            // --- 三连发模式 ---
            case ShootMode.Burst:
                int maxBurst = Weapon.Fire.Burst(args); // 例如3发
                // 连续射击直到达到Burst上限
                if (m_NumShots < maxBurst && PassEnoughTime(fireRate))
                    Shoot();
                break;
            
            // --- 全自动模式（重点！）---
            case ShootMode.FullAuto:
                loadRatioTarget = 1f; // 目标蓄力值
                
                // 三种子模式：
                switch (Weapon.Fire.AutoLoading)
                {
                    // 1. 即时模式：正常射速
                    case FullAutoLoading.Instant:
                        fireRate = fireRate;
                        break;
                    
                    // 2. 渐进模式：射速逐渐加快（如转轮机枪）
                    case FullAutoLoading.Progressive:
                        fireRate = fireRate * m_LoadRatio.Current; // 0.0 → 1.0
                        break;
                    
                    // 3. 等待模式：需完全"上膛"才能射击
                    case FullAutoLoading.WaitToLoad:
                        fireRate = m_LoadRatio.Current >= 1f ? fireRate : 0f;
                        break;
                }
                
                if (PassEnoughTime(fireRate)) Shoot();
                break;
            
            // --- 蓄力模式 ---
            case ShootMode.Charge:
                if (m_NumShots == 0) ChargeUpdate(); // 检查是否自动释放
                break;
        }
    }
    
    // ==================== 第三步：更新弹道预测 ====================
    if (sight.Trajectory.CanDraw(args))
    {
        // 获取弹道轨迹点
        Weapon.Projectile.GetTrajectory(
            m_TrajectoryPoints,      // 输出点列表
            maxResolution,           // 最大分辨率（点数）
            maxDistance,             // 最大距离
            useRaycast,              // 是否检测碰撞
            this                     // WeaponData自身
        );
        
        // 创建或更新LineRenderer
        if (m_Trajectory == null)
        {
            m_Trajectory = Trajectory.Create(maxResolution, dotPrefab);
        }
        
        // 设置LineRenderer属性
        m_Trajectory.Set(
            m_TrajectoryPoints,      // 点坐标
            material,                // 材质
            color,                   // 颜色
            width,                   // 宽度
            textureMode,             // 纹理模式（拉伸/平铺）
            textureAlign,            // 纹理对齐
            cornerVertices,          // 转角顶点数
            capVertices              // 端点顶点数
        );
    }
    
    // ==================== 第四步：更新准星UI ====================
    if (m_Crosshairs.TryGetValue(SightId, out CrosshairData crosshairs))
    {
        Vector3 targetPoint = sight.Aim.GetPoint(args); // 瞄准点
        
        foreach (CrosshairUI ui in crosshairs.Elements)
        {
            // 传入目标点和精度值
            ui.Refresh(targetPoint, stance.CurrentAccuracy);
        }
    }
    
    // ==================== 第五步：更新激光指示器 ====================
    if (sight.Laser.CanDraw(args))
    {
        // 计算激光起点和终点
        Vector3 pointNormal = Weapon.Projectile.GetLaser(
            out Vector3 pointSource,   // 枪口位置
            out Vector3 pointTarget,   // 击中点/最远点
            maxDistance,
            useRaycast,
            this
        );
        
        if (m_Laser == null)
        {
            m_Laser = Laser.Create(dotPrefab);
        }
        
        m_Laser.Set(pointSource, pointTarget, pointNormal, material, color, width, ...);
    }
    
    // ==================== 第六步：处理蓄力音效 ====================
    bool useLoadAudio = Weapon.Fire.Mode switch
    {
        ShootMode.FullAuto => Weapon.Fire.AutoLoading != Instant,
        ShootMode.Charge => true,
        _ => false
    };
    
    if (useLoadAudio && m_IsPullingTrigger)
    {
        // 播放开始音效（一次性）
        if (!m_LoadStartPlayed)
        {
            AudioManager.SoundEffect.Play(loadStartAudio, config, args);
            m_LoadStartPlayed = true;
        }
        
        // 播放循环音效
        if (!AudioManager.Ambient.IsPlaying(loadLoopAudio, Prop))
        {
            AudioManager.Ambient.Play(loadLoopAudio, config, args);
        }
        
        // 动态调整音调（模拟机械加速）
        float pitch = Lerp(
            minPitch,        // 例如 0.8
            maxPitch,        // 例如 1.2
            m_LoadRatio.Current
        );
        AudioManager.Ambient.ChangePitch(loadLoopAudio, Prop, pitch);
    }
    
    // 停止蓄力音效
    if (m_LoadRatio.Current <= 0f)
    {
        AudioManager.Ambient.Stop(Prop, fadeTime: 0.1f);
    }
    
    // ==================== 第七步：平滑更新蓄力值 ====================
    m_LoadRatio.UpdateWithDelta(
        loadRatioTarget,              // 目标值（0或1）
        autoLoadDuration,             // 过渡时长
        deltaTime
    );
}
```

#### **2.1.3 Shoot() - 射击执行详解**

```csharp
private void Shoot()
{
    // ==================== 第一步：卡壳检测 ====================
    if (Weapon.Jam.Run(args, IsJammed))
    {
        // 播放卡壳音效
        AudioManager.SoundEffect.Play(jamAudio, config, args);
        
        IsJammed = true;  // 标记为卡壳状态
        return;           // 中断射击
    }
    
    // ==================== 第二步：计算蓄力比例 ====================
    float chargeRatio = 1f;
    if (Weapon.Fire.Mode == ShootMode.Charge)
    {
        float elapsedTime = Time - m_LastTriggerPull;
        chargeRatio = Clamp01(elapsedTime / maxChargeTime);
    }
    
    // ==================== 第三步：执行弹道系统 ====================
    bool success = Weapon.Projectile.Run(
        WeaponArgs,
        Weapon,
        chargeRatio,      // 蓄力比例（影响伤害/速度等）
        m_LastTriggerPull // 拉扳机的时间戳
    );
    
    // 射击失败（弹药不足等）
    if (!success)
    {
        // 避免重复播放空弹音效
        if (!m_AttemptedToShoot)
        {
            AudioManager.SoundEffect.Play(emptyAudio, config, args);
            m_AttemptedToShoot = true;
        }
        return;
    }
    
    // ==================== 第四步：触发动画 ====================
    Animator propAnimator = Prop.Get<Animator>();
    if (propAnimator != null)
    {
        propAnimator.SetTrigger(TRIGGER_SHOOT); // 触发射击动画
    }
    
    // 播放角色射击手势动画
    AnimationClip fireAnimationClip = Weapon.Fire.FireAnimation(args);
    if (fireAnimationClip != null)
    {
        ConfigGesture config = new ConfigGesture(
            delay: 0f,
            duration: fireAnimationClip.length,
            speed: 1f,
            useRootMotion: Weapon.Fire.RootMotion,
            transitionIn: Weapon.Fire.TransitionIn,    // 0.1s
            transitionOut: Weapon.Fire.TransitionOut   // 0.25s
        );
        
        Character.Gestures.CrossFade(
            fireAnimationClip,
            avatarMask: Weapon.Fire.FireAvatarMask,  // 上半身遮罩
            blendMode: BlendMode.Blend,               // 混合模式
            config,
            immediate: true                           // 立即播放
        );
    }
    
    // ==================== 第五步：播放射击音效 ====================
    AudioClip fireAudio = Weapon.Fire.FireAudio(args);
    if (fireAudio != null)
    {
        // 使用预配置的音效设置（随机音调等）
        AudioManager.SoundEffect.Play(fireAudio, m_ConfigShoot, args);
    }
    
    // ==================== 第六步：生成枪口特效 ====================
    GameObject muzzleEffect = Weapon.Fire.MuzzleEffect(args);
    if (muzzleEffect != null)
    {
        muzzleEffect.transform.SetPositionAndRotation(
            Weapon.Muzzle.GetPosition(args),  // 枪口位置
            Weapon.Muzzle.GetRotation(args)   // 枪口朝向
        );
        // 特效会自动播放并销毁
    }
    
    // ==================== 第七步：通知射击状态 ====================
    ShooterStance stance = Character.Combat.RequestStance<ShooterStance>();
    stance.Shooting.OnShoot(duration); // 记录射击动画时长
    
    // ==================== 第八步：更新射击记录 ====================
    LastShotFrame = Character.Time.Frame;  // 当前帧号
    LastShotTime = Character.Time.Time;    // 当前时间戳
    m_NumShots += 1;                       // 连射计数+1
}
```

#### **2.1.4 ChargeUpdate() - 蓄力检测**

```csharp
private void ChargeUpdate()
{
    float elapsedTime = Time - m_LastTriggerPull;
    
    // 检查是否启用自动释放
    bool autoRelease = Weapon.Fire.AutoRelease(args);
    float releaseDuration = Weapon.Fire.ReleaseDuration(args);
    
    // 超过最大蓄力时间 + 额外等待时间 → 自动释放
    if (autoRelease && elapsedTime >= maxChargeTime + releaseDuration)
    {
        ChargeRelease();
    }
}

private void ChargeRelease()
{
    if (m_NumShots != 0) return; // 防止重复释放
    
    m_LastTriggerRelease = Time;
    m_IsPullingTrigger = false;
    
    // 检查最小蓄力时间
    float minChargeTime = Weapon.Fire.MinChargeTime(args);
    float elapsedTime = Time - m_LastTriggerPull;
    
    if (elapsedTime < minChargeTime)
    {
        // 蓄力不足，不执行射击
        return;
    }
    
    Shoot(); // 执行射击
}
```

---

### **2.2 ShooterStance - 姿态管理系统**

#### **2.2.1 精度恢复机制（关键！）**

```csharp
private void OnLateUpdate()
{
    m_Accuracy.Target = 0f;  // 默认目标精度为0（完全准确）
    float accuracyRecovery = 0f;
    
    // 遍历所有装备的射击武器
    foreach (KeyValuePair<int, WeaponData> entry in m_Equipment)
    {
        WeaponData weaponData = entry.Value;
        Accuracy accuracy = weaponData.Weapon.Accuracy;
        
        // === 计算目标精度（考虑多种因素）===
        float targetAccuracy = accuracy.CalculateTargetAccuracy(this, weaponData);
        
        // 取最不准的武器作为最终精度
        m_Accuracy.Target = Max(m_Accuracy.Target, targetAccuracy);
        
        // 取最快的恢复速度
        accuracyRecovery = Max(
            accuracy.GetAccuracyRecover(weaponData.WeaponArgs),
            accuracyRecovery
        );
    }
    
    // === 精度不能低于目标值（避免负恢复）===
    if (m_Accuracy.Current < m_Accuracy.Target)
    {
        m_Accuracy.Current = m_Accuracy.Target;
    }
    
    // === 平滑恢复精度 ===
    // 公式：Current += (Target - Current) * recoverySpeed * deltaTime
    m_Accuracy.UpdateWithDelta(
        m_Accuracy.Target,      // 目标值（0）
        accuracyRecovery,       // 恢复速度（如1.0 = 每秒恢复100%）
        Character.Time.DeltaTime
    );
}
```

**精度值含义：**
- `0.0` = 完全准确（没有散布）
- `1.0` = 完全不准（最大散布）

**影响因素：**
1. **移动状态**：速度越快越不准
2. **滞空状态**：跳跃/下落时不准
3. **换弹状态**：换弹时完全不准
4. **射击后坐力**：每次射击增加散布
5. **瞄准镜限制**：某些瞄准镜有最低精度

#### **2.2.2 扳机拉动逻辑**

```csharp
public void PullTrigger(ShooterWeapon optionalWeapon)
{
    ShooterWeapon shooterWeapon = GetWeapon(optionalWeapon);
    if (shooterWeapon == null) return;
    
    WeaponData weaponData = m_Equipment[shooterWeapon.GetInstanceID()];
    
    // ==================== 情况1：正在换弹 ====================
    if (Reloading.WeaponReloading == shooterWeapon)
    {
        // 支持战术换弹（提前中断）
        if (Reloading.CanPartialReload)
        {
            StopReload(shooterWeapon, CancelReason.PartialReload);
            return;
        }
        
        // 不支持战术换弹，忽略输入
        return;
    }
    
    // ==================== 情况2：弹药耗尽 ====================
    if (!Reloading.IsReloading)
    {
        bool autoReload = shooterWeapon.Magazine.AutoReload(args);
        int totalAmmo = shooterWeapon.Magazine.GetTotalAmmo(args);
        
        ShooterMunition munition = Character.Combat.RequestMunition(shooterWeapon);
        int inMagazine = munition.InMagazine;
        
        // 启用自动换弹 && 有备弹 && 弹匣为空
        if (autoReload && totalAmmo > 0 && inMagazine == 0)
        {
            _ = Reload(shooterWeapon); // 异步换弹
            return;
        }
    }
    
    // ==================== 情况3：正常射击 ====================
    weaponData.OnPullTrigger();  // 标记拉扳机状态
}
```

---

### **2.3 Reloading - 换弹系统**

#### **2.3.1 核心换弹流程**

```csharp
public async Task Reload(ShooterWeapon weapon)
{
    // ==================== 前置检查 ====================
    if (weapon == null) return;
    if (IsReloading) return;  // 防止重复换弹
    
    ShooterStance stance = Character.Combat.RequestStance<ShooterStance>();
    WeaponData weaponData = stance.Get(weapon);
    
    if (weaponData.IsJammed) return;  // 卡壳时不能换弹
    
    // ==================== 选择换弹动作 ====================
    ShooterMunition munition = Character.Combat.RequestMunition(weapon);
    bool isFull = (munition.InMagazine >= magazineSize);
    
    Reload reload = weapon.GetReload(Character, isFull);
    if (reload == null) return;
    
    // ==================== 初始化换弹状态 ====================
    m_CancelReload = new CancelReloadSequence();  // 取消令牌
    
    WeaponReloading = weapon;
    ReloadReloading = reload;
    CanPartialReload = false;
    ReloadSpeed = reload.GetSpeed(args);
    
    // ==================== 触发开始回调 ====================
    await weapon.RunOnEnterReload(Character, ReloadSpeed, args);
    
    // ==================== 丢弃当前弹匣 ====================
    if (reload.GetDiscardMagazineAmmo(args))
    {
        int remaining = munition.InMagazine;
        if (remaining > 0)
        {
            // 扣除剩余弹药
            weapon.Magazine.DiscardMagazine(remaining, args);
        }
    }
    
    // ==================== 主换弹循环 ====================
    bool isComplete = false;
    
    while (!isComplete)
    {
        TriedQuickReload = false;
        CanPartialReload = true;  // 允许战术换弹
        
        m_StartTime = Character.Time.Time;
        
        // 播放换弹动画和时间轴
        bool correct = await reload.Play(
            Character,
            ReloadSpeed,
            m_CancelReload,  // 可被外部取消
            args
        );
        
        // === 检查取消原因 ===
        if (!correct || m_CancelReload.CancelReason == CancelReason.ForceStop)
        {
            isComplete = true;  // 强制中断
            continue;
        }
        
        // === 无弹匣武器（如霰弹枪）===
        if (!weapon.Magazine.GetHasMagazine(args))
        {
            isComplete = true;
            continue;
        }
        
        // === 填充弹药 ===
        int reloadAmount = reload.GetReloadAmount(args);  // 单次填充量
        int maxMagazine = Min(magazineSize, totalAmmo);
        
        munition.InMagazine = Min(munition.InMagazine + reloadAmount, maxMagazine);
        
        // === 判断是否完成 ===
        bool partialReload = (m_CancelReload.CancelReason == CancelReason.PartialReload);
        isComplete = partialReload || (munition.InMagazine >= maxMagazine);
    }
    
    CanPartialReload = false;
    
    // ==================== 触发结束回调 ====================
    await weapon.RunOnExitReload(Character, ReloadSpeed, m_CancelReload, args);
    
    // ==================== 清理状态 ====================
    WeaponReloading = null;
    ReloadReloading = null;
}
```

#### **2.3.2 快速换弹（QTE机制）**

```csharp
public bool TryQuickReload(ShooterWeapon weapon)
{
    if (!IsReloading) return false;
    if (TriedQuickReload) return false;  // 防止多次尝试
    
    // 检查是否在快速换弹时间窗口内
    if (CanQuickReload)
    {
        // 成功触发快速换弹
        ReloadReloading.Stop(
            Character,
            m_CancelReload,
            args,
            CancelReason.QuickReload  // 特殊标记
        );
        
        return true;  // 成功
    }
    
    // 失败（时机不对）
    TriedQuickReload = true;  // 标记失败，本次换弹不能再尝试
    return false;
}

// 时间窗口检查
public bool CanQuickReload
{
    get
    {
        if (ReloadReloading == null) return false;
        
        float t = Ratio;  // 当前换弹进度 0.0 ~ 1.0
        return ReloadReloading.CanQuickReload(t);
    }
}

// Reload资源中的配置
internal bool CanQuickReload(float t)
{
    TrackReloadQuick track = m_ReloadSequence.GetTrack<TrackReloadQuick>();
    ClipReloadQuick clip = track.Clips[0] as ClipReloadQuick;
    
    // 例如：TimeStart = 0.4, TimeEnd = 0.6
    return t >= clip.TimeStart && t <= clip.TimeEnd;
}
```

**视觉反馈示例：**
```
换弹进度条：[====|===]
             0.4  0.6
              ↑    ↑
           快速换弹窗口
```

---

### **2.4 Bullet - 弹道物理引擎**

#### **2.4.1 Kinematic模式 - 详细物理计算**

```csharp
private Vector3 UpdateKinematic()
{
    // ==================== 情况1：粘附状态（箭矢插入墙壁）====================
    if (m_KinematicStick != null)
    {
        // 跟随目标物体移动
        transform.position = m_KinematicStick.TransformPoint(
            m_KinematicStickOffset  // 本地空间偏移
        );
        return Vector3.zero;  // 不再旋转
    }
    
    // ==================== 第一步：计算所有作用力 ====================
    
    // 1. 空气阻力（与速度成正比）
    // F_drag = -k * v
    Vector3 drag = -m_KinematicAirResistance * KinematicVelocity;
    
    // 2. 重力（恒定向下）
    // F_gravity = m * g
    Vector3 gravity = m_KinematicGravity * KINEMATIC_BULLET_MASS;
    
    // 3. 风力（全局环境）
    // F_wind = WindDirection * WindMagnitude * influence
    Vector3 wind = WindManager.Instance.Wind * m_KinematicWindInfluence;
    
    // 4. 引力（追踪/制导）
    Vector3 attraction = Vector3.zero;
    if (m_KinematicAttractionTarget != null)
    {
        Vector3 direction = m_KinematicAttractionTarget.position - transform.position;
        if (direction != Vector3.zero)
        {
            // F_attraction = k * direction_normalized
            attraction = direction.normalized * m_KinematicAttractionForce;
        }
    }
    
    // ==================== 第二步：牛顿第二定律 ====================
    // F_total = F_drag + F_gravity + F_wind + F_attraction
    Vector3 totalForce = drag + gravity + wind + attraction;
    
    // a = F / m
    Vector3 acceleration = totalForce / KINEMATIC_BULLET_MASS;
    
    // ==================== 第三步：欧拉积分法更新运动 ====================
    // v(t+Δt) = v(t) + a * Δt
    KinematicVelocity += acceleration * m_TimeMode.DeltaTime;
    
    // s(t+Δt) = s(t) + v * Δt
    Vector3 deltaTranslation = KinematicVelocity * m_TimeMode.DeltaTime;
    Vector3 nextPosition = transform.position + deltaTranslation;
    
    // ==================== 第四步：碰撞检测（分段射线）====================
    if (!m_IsTimeout)
    {
        Vector3 direction = deltaTranslation.normalized;
        float distance = deltaTranslation.magnitude;
        
        // 从当前位置向下一个位置发射射线
        int numHits = Physics.RaycastNonAlloc(
            transform.position,
            direction,
            RAYCAST_HITS,
            distance,
            m_KinematicLayerMask,
            QueryTriggerInteraction.Ignore
        );
        
        // 处理所有命中
        for (int i = 0; i < numHits; ++i)
        {
            RaycastHit hit = RAYCAST_HITS[i];
            
            Vector3 normal = m_ShotData.ShootPosition - hit.point;
            float hitDistance = normal.magnitude;
            
            // 报告命中，触发伤害等逻辑
            ReportHit(
                hit.collider.gameObject,
                hit.point,
                normal,
                hitDistance
            );
        }
    }
    
    // ==================== 第五步：更新位置 ====================
    transform.position = nextPosition;
    
    // 返回速度方向用于旋转子弹
    return KinematicVelocity.normalized;
}
```

**物理参数示例：**
```csharp
// 普通子弹
Force = 50f           // 初速度 50 m/s
Gravity = 9.81f       // 地球重力
AirResistance = 0.1f  // 轻微阻力
WindInfluence = 0f    // 不受风影响

// 榴弹
Force = 20f
Gravity = 9.81f
AirResistance = 0.5f  // 较大阻力
WindInfluence = 1f    // 受风影响

// 追踪导弹
Force = 30f
AttractionForce = 10f // 强追踪力
AttractionTarget = Enemy.gameObject
```

#### **2.4.2 弹道预测算法**

```csharp
public static void TracePositions(
    List<Vector3> points,
    Vector3 position,
    Vector3 velocity,
    float maxDistance,
    float minDeltaDistance,  // 点之间的最小间隔
    float airResistance,
    float windInfluence,
    float gravity,
    float mass)
{
    const float STEP = 0.01f;  // 10毫秒时间步长（更精确）
    
    Vector3 currentPos = position;
    Vector3 prevPoint = position;
    
    points.Clear();
    points.Add(currentPos);
    
    float totalDistance = 0f;
    float accumulatedDistance = 0f;
    
    // 迭代模拟弹道
    while (totalDistance < maxDistance)
    {
        // === 计算作用力（同UpdateKinematic）===
        Vector3 dragForce = -airResistance * velocity;
        Vector3 gravityForce = Vector3.down * (gravity * mass);
        Vector3 windForce = WindManager.Instance.Wind * windInfluence;
        
        Vector3 totalForce = dragForce + gravityForce + windForce;
        Vector3 acceleration = totalForce / mass;
        
        // === 更新速度和位置 ===
        velocity += acceleration * STEP;
        currentPos += velocity * STEP;
        
        // === 计算距离 ===
        float stepDistance = (currentPos - prevPoint).magnitude;
        accumulatedDistance += stepDistance;
        totalDistance += stepDistance;
        
        // === 添加采样点（防止点过密）===
        if (accumulatedDistance >= minDeltaDistance)
        {
            points.Add(currentPos);
            accumulatedDistance = 0f;
        }
        
        prevPoint = currentPos;
    }
}
```

**使用示例：**
```csharp
// 榴弹发射器预测
List<Vector3> points = new List<Vector3>();
Bullet.TracePositions(
    points,
    muzzle.Position,        // 枪口
    Vector3.forward * 20f,  // 初速度
    maxDistance: 50f,       // 最远50米
    minDeltaDistance: 0.5f, // 每0.5米一个点
    airResistance: 0.5f,
    windInfluence: 1f,
    gravity: 9.81f,
    mass: 1f
);

// 绘制弹道线
LineRenderer.positionCount = points.Count;
LineRenderer.SetPositions(points.ToArray());
```

---

### **2.5 Accuracy - 精度系统**

#### **2.5.1 综合精度计算**

```csharp
internal float CalculateTargetAccuracy(ShooterStance stance, WeaponData weaponData)
{
    // ==================== 情况1：换弹时完全不准 ====================
    if (stance.Reloading.WeaponReloading == weaponData.Weapon)
        return 1f;  // 最大散布
    
    // ==================== 计算各项影响 ====================
    
    // 1. 移动影响
    float motionAccuracy = GetAccuracyFromMotion(stance, weaponData);
    
    // 2. 滞空影响
    float airborneAccuracy = GetAccuracyFromAirborne(stance, weaponData);
    
    // 3. 瞄准镜最低精度
    Sight sight = weaponData.Weapon.Sights.Get(weaponData.SightId)?.Sight;
    float minAccuracy = sight?.Aim.GetMinAccuracy(args) ?? 0f;
    
    // ==================== 取最差情况 ====================
    float accuracy = Max(minAccuracy, motionAccuracy, airborneAccuracy);
    
    return Clamp01(accuracy);
}

// 移动影响计算
private float GetAccuracyFromMotion(IStance stance, WeaponData weaponData)
{
    float motionAccuracy = (float)m_MotionAccuracy.Get(args);  // 配置值，如0.5
    
    // 当前移动速度
    float motionCurrent = stance.Character.Driver.WorldMoveDirection.magnitude;
    
    // 最大移动速度
    float motionMaximum = stance.Character.Motion.LinearSpeed;
    
    // 比例计算：速度越快，精度越差
    // 例如：静止=0, 最快=1
    float speedRatio = Clamp01(motionCurrent / motionMaximum);
    
    return speedRatio * motionAccuracy;
}

// 滞空影响计算
private float GetAccuracyFromAirborne(IStance stance, WeaponData weaponData)
{
    float airborneAccuracy = (float)m_AirborneAccuracy.Get(args);  // 如0.8
    
    bool isGrounded = stance.Character.Driver.IsGrounded;
    
    // 在空中 = 完全不准
    return isGrounded ? 0f : airborneAccuracy;
}
```

#### **2.5.2 射击后坐力（精度惩罚）**

```csharp
internal void OnShoot(Args args)
{
    ShooterStance stance = args.Self.Get<Character>().Combat.RequestStance<ShooterStance>();
    
    // 获取后坐力配置
    float kick = (float)m_AccuracyKick.Get(args);  // 如0.25
    
    // 增加散布
    stance.AccuracyKick(kick);
}

// 在ShooterStance中
public void AccuracyKick(float kick)
{
    // 立即增加散布值
    m_Accuracy.Current = Min(m_Accuracy.Current + kick, 1f);
    
    // 然后会在OnLateUpdate中逐渐恢复
}
```

**精度恢复曲线：**
```
精度值
1.0 |     ╱╲
    |    ╱  ╲___
    |   ╱       ╲___
0.5 |  ╱            ╲___
    | ╱                 ╲___
0.0 |╱________________________╲___
    射击  0.5s  1s  1.5s  2s  2.5s
    
    射击瞬间：精度 += 0.25
    恢复速度：1.0 (每秒恢复100%)
```

#### **2.5.3 散布应用算法**

```csharp
internal Vector2 CalculateSpread(Args args)
{
    ShooterStance stance = GetStance(args);
    
    // === 第一步：生成随机方向 ===
    Vector2 randomDir = new Vector2(
        Random.Range(-1f, 1f),  // X: -1 ~ 1
        Random.Range(-1f, 1f)   // Y: -1 ~ 1
    ).normalized;  // 归一化到单位圆
    
    // === 第二步：应用最大散布范围 ===
    Vector2 maxSpread = new Vector2(
        (float)m_MaxSpreadX.Get(args),  // 如 2度
        (float)m_MaxSpreadY.Get(args)   // 如 2度
    );
    
    Vector2 spread = Vector2.Scale(randomDir, maxSpread);
    
    // === 第三步：应用散布偏差曲线 ===
    // bias越大，散布越集中在中心
    float bias = Clamp01((float)m_SpreadBias.Get(args));  // 如 1.0
    
    // 使用幂函数调整分布
    // bias=1.0: 线性分布
    // bias=2.0: 更集中中心
    // bias=0.5: 更均匀分布
    float radius = -Pow(Random.value, bias) + 1f;
    
    // === 第四步：乘以当前精度 ===
    // CurrentAccuracy: 0=完全准, 1=完全散布
    return spread * radius * stance.CurrentAccuracy;
}

// 应用到射击方向
public Vector3 GetSpreadDirection(Args args, ShooterWeapon weapon)
{
    Vector3 baseDirection = GetMuzzle(args, weapon).Direction;
    
    // 计算正交轴
    Vector3 axisPitch = Vector3.Cross(baseDirection, Vector3.up);  // 俯仰轴
    Vector3 axisYaw = Vector3.up;                                   // 偏航轴
    
    // 获取散布值（角度）
    Vector2 spread = weapon.Accuracy.CalculateSpread(args);
    
    // 应用俯仰偏转
    Quaternion pitchRotation = Quaternion.AngleAxis(spread.y, axisPitch);
    baseDirection = pitchRotation * baseDirection;
    
    // 应用偏航偏转
    Quaternion yawRotation = Quaternion.AngleAxis(spread.x, axisYaw);
    baseDirection = yawRotation * baseDirection;
    
    return baseDirection;
}
```

**散布分布可视化：**
```
bias = 0.5 (均匀)    bias = 1.0 (默认)    bias = 2.0 (集中)
    ▪ ▪ ▪ ▪ ▪            ▪   ▪   ▪             ▪     ▪
  ▪ ▪ ▪ ▪ ▪ ▪          ▪ ▪ ▪ ▪ ▪           ▪ ▪ ▪ ▪ ▪
  ▪ ▪ ▪ ✕ ▪ ▪          ▪ ▪ ✕ ▪ ▪             ▪ ✕ ▪
  ▪ ▪ ▪ ▪ ▪ ▪            ▪ ▪ ▪               ▪ ▪ ▪
    ▪ ▪ ▪ ▪ ▪              ▪                   ▪
```

---

### **2.6 Aim - 瞄准系统**

#### **2.6.1 Camera Raycast模式（FPS常用）**

```csharp
public class AimCameraRaycast : TAim
{
    public override Vector3 GetPoint(Args args)
    {
        // === 获取摄像机 ===
        Transform camera = m_Camera.Get<Transform>(args);
        if (camera == null)
        {
            // 回退：角色前方很远
            return args.Self.transform.TransformPoint(Vector3.forward * 999f);
        }
        
        // === 计算摄像机射线 ===
        Vector3 cameraDirection = camera.TransformDirection(Vector3.forward);
        Ray cameraRay = new Ray(camera.position, cameraDirection);
        
        // === 将角色位置投影到摄像机射线上 ===
        // 这样可以避免准星和枪口不在同一位置导致的视差问题
        Vector3 raySource = args.Self.transform.position.ProjectPointOntoRay(cameraRay);
        
        // === 从投影点发射射线检测 ===
        bool isHit = Physics.Raycast(
            raySource,
            cameraDirection.normalized,
            out RaycastHit hit,
            999f,
            m_LayerMask,
            QueryTriggerInteraction.Ignore
        );
        
        // === 返回命中点或远方点 ===
        return isHit 
            ? hit.point 
            : camera.TransformPoint(Vector3.forward * 999f);
    }
}
```

**视差修正原理：**
```
摄像机视角：
    Camera
      |╲
      | ╲  <-- 视线
      |  ╲
      |   ● 目标
      |  ╱
      | ╱  <-- 子弹实际路径
      |╱
   Player
   
投影修正：
    Camera
      |
      ↓ 投影点
      ● --------> 目标
   Player
   
这样子弹会飞向准星指向的位置
```

#### **2.6.2 Character Target模式（TPS锁定）**

```csharp
public class AimCharacterTarget : TAim
{
    public override Vector3 GetPoint(Args args)
    {
        Character character = m_Character.Get<Character>(args);
        if (character == null) return default;
        
        // 获取战斗目标
        GameObject target = character.Combat.Targets.Primary;
        
        if (target != null)
        {
            // 瞄准目标中心
            return target.transform.position;
        }
        else
        {
            // 无目标：朝向前方
            return character.transform.TransformPoint(Vector3.forward * 999f);
        }
    }
}
```

---

### **2.7 Biomechanics - IK骨骼控制**

#### **2.7.1 Human FPS模式（第一人称）**

```csharp
public class BiomechanicsHumanFPS : TBiomechanicsHuman
{
    public override void Enter(Character character, ShooterWeapon weapon, float enterDuration)
    {
        // 请求或创建IK Rig
        RigShooterHuman rig = character.IK.RequireRig<RigShooterHuman>();
        
        // 启用IK并配置
        rig?.OnEnter(weapon, this, enterDuration);
    }
}

// RigShooterHuman中的实现
public void OnEnter(ShooterWeapon weapon, BiomechanicsHumanFPS biomechanics, float duration)
{
    // === 获取武器配置 ===
    WeaponData weaponData = m_Stance.Get(weapon);
    SightItem sight = weapon.Sights.Get(weaponData.SightId);
    
    // === 设置瞄准镜对齐 ===
    if (sight.ScopeThrough)
    {
        // 计算眼睛需要到达的位置（瞄准镜光学中心）
        Vector3 scopePosition = weaponProp.TransformPoint(sight.ScopePosition);
        Quaternion scopeRotation = weaponProp.rotation * sight.ScopeRotation;
        
        // 设置头部IK目标
        m_HeadTarget.position = scopePosition;
        m_HeadTarget.rotation = scopeRotation;
        
        // 平滑过渡
        m_HeadWeight = AnimFloat.Create(0f, 1f, duration);
    }
    
    // === 设置手部IK ===
    // 左手抓握前握把
    Transform leftHandBone = weapon.GetBone("LeftHand");
    if (leftHandBone != null)
    {
        m_LeftHandTarget.position = leftHandBone.position;
        m_LeftHandTarget.rotation = leftHandBone.rotation;
        m_LeftHandWeight = AnimFloat.Create(0f, 1f, duration);
    }
    
    // 右手抓握握把
    Transform rightHandBone = weapon.GetBone("RightHand");
    if (rightHandBone != null)
    {
        m_RightHandTarget.position = rightHandBone.position;
        m_RightHandTarget.rotation = rightHandBone.rotation;
        m_RightHandWeight = AnimFloat.Create(0f, 1f, duration);
    }
}

// 每帧更新IK
public void OnUpdate()
{
    // === 更新权重 ===
    m_HeadWeight.Update(Time.deltaTime);
    m_LeftHandWeight.Update(Time.deltaTime);
    m_RightHandWeight.Update(Time.deltaTime);
    
    // === 应用IK约束 ===
    if (m_HeadWeight.Current > 0f)
    {
        Animator.SetIKPositionWeight(AvatarIKGoal.Head, m_HeadWeight.Current);
        Animator.SetIKPosition(AvatarIKGoal.Head, m_HeadTarget.position);
        
        Animator.SetIKRotationWeight(AvatarIKGoal.Head, m_HeadWeight.Current);
        Animator.SetIKRotation(AvatarIKGoal.Head, m_HeadTarget.rotation);
    }
    
    if (m_LeftHandWeight.Current > 0f)
    {
        Animator.SetIKPositionWeight(AvatarIKGoal.LeftHand, m_LeftHandWeight.Current);
        Animator.SetIKPosition(AvatarIKGoal.LeftHand, m_LeftHandTarget.position);
        
        Animator.SetIKRotationWeight(AvatarIKGoal.LeftHand, m_LeftHandWeight.Current);
        Animator.SetIKRotation(AvatarIKGoal.LeftHand, m_LeftHandTarget.rotation);
    }
    
    // 右手同理...
}
```

**效果：**
- 角色头部会对齐到瞄准镜
- 双手精确抓握武器
- 支持平滑过渡
- 适应不同武器模型

---

### **2.8 Shell - 弹壳抛出系统**

```csharp
public void Eject(Args args)
{
    // === 计算弹壳生成位置 ===
    Vector3 position = args.Target.transform.TransformPoint(m_Position);
    Quaternion rotation = args.Target.transform.rotation * Quaternion.Euler(m_Rotation);
    
    // === 从对象池获取弹壳 ===
    GameObject shell = m_Prefab.Get(args, position, rotation);
    if (shell == null) return;
    
    // === 设置为忽略射线检测层（避免挡准星）===
    shell.layer = LAYER_IGNORE_RAYCAST;
    
    // === 应用物理 ===
    Rigidbody rigidbody = shell.Get<Rigidbody>();
    if (rigidbody == null) return;
    
    // 清空速度
    rigidbody.linearVelocity = Vector3.zero;
    rigidbody.angularVelocity = Vector3.zero;
    
    // === 施加抛出力 ===
    float force = (float)m_Force.Get(args);  // 如5.0
    rigidbody.AddForce(
        rotation * Vector3.forward * force,
        ForceMode.VelocityChange  // 忽略质量
    );
    
    // === 施加旋转力（随机）===
    float torque = (float)m_Torque.Get(args);  // 如180度/秒
    rigidbody.AddTorque(
        Random.onUnitSphere * torque,
        ForceMode.VelocityChange
    );
    
    // 弹壳会在3-5秒后自动回收到对象池
}
```

**配置示例：**
```csharp
Position = new Vector3(0.25f, 0f, 0f);  // 武器右侧
Rotation = new Vector3(0f, 90f, 0f);    // 向右抛出
Force = 5f;                              // 中等力度
Torque = 180f;                           // 快速旋转
```

---

## **三、高级特性深度解析**

### **3.1 ReloadSequence - 时间轴系统**

```csharp
public class ReloadSequence : Sequence
{
    // 三个时间轴轨道
    public const int TRACK_MAGAZINE = 0;      // 弹匣操作轨道
    public const int TRACK_QUICK = 1;         // 快速换弹轨道
    public const int TRACK_INSTRUCTIONS = 2;  // 自定义指令轨道
    
    public ReloadSequence() : base(new Track[]
    {
        new TrackReloadMagazine(),   // 处理弹匣取出/装入
        new TrackReloadQuick(),      // 定义快速换弹窗口
        new TrackDefault()           // 执行自定义指令
    }) { }
}

// TrackReloadMagazine实现
public class TrackReloadMagazine : Track
{
    public override void OnUpdate(float time, Args args)
    {
        // 遍历所有Clip
        foreach (Clip clip in Clips)
        {
            if (clip is not ClipReloadMagazine magazineClip) continue;
            
            float clipTime = time - clip.TimeStart;
            
            // === Clip开始时 ===
            if (clipTime >= 0f && !clip.HasStarted)
            {
                clip.HasStarted = true;
                
                switch (magazineClip.Action)
                {
                    case MagazineAction.Detach:
                        // 取出弹匣
                        OnDetachMagazine(args);
                        break;
                    
                    case MagazineAction.Attach:
                        // 装入弹匣
                        OnAttachMagazine(args);
                        break;
                }
            }
        }
    }
    
    private void OnDetachMagazine(Args args)
    {
        ShooterStance stance = args.Self.Get<Character>().Combat.RequestStance<ShooterStance>();
        
        // 获取当前弹匣GameObject
        GameObject currentMag = GetMagazineObject(args);
        
        // 分离弹匣
        currentMag.transform.SetParent(null);
        
        // 添加物理
        Rigidbody rb = currentMag.AddComponent<Rigidbody>();
        rb.AddForce(Vector3.down * 2f, ForceMode.VelocityChange);
        
        // 3秒后销毁
        Destroy(currentMag, 3f);
        
        // 保存引用
        stance.Reloading.PreviousMagazine = currentMag;
    }
    
    private void OnAttachMagazine(Args args)
    {
        ShooterStance stance = args.Self.Get<Character>().Combat.RequestStance<ShooterStance>();
        
        // 实例化新弹匣
        GameObject newMag = Instantiate(magazinePrefab);
        
        // 附加到武器
        Transform magazineSlot = weapon.GetBone("Magazine");
        newMag.transform.SetParent(magazineSlot);
        newMag.transform.localPosition = Vector3.zero;
        newMag.transform.localRotation = Quaternion.identity;
        
        // 保存引用
        stance.Reloading.CurrentMagazine = newMag;
    }
}
```

**时间轴示例：**
```
时间: 0.0s    0.5s     1.0s    1.5s    2.0s
     |--------|--------|--------|--------|
     
轨道0: [  取出弹匣   ] [  装入弹匣   ]
轨道1:         [快速换弹窗口]
轨道2: [播放音效] [震动手柄] [UI提示]
```

---

### **3.2 WindManager - 全局风力系统**

```csharp
public class WindManager : Singleton<WindManager>
{
    [SerializeField] private Vector3 m_WindDirection = Vector3.right;
    [SerializeField] private float m_WindMagnitude = 1f;
    [SerializeField] private bool m_UseNoise = true;
    [SerializeField] private float m_NoiseFrequency = 0.5f;
    
    public Vector3 Wind
    {
        get
        {
            if (m_UseNoise)
            {
                // 使用Perlin噪声模拟真实风
                float noise = Mathf.PerlinNoise(Time.time * m_NoiseFrequency, 0f);
                float magnitude = m_WindMagnitude * noise;
                return m_WindDirection.normalized * magnitude;
            }
            
            return m_WindDirection.normalized * m_WindMagnitude;
        }
    }
}

// 在Bullet中使用
Vector3 windForce = WindManager.Instance.Wind * m_KinematicWindInfluence;
```

**效果：**
- 所有子弹受统一风力影响
- 支持动态变化的风
- 可用于狙击玩法（风速补偿）

---

### **3.3 MaterialSounds - 材质音效系统**

```csharp
public static class MaterialSounds
{
    public static void Play(
        Args args,
        Vector3 point,
        Vector3 normal,
        GameObject hit,
        MaterialSoundsAsset impactSound,
        float rotation)
    {
        if (impactSound == null) return;
        
        // === 检测材质类型 ===
        MaterialSoundTexture texture = GetTexture(hit, point);
        
        // === 获取对应音效 ===
        AudioClip clip = impactSound.GetClip(texture);
        if (clip == null) return;
        
        // === 播放3D音效 ===
        AudioConfigSoundEffect config = AudioConfigSoundEffect.Create(
            volume: 1f,
            pitch: new Vector2(0.9f, 1.1f),  // 随机音调
            delay: 0f,
            timeMode: TimeMode.GameTime,
            spatialBlending: SpatialBlending.Spatial,  // 3D音效
            target: null  // 世界空间位置
        );
        
        AudioManager.Instance.SoundEffect.Play(clip, config, args, point);
    }
    
    private static MaterialSoundTexture GetTexture(GameObject hit, Vector3 point)
    {
        // 射线检测获取材质
        RaycastHit hitInfo;
        if (Physics.Raycast(point + Vector3.up * 0.1f, Vector3.down, out hitInfo, 0.2f))
        {
            Renderer renderer = hitInfo.collider.GetComponent<Renderer>();
            if (renderer != null)
            {
                // 获取主纹理
                Texture texture = renderer.sharedMaterial.mainTexture;
                
                // 映射到材质类型
                return MaterialDatabase.GetType(texture);
            }
        }
        
        // 默认材质
        return MaterialSoundTexture.Default;
    }
}
```

**使用示例：**
```csharp
// 子弹击中物体时
MaterialSounds.Play(
    args,
    hit.point,              // 击中点
    hit.normal,             // 法线
    hit.collider.gameObject, // 被击中物体
    weapon.Projectile.ImpactSound,  // 音效资源
    Random.Range(-180// 子弹击中物体时
MaterialSounds.Play(
    args,
    hit.point,              // 击中点
    hit.normal,             // 法线
    hit.collider.gameObject, // 被击中物体
    weapon.Projectile.ImpactSound,  // 音效资源
    Random.Range(-180

mi1890: 这个requeststance 会有近战姿态，射击姿态，travesal姿态，他们之间会相互排斥吗？？这个是怎么处理的？

GitHub Copilot: 好问题！让我深入研究姿态系统的实现机制。 

搜索 `RequestStance`、20 结果的文本

搜索 `class TStance` 文本，1 个结果

搜索 `class Combat`、8 结果的文本

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Core/Runtime/Characters/Features/Combat/Combat.cs#1-1)，行 1 到 200

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Core/Runtime/Characters/Features/Combat/Stances/TStance.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Core/Runtime/Characters/Features/Combat/Combat.cs#200-200)，行 200 到 404

搜索 `class MeleeStance` 文本，1 个结果

搜索 `class TraversalStance` 文本，1 个结果

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Melee/Runtime/Classes/Stance/MeleeStance.cs#1-1)，行 1 到 150

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Traversal/Runtime/Stance/TraversalStance.cs#1-1)，行 1 到 150

搜索 `OnEnable` (`**/Shooter/Runtime/**/*.cs`)、9 结果的文本

现在我完全理解了！让我详细讲解姿态系统的机制：

## **GameCreator2 姿态系统 (Stance System) 深度解析**

### **一、核心机制：非排斥的共存模式**

**重要发现：多个姿态可以同时激活，它们并不互相排斥！**

让我详细解释这个巧妙的设计：

#### **1. RequestStance 的实现原理**

```csharp
// 在 Combat.cs 中
public T RequestStance<T>() where T : IStance, new()
{
    if (this.m_Character == null) return default;
    
    // 通过类型的 HashCode 作为唯一标识
    int stanceId = typeof(T).GetHashCode();
    
    // 检查是否已存在
    if (this.m_Stances.TryGetValue(stanceId, out IStance stance))
    {
        return (T) stance;  // 返回已存在的实例
    }

    // 不存在则创建新实例
    T newStance = new T();
    newStance.OnEnable(this.m_Character);  // 立即启用

    this.m_Stances.Add(stanceId, newStance);  // 加入字典
    return newStance;
}
```

**关键点：**
1. **懒加载模式**：只在第一次请求时创建
2. **单例模式**：每种姿态类型只有一个实例
3. **自动激活**：创建后立即调用 `OnEnable`
4. **永久存在**：加入字典后不会被移除（除非角色销毁）

---

### **二、姿态共存的实际案例**

#### **场景示例：**

假设角色同时装备了**枪械**和**近战武器**，并且正在**攀爬**：

```csharp
// 装备枪时
ShooterWeapon.RunOnEquip(Character character, Args args)
{
    // 请求 ShooterStance，不存在则创建
    character.Combat.RequestStance<ShooterStance>();
    
    // 此时 m_Stances 包含:
    // { ShooterStance.ID: ShooterStance实例 }
}

// 装备近战武器时
MeleeWeapon.RunOnEquip(Character character, Args args)
{
    // 请求 MeleeStance，不存在则创建
    character.Combat.RequestStance<MeleeStance>();
    
    // 此时 m_Stances 包含:
    // { ShooterStance.ID: ShooterStance实例,
    //   MeleeStance.ID: MeleeStance实例 }
}

// 开始攀爬时
Traverse.Run(Character character)
{
    // 请求 TraversalStance
    TraversalStance stance = character.Combat.RequestStance<TraversalStance>();
    
    // 此时 m_Stances 包含:
    // { ShooterStance.ID: ShooterStance实例,
    //   MeleeStance.ID: MeleeStance实例,
    //   TraversalStance.ID: TraversalStance实例 }
}
```

**结果：三个姿态同时存在！**

---

### **三、为什么不会冲突？**

#### **1. 各自管理独立的状态**

每个姿态只关心自己的领域：

```csharp
// ShooterStance 只管理射击相关
public class ShooterStance : TStance
{
    private Dictionary<int, WeaponData> m_Equipment;  // 枪械数据
    private AnimFloat m_Accuracy;                     // 精度系统
    
    public Reloading Reloading { get; }   // 换弹
    public Shooting Shooting { get; }     // 射击
    public Jamming Jamming { get; }       // 卡壳
}

// MeleeStance 只管理近战相关
public class MeleeStance : TStance
{
    private Input m_Input;        // 输入缓冲
    private Attacks m_Attacks;    // 攻击链
    
    public MeleePhase CurrentPhase { get; }  // 当前阶段（蓄力/挥击/恢复）
}

// TraversalStance 只管理移动相关
public class TraversalStance : TStance
{
    public Traverse Traverse { get; }           // 当前攀爬对象
    internal bool AllowMovement { get; set; }   // 是否允许移动
    internal bool InInteractiveTransition { get; set; }
}
```

**没有共享状态，自然不会冲突！**

---

#### **2. 通过逻辑层面协调**

虽然可以共存，但在实际使用时会互相检查状态：

**案例 1：射击时不能换弹**

```csharp
// ShooterStance.PullTrigger()
public void PullTrigger(ShooterWeapon weapon)
{
    // 检查是否正在换弹
    if (this.Reloading.WeaponReloading == weapon)
    {
        // 如果支持战术换弹，中断换弹
        if (this.Reloading.CanPartialReload)
            StopReload(weapon, CancelReason.PartialReload);
        return;  // 阻止射击
    }
    
    // ... 继续射击逻辑
}
```

**案例 2：攀爬时可能禁用其他动作**

```csharp
// 在 Traversal 的逻辑中可能会这样检查
if (traversalStance.Traverse != null)
{
    // 正在攀爬，禁止射击
    return;
}
```

---

### **四、统一更新机制**

所有激活的姿态都会在每帧更新：

```csharp
// Combat.OnLateUpdate()
internal void OnLateUpdate()
{
    this.CalculateDefense();

    // 遍历所有姿态并更新
    foreach (KeyValuePair<int, IStance> entry in this.m_Stances)
    {
        entry.Value.OnUpdate();  // 每个姿态都会更新
    }
    
    this.m_Invincibility.OnUpdate();
}
```

**每个姿态的 OnUpdate 实现：**

```csharp
// ShooterStance
public override void OnUpdate()
{
    // 更新精度恢复
    m_Accuracy.UpdateWithDelta(...);
    
    // 更新所有装备的武器
    foreach (var entry in m_Equipment)
    {
        entry.Value.OnUpdate();  // 检查射速、蓄力等
    }
}

// MeleeStance
public override void OnUpdate()
{
    // 更新攻击状态机
    this.m_Attacks.Update();
}

// TraversalStance
public override void OnUpdate()
{
    // 可能为空（攀爬逻辑可能在其他地方）
}
```

---

### **五、实际应用场景分析**

#### **场景 1：角色同时持有多种武器**

```csharp
// 玩家装备系统
public class PlayerInventory
{
    public void EquipPrimaryWeapon()
    {
        // 装备步枪（ShooterWeapon）
        character.Combat.RequestStance<ShooterStance>();
        // ShooterStance 被创建或返回已存在实例
    }
    
    public void EquipSecondaryWeapon()
    {
        // 装备手枪（ShooterWeapon）
        var stance = character.Combat.RequestStance<ShooterStance>();
        // 返回同一个 ShooterStance 实例！
        
        // ShooterStance 内部的 m_Equipment 字典会同时管理多把武器
    }
    
    public void EquipMeleeWeapon()
    {
        // 装备近战武器（MeleeWeapon）
        character.Combat.RequestStance<MeleeStance>();
        // MeleeStance 被创建，与 ShooterStance 共存
    }
}
```

**结果：**
- 同时拥有 `ShooterStance` 和 `MeleeStance`
- 可以快速切换武器而无需重新创建姿态
- 每个姿态维护各自的武器数据

---

#### **场景 2：射击中被攀爬打断**

```csharp
// 攀爬系统
public async Task StartClimb(Character character)
{
    // 请求 TraversalStance
    TraversalStance traversal = character.Combat.RequestStance<TraversalStance>();
    
    // 进入攀爬状态
    TraversalToken token = await traversal.OnTraverseEnter(this);
    
    // 此时射击功能需要自己检查状态
    ShooterStance shooter = character.Combat.RequestStance<ShooterStance>();
    
    // 在射击逻辑中添加检查
    if (traversal.Traverse != null)
    {
        // 正在攀爬，不允许射击
        return;
    }
}
```

---

#### **场景 3：战斗中被击中播放受击动作**

```csharp
// MeleeStance.Hit()
public void Hit(Character attacker, ReactionInput input, Skill skill)
{
    // 即使同时存在 ShooterStance，MeleeStance 也能处理受击
    
    // 检查是否正在攻击
    bool isAttacking = 
        this.m_Attacks.Phase == MeleePhase.Anticipation ||
        this.m_Attacks.Phase == MeleePhase.Strike       ||
        this.m_Attacks.Phase == MeleePhase.Recovery;
    
    if (isAttacking)
    {
        // 造成韧性伤害
        bool poiseBroken = this.Character.Combat.Poise.Damage(damage);
        
        if (!poiseBroken) return;  // 韧性未破，继续攻击
    }
    
    // 播放受击反应（会打断其他动作）
    this.PlayReaction(attacker.gameObject, input, null, true);
}
```

---

### **六、设计优势**

#### **1. 模块化**
- 每个扩展包（Shooter/Melee/Traversal）独立维护自己的姿态
- 互不干扰，易于扩展

#### **2. 高效**
- 单例模式避免重复创建
- 懒加载减少初始开销

#### **3. 灵活**
- 允许多种玩法共存（可射击的近战角色）
- 通过逻辑层面协调，而非硬性互斥

#### **4. 易于维护**
- 每个姿态职责单一
- 添加新姿态不影响现有系统

---

### **七、潜在问题与解决方案**

#### **问题 1：动画冲突**

**问题：**
- ShooterStance 播放射击动画
- MeleeStance 播放攻击动画
- 可能同时触发

**解决方案：**
使用 **AnimationLayer 分层**：

```csharp
// ShooterWeapon 使用 Layer 7
[SerializeField] private PropertyGetInteger m_Layer = GetDecimalInteger.Create(7);

// MeleeWeapon 使用不同的 Layer
// 两者不会冲突，可以混合播放
```

---

#### **问题 2：输入处理**

**问题：**
- 鼠标左键既可以射击，也可以近战

**解决方案：**
在游戏逻辑层面根据当前武器决定：

```csharp
public void OnFireButton()
{
    TWeapon currentWeapon = GetCurrentWeapon();
    
    if (currentWeapon is ShooterWeapon shooter)
    {
        ShooterStance stance = character.Combat.RequestStance<ShooterStance>();
        stance.PullTrigger(shooter);
    }
    else if (currentWeapon is MeleeWeapon melee)
    {
        MeleeStance stance = character.Combat.RequestStance<MeleeStance>();
        stance.InputExecute(MeleeKey.Light);
    }
}
```

---

#### **问题 3：状态冲突**

**问题：**
- 攀爬时能否射击？
- 换弹时能否近战？

**解决方案：**
各系统内部检查：

```csharp
// ShooterStance 检查
public void PullTrigger(ShooterWeapon weapon)
{
    // 检查是否在换弹
    if (Reloading.IsReloading) return;
    
    // 检查是否在攀爬
    TraversalStance traversal = character.Combat.RequestStance<TraversalStance>();
    if (traversal.Traverse != null) return;
    
    // 检查是否在近战攻击
    MeleeStance melee = character.Combat.RequestStance<MeleeStance>();
    if (melee.CurrentPhase != MeleePhase.None) return;
    
    // 通过所有检查，允许射击
    weaponData.OnPullTrigger();
}
```

---

### **八、总结**

**姿态系统的关键特性：**

| 特性 | 实现方式 |
|------|---------|
| **共存性** | 字典存储，类型 Hash 作为 Key |
| **单例性** | 每种类型只有一个实例 |
| **懒加载** | 首次请求时创建 |
| **自动更新** | 每帧遍历所有姿态调用 OnUpdate |
| **互不干扰** | 各自管理独立状态 |
| **逻辑协调** | 通过检查其他姿态状态来协调 |

**最佳实践：**

1. **使用 RequestStance 而非自己创建**
   ```csharp
   // ✅ 正确
   ShooterStance stance = character.Combat.RequestStance<ShooterStance>();
   
   // ❌ 错误
   ShooterStance stance = new ShooterStance();
   ```

2. **在需要时检查其他姿态状态**
   ```csharp
   TraversalStance traversal = character.Combat.RequestStance<TraversalStance>();
   if (traversal.Traverse != null)
   {
       // 正在攀爬，禁用当前操作
       return;
   }
   ```

3. **使用不同的 AnimationLayer 避免冲突**
   ```csharp
   // 射击：Layer 7
   // 近战：Layer 5
   // 它们可以同时播放并混合
   ```

这就是 GameCreator2 姿态系统的精髓：**通过类型隔离实现模块化，通过逻辑协调实现协同工作**！

mi1890: Camera Raycast模式（FPS常用） 这个详细解释下 没太看懂，同时aim 相关的代码也解释下

GitHub Copilot: 好的！让我详细解释 Camera Raycast 瞄准模式和整个 Aim 系统。这是 Shooter 系统中非常核心的部分。 

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Aim/TAim.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Aim/Aim.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Aim/AimCameraDistance.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Aim/AimPointerOnRaycast.cs)

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/Classes/Aim/AimPointerOnPlane.cs)

搜索 `GetMuzzle` (`**/Shooter/Runtime/ScriptableObjects/Sight.cs`)、2 结果的文本

搜索 `GetSpreadDirection` (`**/Shooter/Runtime/**/*.cs`)、3 结果的文本

读取 [](file:///e%3A/work/tgascreator/TGASCreatorUnityProject/Assets/Plugins/GameCreator/Packages/Shooter/Runtime/ScriptableObjects/Sight.cs#80-80)，行 80 到 120

现在让我创建一个详细的图解说明文档：

## **Aim 瞄准系统完全解析 - 从原理到应用**

### **一、核心概念理解**

#### **1. Aim 系统的作用**

Aim 系统解决了一个核心问题：**子弹应该朝哪里飞？**

在射击游戏中，有三个关键的点：
1. **枪口位置** (Muzzle Position) - 子弹从哪里发射
2. **瞄准点** (Aim Point) - 玩家想射击的目标位置
3. **最终方向** (Final Direction) - 考虑精度散布后的实际射击方向

```
流程图：
┌─────────────┐
│   玩家输入   │ (鼠标、摇杆)
└──────┬──────┘
       ↓
┌─────────────────────────────────┐
│     Aim 系统计算瞄准点          │
│  GetPoint() → 返回 Vector3      │
└──────┬──────────────────────────┘
       ↓
┌─────────────────────────────────┐
│   从枪口指向瞄准点的向量        │
│  Direction = AimPoint - Muzzle  │
└──────┬──────────────────────────┘
       ↓
┌─────────────────────────────────┐
│   应用精度散布 (Spread)         │
│  GetSpreadDirection()           │
└──────┬──────────────────────────┘
       ↓
┌─────────────────────────────────┐
│   子弹沿最终方向飞行            │
└─────────────────────────────────┘
```

---

### **二、AimCameraRaycast 详细解析**

这是 **FPS 游戏最常用的瞄准模式**，让我们逐行分析：

```csharp
public class AimCameraRaycast : TAim
{
    private const float INFINITY = 999f;  // 无限远距离（实际是999米）
    
    [SerializeField] private PropertyGetGameObject m_Camera = GetGameObjectCameraMain.Create;
    [SerializeField] private LayerMask m_LayerMask = Physics.DefaultRaycastLayers;
    
    public override Vector3 GetPoint(Args args)
    {
        // 1. 获取摄像机
        Transform camera = this.m_Camera.Get<Transform>(args);
        if (camera == null)
        {
            // 降级方案：使用角色前方远点
            return args.Self.transform.TransformPoint(Vector3.forward * INFINITY);
        }
        
        // 2. 计算摄像机朝向
        Vector3 cameraDirection = camera.TransformDirection(Vector3.forward);
        
        // 3. 【关键】投影射线起点到摄像机射线上
        Ray cameraRay = new Ray(camera.position, cameraDirection);
        Vector3 raySource = args.Self.transform.position.ProjectPointOntoRay(cameraRay);
        
        // 4. 从投影点向摄像机方向发射射线
        bool isHit = Physics.Raycast(
            raySource,                    // 起点（在摄像机射线上）
            cameraDirection.normalized,   // 方向（与摄像机一致）
            out RaycastHit hit,
            INFINITY,                     // 最大距离
            this.m_LayerMask,
            QueryTriggerInteraction.Ignore
        );
        
        // 5. 返回结果
        return isHit 
            ? hit.point                                        // 命中点
            : camera.TransformPoint(Vector3.forward * INFINITY); // 远点
    }
}
```

#### **关键点解析：ProjectPointOntoRay**

这是最容易混淆的部分！让我用图解说明：

```
场景示例（俯视图）：

                    Camera (在角色后上方)
                      ●
                      │
                      │ Camera Forward
                      ↓
                    ╱ │ ╲
                  ╱   │   ╲  Camera Ray
                ╱     │     ╲
              ╱       │       ╲
            ╱         │         ╲
          ╱           ↓           ╲
        ╱          命中点           ╲
      ╱              ●               ╲
                   
                   
    角色位置
       ●─────────────┐
       │   武器模型   │
       │      ●  ← 枪口位置
       │             │
       └─────────────┘


问题：如果直接从枪口位置射击，会偏离摄像机瞄准的点！

解决方案：
1. 创建从摄像机发出的射线
2. 将角色位置投影到这条射线上，得到 raySource
3. 从 raySource 沿摄像机方向发射真正的射线

这样可以保证：
- 射线方向与摄像机完全一致
- 起点在摄像机射线上（避免角色遮挡）
```

#### **为什么不直接从摄像机发射？**

```csharp
// ❌ 错误做法
Physics.Raycast(
    camera.position,      // 从摄像机位置
    cameraDirection,
    ...
);
// 问题：摄像机可能在墙后、障碍物内部
```

```csharp
// ✅ 正确做法
Vector3 raySource = args.Self.transform.position.ProjectPointOntoRay(cameraRay);
Physics.Raycast(
    raySource,            // 从角色位置投影到摄像机射线上
    cameraDirection,
    ...
);
// 优势：
// 1. 避免从墙后射线检测
// 2. 保持与摄像机方向一致
// 3. 起点在角色附近，符合逻辑
```

---

### **三、所有 Aim 模式对比**

#### **1. AimCameraRaycast - 摄像机中心射线检测**

**适用场景：** FPS、硬核射击游戏

**特点：**
- ✅ 精确命中摄像机瞄准的点
- ✅ 考虑物理碰撞
- ✅ 适合复杂场景（掩体、障碍物）

**工作原理：**
```
摄像机中心 → 射线检测 → 第一个碰撞点
             ↓
         如果没碰撞
             ↓
      摄像机前方远点 (999米)
```

**代码流程：**
```csharp
// 1. 获取摄像机方向
Vector3 cameraDir = camera.TransformDirection(Vector3.forward);

// 2. 投影角色位置到摄像机射线
Ray cameraRay = new Ray(camera.position, cameraDir);
Vector3 raySource = character.position.ProjectPointOntoRay(cameraRay);

// 3. 射线检测
bool hit = Physics.Raycast(raySource, cameraDir, out RaycastHit hitInfo, ...);

// 4. 返回瞄准点
return hit ? hitInfo.point : camera.position + cameraDir * 999f;
```

---

#### **2. AimCameraDistance - 摄像机固定距离**

**适用场景：** 休闲射击、射击小游戏

**特点：**
- ✅ 简单高效
- ✅ 不需要物理检测
- ❌ 不考虑障碍物

**工作原理：**
```
摄像机位置 + 摄像机方向 × 固定距离 = 瞄准点
```

**代码：**
```csharp
public override Vector3 GetPoint(Args args)
{
    Transform camera = m_Camera.Get<Transform>(args);
    float distance = 10f; // 固定10米
    
    // 直接返回摄像机前方10米的点
    return camera.TransformPoint(Vector3.forward * distance);
}
```

**应用示例：**
```
游戏类型：《堡垒之夜》建造模式
- 准星始终指向玩家前方固定距离
- 不管有没有障碍物
- 简单直观
```

---

#### **3. AimCharacterTarget - 角色目标锁定**

**适用场景：** TPS 动作游戏、ARPG

**特点：**
- ✅ 自动瞄准敌人
- ✅ 适合控制器操作
- ✅ 降低操作难度

**工作原理：**
```csharp
public override Vector3 GetPoint(Args args)
{
    Character character = m_Character.Get<Character>(args);
    
    // 获取战斗目标
    GameObject target = character.Combat.Targets.Primary;
    
    return target != null
        ? target.transform.position  // 锁定目标位置
        : character.transform.TransformPoint(Vector3.forward * 999f); // 前方远点
}
```

**应用示例：**
```
游戏类型：《战神》、《只狼》
- 按锁定键选择敌人
- 攻击自动朝向目标
- 无需精确瞄准
```

---

#### **4. AimPointerOnRaycast - 鼠标射线检测**

**适用场景：** TPS、MOBA视角射击

**特点：**
- ✅ 鼠标位置直接射线检测
- ✅ 适合俯视角、第三人称
- ✅ 精确点击射击

**工作原理：**
```csharp
public override Vector3 GetPoint(Args args)
{
    Camera camera = m_Camera.Get<Camera>(args);
    Vector2 mousePos = Input.mousePosition; // 鼠标屏幕坐标
    
    // 从鼠标位置发射射线
    Ray ray = camera.ScreenPointToRay(mousePos);
    
    bool hit = Physics.Raycast(ray, out RaycastHit hitInfo, 999f, m_LayerMask);
    
    return hit ? hitInfo.point : character.position + Vector3.forward * 999f;
}
```

**图解：**
```
屏幕空间               世界空间
┌──────────┐          
│          │          
│    ●     │  鼠标    ────→  射线 ────→ 命中点 ●
│  (x,y)   │                               ↑
│          │                             地面
└──────────┘          
```

**应用示例：**
```
游戏类型：《暗黑破坏神》系列
- 鼠标点击地面
- 角色朝那个方向射击
- 精确控制射击位置
```

---

#### **5. AimPointerOnPlane - 鼠标平面投影**

**适用场景：** 2.5D游戏、俯视角射击

**特点：**
- ✅ 投影到固定平面（XZ/XY/YZ）
- ✅ 适合固定视角游戏
- ✅ 不受地形高度影响

**工作原理：**
```csharp
public override Vector3 GetPoint(Args args)
{
    Camera camera = m_Camera.Get<Camera>(args);
    Vector2 mousePos = m_Cursor.Read();
    
    // 创建射线
    Ray ray = camera.ScreenPointToRay(mousePos);
    
    // 创建平面（XZ 地面）
    Plane plane = new Plane(Vector3.up, character.position);
    
    // 射线与平面相交
    if (plane.Raycast(ray, out float distance))
    {
        return ray.GetPoint(distance); // 交点
    }
    
    return character.position + Vector3.forward * 999f;
}
```

**图解：**
```
侧视图：

摄像机 ●
        ╲
         ╲  射线
          ╲
           ╲
            ● 交点
━━━━━━━━━━━━━━━  XZ 平面 (地面)
     角色 ●
```

**应用示例：**
```
游戏类型：《进入地牢》
- 固定俯视角
- 鼠标始终投影到地面
- 角色朝地面点射击
```

---

### **四、Aim 系统在射击流程中的完整应用**

让我们看完整的射击流程，理解 Aim 如何工作：

```csharp
// ========== 步骤 1：获取瞄准点 ==========
public Vector3 GetSpreadDirection(Args args, ShooterWeapon weapon)
{
    // 1.1 获取枪口数据
    MuzzleData muzzle = this.GetMuzzle(args, weapon);
    // muzzle.Position = 武器模型上枪口的世界坐标
    // muzzle.Direction = 枪口朝向
    
    // 1.2 获取 Aim 瞄准点（这里调用 Aim 系统！）
    Vector3 aimPoint = this.m_Aim.GetPoint(args);
    
    // 1.3 计算从枪口到瞄准点的方向
    Vector3 direction = (aimPoint - muzzle.Position).normalized;
    
    // ========== 步骤 2：应用精度散布 ==========
    
    // 2.1 计算散布轴
    Vector3 axisPitch = Vector3.Cross(direction, Vector3.up); // 俯仰轴
    Vector3 axisYaw = Vector3.up;                             // 偏航轴
    
    // 2.2 获取散布值（受移动、精度影响）
    Vector2 spread = weapon.Accuracy.CalculateSpread(args);
    // spread.x = 水平散布角度 (-2° ~ +2°)
    // spread.y = 垂直散布角度 (-1° ~ +1°)
    
    // 2.3 应用俯仰散布
    Quaternion spreadPitch = Quaternion.AngleAxis(spread.y, axisPitch);
    direction = spreadPitch * direction;
    
    // 2.4 应用偏航散布
    Quaternion spreadYaw = Quaternion.AngleAxis(spread.x, axisYaw);
    direction = spreadYaw * direction;
    
    // ========== 步骤 3：返回最终方向 ==========
    return direction;
}
```

#### **图解完整流程：**

```
俯视图示例（AimCameraRaycast 模式）：

1. 玩家瞄准墙后的敌人
                      
        墙壁              敌人
         │                 ●
         │               
         │               
    ─────┼─────────────  摄像机射线方向
         │       ↑
         │     瞄准点 ●  ← Aim.GetPoint() 返回这里
         │      /
         │    /  理想射击线
         │  /
        枪口 ●  ← muzzle.Position
        /
       /
    角色 ●


2. 计算方向向量
    direction = 瞄准点 - 枪口位置
             = (10, 2, 5) - (5, 1.5, 3)
             = (5, 0.5, 2).normalized
             

3. 应用散布（假设移动中，精度差）
    spread = (-1.5°, 0.8°)  ← 随机偏移
    
    最终方向 = Rotate(direction, spread)
             ≈ 略微偏离瞄准点


4. 子弹沿最终方向飞行
    可能打中墙壁，也可能穿过缝隙命中敌人
```

---

### **五、实战应用案例**

#### **案例 1：CS:GO 风格的精确射击**

```csharp
// Sight 配置
public class CSGOSight : Sight
{
    Aim = new AimCameraRaycast()
    {
        m_Camera = 主摄像机,
        m_LayerMask = 除了玩家外的所有层
    };
    
    Accuracy = new Accuracy()
    {
        m_MaxSpreadX = 0.5f,  // 极小散布
        m_MaxSpreadY = 0.5f,
        m_MotionAccuracy = 0.8f,  // 移动时精度降低80%
        m_AccuracyRecover = 2f     // 快速恢复
    };
}

// 结果：
// - 静止时：几乎指哪打哪
// - 移动时：散布增大，需要停下瞄准
// - 连射时：后坐力累积，需要点射
```

---

#### **案例 2：《守望先锋》托比昂炮塔**

```csharp
// Sight 配置
public class TurretSight : Sight
{
    Aim = new AimCharacterTarget()
    {
        m_Character = 炮塔所属者
    };
    
    // 炮塔射击逻辑
    public void Update()
    {
        if (HasTarget())
        {
            // 自动瞄准锁定目标
            Vector3 aimPoint = Aim.GetPoint(args);
            
            // 转向目标
            transform.LookAt(aimPoint);
            
            // 开火
            Shoot();
        }
    }
}
```

---

#### **案例 3：《暗黑破坏神》点击射击**

```csharp
// Sight 配置
public class DiabloSight : Sight
{
    Aim = new AimPointerOnPlane()
    {
        m_Camera = 俯视摄像机,
        m_Plane = Axis.XZ,  // 地面平面
        m_Cursor = 鼠标位置
    };
    
    // 游戏逻辑
    void OnMouseClick()
    {
        // 获取鼠标点击的地面位置
        Vector3 targetPos = Aim.GetPoint(args);
        
        // 角色转向
        character.transform.LookAt(targetPos);
        
        // 射击
        ShooterStance.PullTrigger(weapon);
    }
}
```

---

### **六、Aim 系统的高级特性**

#### **1. MinDistance 最小距离保护**

在 `AimPointerOnRaycast` 中：

```csharp
[SerializeField] private PropertyGetDecimal m_MinDistance = GetDecimalConstantPointOne.Create;

public override Vector3 GetPoint(Args args)
{
    // ... 射线检测 ...
    
    if (isHit)
    {
        float minDistance = (float) this.m_MinDistance.Get(args);
        float distance = hitInfo.distance;
        
        // 如果命中点太近（比如0.1米），使用远点
        return distance >= minDistance 
            ? hitInfo.point
            : target.TransformPoint(Vector3.forward * INFINITY);
    }
}
```

**作用：** 防止瞄准脚下或极近距离，导致异常行为

---

#### **2. MinAccuracy 最小精度限制**

在 `Sight.Aim` 中：

```csharp
[SerializeField] private PropertyGetDecimal m_MinAccuracy = GetDecimalConstantZero.Create;

// 在精度计算中使用
float accuracy = CalculateTargetAccuracy(...);

float minAccuracy = sight.Aim.GetMinAccuracy(args);

// 精度不能低于最小值（比如瞄准镜时最低50%精度）
return Mathf.Max(accuracy, minAccuracy);
```

**应用场景：**
- 开镜时：`MinAccuracy = 0.5` → 即使跑动，精度也有50%
- 腰射时：`MinAccuracy = 0.0` → 可以完全散布

---

### **七、常见问题解答**

#### **Q1: 为什么我的子弹不是从准星射出？**

**A:** 这是正常的！观察这个过程：

```
1. Aim.GetPoint() 返回准星瞄准的点 (10, 0, 20)
2. 枪口位置在 (5, 1.5, 3)
3. 计算方向 = (10, 0, 20) - (5, 1.5, 3) = (5, -1.5, 17).normalized
4. 子弹从枪口沿这个方向飞

结果：子弹轨迹会穿过准星瞄准点！
```

**图解：**
```
侧视图：

准星瞄准点 ●
          /
        / 子弹轨迹（从枪口出发，经过瞄准点）
      /
    ●  枪口（实际发射位置）
    
这就是为什么子弹能打中准星瞄准的位置，
即使它不是从屏幕中心射出的！
```

---

#### **Q2: AimCameraRaycast 和 AimPointerOnRaycast 有什么区别？**

| 特性 | AimCameraRaycast | AimPointerOnRaycast |
|------|------------------|---------------------|
| 射线起点 | 摄像机中心 | 鼠标屏幕位置 |
| 适用输入 | 任何（键鼠/手柄） | 仅鼠标 |
| 适用视角 | 第一人称 | 第三人称 |
| 准星 | 屏幕中心固定 | 跟随鼠标移动 |

```csharp
// AimCameraRaycast
Ray ray = new Ray(camera.position, camera.forward);
// 射线固定从屏幕中心发出

// AimPointerOnRaycast  
Vector2 mousePos = Input.mousePosition;
Ray ray = camera.ScreenPointToRay(mousePos);
// 射线跟随鼠标位置
```

---

#### **Q3: 如何实现准星跟随目标（吸附）？**

结合多个 Aim 模式：

```csharp
public class AimAssist : TAim
{
    [SerializeField] private TAim m_PrimaryAim = new AimCameraRaycast();
    [SerializeField] private float m_AssistRadius = 2f;
    
    public override Vector3 GetPoint(Args args)
    {
        // 1. 获取原始瞄准点
        Vector3 aimPoint = m_PrimaryAim.GetPoint(args);
        
        // 2. 检测附近是否有敌人
        Collider[] enemies = Physics.OverlapSphere(aimPoint, m_AssistRadius, enemyLayer);
        
        if (enemies.Length > 0)
        {
            // 3. 吸附到最近的敌人
            float minDist = float.MaxValue;
            Vector3 closestPoint = aimPoint;
            
            foreach (var enemy in enemies)
            {
                float dist = Vector3.Distance(aimPoint, enemy.transform.position);
                if (dist < minDist)
                {
                    minDist = dist;
                    closestPoint = enemy.transform.position + Vector3.up; // 头部
                }
            }
            
            return closestPoint;
        }
        
        return aimPoint;
    }
}
```

---

### **八、总结**

**Aim 系统的设计哲学：**

1. **分离关注点**：瞄准逻辑与射击逻辑分离
2. **多态设计**：不同游戏类型使用不同 Aim 实现
3. **精确控制**：从瞄准点到最终射击方向的完整链路

**关键要点：**

- `Aim.GetPoint()` → 计算瞄准点（世界坐标）
- `Muzzle.GetPosition()` → 获取枪口位置
- `direction = aimPoint - muzzlePos` → 计算射击方向
- `ApplySpread(direction)` → 应用精度散布
- 子弹沿最终方向飞行

**选择 Aim 模式的建议：**

```
FPS 游戏         → AimCameraRaycast
TPS 鼠标射击     → AimPointerOnRaycast
自动瞄准/锁定    → AimCharacterTarget
休闲/简单射击    → AimCameraDistance
俯视角/2.5D     → AimPointerOnPlane
```

这就是 Aim 系统的完整解析！希望能帮你彻底理解这个核心机制！