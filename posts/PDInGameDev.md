---
title: "PD在游戏中的应用"
excerpt: "D（比例–微分）控制在游戏里的简单应用和实现方法。"
date: "2025-08-12"
tags: ["博客", "游戏开发", "教程","Unity3d"]
---


# PD在游戏中的应用

PD控制器（比例–微分控制器）在游戏开发中可以用于多种场景，如角色移动、摄像机跟随等。本文将介绍PD控制器的基本原理及其在Unity3D中的实现方法。


## 使用场景

最近在优化项目中的载具控制器,原始的载具稳定器用的是Rigidbody的Constraints ,直接将X和Z轴的旋转锁定,但是这种设置会引发一些奇怪的问题,例如车子被挤飞等,而且表现也不自然.

先是从以前做过的项目里找了一个稳定器代码
```csharp
float balanceSpringRate = machineData.BalanceSpringRate;
float balanceDampingRate = machineData.BalanceDampingRate;

Vector3 balanceSpring = Quaternion.FromToRotation(Body.Trans.up, Vector3.up).eulerAngles;
if (balanceSpring.x > 180f)
    balanceSpring.x -= 360f;
if (balanceSpring.y > 180f)
    balanceSpring.y -= 360f;
if (balanceSpring.z > 180f)
    balanceSpring.z -= 360f;

balanceSpring = balanceSpring * balanceSpringRate;
Vector3 balanceDamping = -Body.Rigidbody.angularVelocity * balanceDampingRate;

Body.Rigidbody.AddTorque(balanceSpring + balanceDamping, ForceMode.Force);    
```

这个代码是以前的另一个项目的同事写的,它使用了一个弹簧和阻尼器来平衡载具的姿态,但是算法本身是有问题的,直接用Quaternion.FromToRotation结果来计算旋转.AI给的解释是

```text
能在“小角度、姿态变化不大”的情况下勉强起作用，但不推荐。用 eulerAngles 当作力矩会带来轴耦合与跳变，容易抖动或在大角度时发疯。更稳的做法是用“最短旋转的轴-角”或“叉积误差”做 PD 控制。
```

然后让AI给了一个更好的实现方法,使用叉积误差来计算PD控制器的输出

```csharp
  void ApplyBalanceTorque(Rigidbody rb, Transform body, Vector3 targetUp,
                        float kP = 8f, float kD = 1.5f, float maxAccel = 50f, float deadZoneDeg = 1f)
{
    Vector3 curUp = body.up;
    // 计算最短旋转
    Quaternion delta = Quaternion.FromToRotation(curUp, targetUp.normalized);
    delta.ToAngleAxis(out float angleDeg, out Vector3 axis);

    // 特殊情况保护：几乎对齐或数值退化
    if (axis.sqrMagnitude < 1e-8f) return;

    // 取 [-180,180]，转弧度
    if (angleDeg > 180f) angleDeg -= 360f;
    float angleRad = angleDeg * Mathf.Deg2Rad;

    // 死区，抗噪
    if (Mathf.Abs(angleRad) < deadZoneDeg * Mathf.Deg2Rad) return;

    axis.Normalize();

    // 只对校正轴做阻尼
    Vector3 angVel = rb.angularVelocity;
    float wAlong = Vector3.Dot(angVel, axis);
    Vector3 torqueAccel = axis * (kP * angleRad) - axis * (kD * wAlong);

    // 限幅，避免冲击
    if (torqueAccel.sqrMagnitude > maxAccel * maxAccel)
        torqueAccel = torqueAccel.normalized * maxAccel;

    // 与质量/惯量无关的控制，调参更稳
    rb.AddTorque(torqueAccel, ForceMode.Acceleration);
}
```

计算旋转轴和旋转角度来实现PD控制器的输出,这个方法比直接使用欧拉角更稳定,可以避免轴耦合和跳变问题.


## AI解释和基础教学

AI给出的解释和基础前置数学知识如下

```text
好的，我把这套“让车体的向上方向对齐目标向上方向”的数学与控制逻辑，从基础到实现，系统地讲一遍。你可以当作是把“旋转对齐问题”建模成一个受控的转动系统，并用一个稳定的 PD 控制器去收敛。

一、为什么你原来的实现会抖动

你用的是 Quaternion.FromToRotation(currUp, targetUp).eulerAngles 作为力矩。这会有两个严重问题：
欧拉角是分轴分解且有 0/360 跳变，不是“最短旋转”的线性误差；直接拿它当扭矩会在临界点反复换向，引入抖动。
欧拉角分量和真实需要的旋转轴不一致。实际需要的是“绕着某个单一轴旋转一个最小角度”，而不是“绕世界 X/Y/Z 各转一些角度”。
二、基础数学（建议先理解这几个点）

向量、点积、叉积
两个单位向量 a、b 之间的夹角 θ 满足：
cosθ = a · b
|a × b| = sinθ
a × b 的方向是右手定则，指向“从 a 旋到 b 的最短旋转轴”的方向（注意只在最短路径意义上）。
当 a 和 b 都归一化时，a × b 的大小就是 sinθ。小角度时 sinθ ≈ θ（弧度）。
最短旋转（轴-角表示）
“让 a 变成 b 的最短旋转”可以表示为：绕单位轴 n 旋转角度 θ，其中
n = normalize(a × b)（当 a 不等于 b，也不相反）
θ = atan2(|a × b|, a · b)（范围在 [0, π]）
这套公式很稳定：dot 给你 cosθ，cross 的模给你 sinθ，用 atan2 可以避免数值不稳定。
四元数与欧拉角
四元数（Quaternion）能很好表示旋转，且没有欧拉角的跳变/万向锁问题。
Quaternion.FromToRotation(a, b) 就是在算“让 a 旋到 b 的最短旋转”。
但其 eulerAngles 是对四元数的 XYZ 分轴分解，不是用来做控制误差的。用于控制应转为轴角（ToAngleAxis），或者直接用叉积作为误差。
三、刚体转动与 AddTorque 的物理含义

刚体的转动动力学（一般式）：τ = I·α + ω × (I·ω)
τ：力矩
I：惯性张量
α：角加速度
ω：角速度
在 Unity 中：
AddTorque(..., ForceMode.Force)：施加“力矩”，结果角加速度与惯量有关。
AddTorque(..., ForceMode.Acceleration)：施加“角加速度”（单位上相当于直接给 α），使控制与质量/惯量尺度弱相关，调参更方便。
PD 控制里我们常更喜欢用 Acceleration 模式，这样 kP、kD 的意义比较直观：kP 是“每弧度误差给多少角加速度”，kD 是“每单位角速度给多少制动角加速度”。
四、把“对齐 up 向量”的问题变成可控的 1D 振子

我们要让 u = transform.up 对齐 t = targetUp。

误差可以用“轴-角”表示：轴 n = normalize(u × t)，角 θ = atan2(|u × t|, u · t)。

控制目标：θ → 0。

一维的 PD 控制（弹簧-阻尼模型）：

角加速度 α_n = kP·θ − kD·ω_n
ω_n 是角速度在轴 n 上的分量：ω_n = (ω · n)
把这个一维控制“装回三维”，就是沿着轴 n 施加向量形式的角加速度：

α_vec = n · (kP·θ − kD·ω_n) = n·kP·θ − n·(kD·(ω·n))
在 Unity 里用 AddTorque(α_vec, ForceMode.Acceleration)。
小角度的简化（常用且好用）

由于 |u × t| ≈ θ（弧度），你可以把 e = u × t 当作误差向量，直接
α_vec ≈ kP·e − kD·ω
更稳一点的做法是阻尼只对校正轴：把 ω 投影到 e 的方向或 n 的方向再做阻尼，避免对其他轴的角速度“误伤”。
五、为什么要加阻尼、死区、限幅

纯比例控制（只用 kP）会产生过冲，甚至和地面接触的噪声形成自激振荡，表现成抖动。
阻尼项（-kD·ω 或其投影）等价于给系统“刹车”，吸收能量，抑制过冲与抖动。
死区（比如 1°）：当误差很小时不施加校正，让系统停下来，抗噪声。
限幅：限制最大角加速度，避免瞬时过大控制冲击与数值发散。
六、从数学到代码的两种常见写法

轴-角精确版（适合大角度也稳定）
计算 delta = FromToRotation(u, t)
ToAngleAxis(out angleDeg, out axis)
规范化角度到 [-180°, 180°]，转换弧度 angleRad
ω_n = Project(rb.angularVelocity, axis)
α_vec = axis * (kP * angleRad) − ω_n * kD
AddTorque(α_vec, ForceMode.Acceleration)
叉积近似版（简洁，足够实用）
e = u × t
α_vec = kP * e − kD * Project(rb.angularVelocity, e.normalized) 或简单用 −kD * rb.angularVelocity
AddTorque(α_vec, ForceMode.Acceleration)
注意 e 很小时要做保护（死区），以及 e = 0 或接近 0 时不要用 e.normalized。
七、参数的物理意义与调参方法

kP（比例）：误差越大，给的角加速度越大。大则回正快，但容易过冲。
kD（阻尼）：角速度越大，给的反向角加速度越大。大则稳、少抖，但太大可能显得“黏”与响应慢。
一个实用的调参步骤：
先把 kD 调到“系统不会过冲、几乎不抖”的程度。
再逐步增大 kP 到你能接受的最快回正速度。
加 1° 左右的死区，以及角加速度限幅，保证在噪声下也稳。
空中/少轮接地/坡面：根据场景降低 kP（你已有此逻辑），避免和轮胎/悬挂/地面法线噪声对抗。
八、一些边界与工程细节

180° 情况（u 与 t 反向）：axis 不唯一（任何垂直于 u 的轴都行）。ToAngleAxis 会给出某个轴，但要防止 axis 近零的数值异常。叉积法在完全反向时 e=0（因为 sinπ=0），这时需要单独处理（任选一个与 u 垂直的稳定轴，例如用 transform.right 或 transform.forward 的投影）。
FixedUpdate 调用控制，避免帧率变化影响稳定性。
rb.maxAngularVelocity 适度增大（如 20），避免被硬上限裁剪导致“像被卡住一样”的抖动。
地面法线的平滑：bodyNormal 通常抖，建议指数平滑或球面插值。例如
smoothed = Slerp(prev, raw, 1 − exp(−s·fixedDeltaTime))，s 为平滑系数。
力矩模式选择：
如果用 ForceMode.Force，你的“扭矩”会受惯量影响，重车/轻车表现差异很大，调参难。
如果用 ForceMode.Acceleration，你传入的向量就是期望角加速度，质量/惯量缩放被屏蔽，调参容易、可迁移性好。
九、把这些知识串起来的一句话

“让 up 向量对齐 targetUp 的最短旋转轴是 u × t，角度是 atan2(|u × t|, u · t)。围绕这个轴施加一个‘与角度成正比、与角速度成反比’的角加速度（PD 控制），并加上死区与限幅，就能获得不抖、快且稳的回正效果。”
```

AI真方便,虽然他喜欢胡说八道,但有时候也能给出一些有用的建议和代码实现.

