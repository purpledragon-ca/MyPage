---
title: "Isaac Sim 常用物理参数总结"
date: "2026-04-20"
tags: ['IsaacSim', 'PhysX', 'Physics', '调参']
---

这篇文章整理的是我在 Isaac Sim 里常见、也最容易混淆的一批物理参数。它们大多出现在 `DynamicCuboid`、`DynamicCylinder` 这类带刚体的物体上，核心可以分成三类：让运动更稳定、让仿真更省、以及一些通常不需要频繁改的高级项。

## 一、参数速查表

先给一个 quick checklist。调参时先按症状查参数名，再往后看详细解释会更快。

| 分类 | 参数名 | 简短用途 |
| --- | --- | --- |
| Stable | `physxRigidBody:linearDamping` | 线性阻尼，让平移速度慢慢减小 |
| Stable | `physxRigidBody:angularDamping` | 角阻尼，让旋转速度慢慢减小 |
| Stable | `physxCollision:contactOffset` | 提前生成接触约束，不改真实碰撞几何 |
| Stable | `physxCollision:restOffset` | 调整稳定接触时的目标间距，帮助滑动和接触稳定 |
| Stable | `physxRigidBody:enableCCD` | 连续碰撞检测，减少高速穿模 |
| Stable | `physxRigidBody:enableSpeculativeCCD` | 预估式 CCD，适合测试高速漏碰场景 |
| Stable | `physxRigidBody:maxLinearVelocity` | 限制最大线速度，防止速度爆大 |
| Stable | `physxRigidBody:maxAngularVelocity` | 限制最大角速度，防止旋转爆大 |
| Stable | `physxRigidBody:maxContactImpulse` | 限制最大接触冲量，避免碰撞过猛 |
| Stable | `physxRigidBody:maxDepenetrationVelocity` | 限制去穿透修正速度，避免弹飞或修正过头 |
| Stable | `physxRigidBody:solverPositionIterationCount` | 增加位置求解精度，但会更耗算力 |
| Stable | `physxRigidBody:solverVelocityIterationCount` | 增加速度求解精度，但会更耗算力 |
| Speed up | `physics:startsAsleep` | 只影响仿真开始时是否睡眠 |
| Speed up | `physxRigidBody:sleepThreshold` | 运行中达到低速度/低能量后可进入休眠 |
| Speed up | `physxRigidBody:stabilizationThreshold` | 帮助物体在快停下时更稳、更少抖动 |
| Speed up | `physics:approximation` | 选择碰撞近似形状，直接影响速度和精度 |
| Some may use | `physxCollision:torsionalPatchRadius` | 控制围绕接触法线拧转时的扭转摩擦 |
| Some may use | `physxRigidBody:enableGyroscopicForces` | 启用陀螺效应，更适合高速旋转物体 |
| Some may use | `physxRigidBody:lockedPosAxis` | 锁定某些平移轴，只允许指定方向移动 |
| Some may use | `physxRigidBody:lockedRotAxis` | 锁定某些旋转轴，只允许指定方向转动 |
| Leave as-is | `physics:centerOfMass` | 质心设置，通常不是第一批要改的项 |
| Leave as-is | `physics:diagonalInertia` | 惯量相关参数，通常按模型默认值即可 |
| Leave as-is | `physics:principalAxes` | 主轴惯量方向，除非明确需要否则少动 |
| Leave as-is | `physxRigidBody:cfmScale` | 更底层的求解行为参数，日常很少先改 |
| Leave as-is | `physxRigidBody:contactSlopCoefficient` | 接触容差相关参数，通常不是常规调参入口 |
| Leave as-is | `physxRigidBody:retainAccelerations` | 保留加速度行为设置，通常不需要频繁改 |
| Leave as-is | `physxRigidBody:solveContact` | 接触求解控制项，除非定位到问题来源否则先别动 |

## 二、先抓主线：稳定和提速不要混着调

很多参数名字都和“稳定”有关，但用途并不一样。

- 如果你想让物体在物理上慢慢停下来，优先看 `physxRigidBody:linearDamping` 和 `physxRigidBody:angularDamping`。
- 如果你想让物体停稳后更快进入休眠、别再抖、别再继续算，优先看 `physics:startsAsleep`、`physxRigidBody:sleepThreshold`、`physxRigidBody:stabilizationThreshold`。
- 如果你想减少穿模，优先看 `physxRigidBody:enableCCD` 或 `physxRigidBody:enableSpeculativeCCD`。
- 如果你想让仿真别发散、别被碰撞一下弹飞，优先看速度和冲量上限那一组参数。

这几个方向最好分开调。否则很容易出现一种情况：明明问题是物体休眠太晚，却去一味增大 damping，最后只是让运动变肉，却没有真正减少抖动和计算量。

## 三、最常用的一组：damping

### `physxRigidBody:linearDamping`

线性阻尼。它会让物体的平移速度逐渐减小，效果很像空气阻力。

值越大，平移运动停得越快。

### `physxRigidBody:angularDamping`

角阻尼。它会让物体的旋转速度逐渐减小。

值越大，旋转停得越快。

### 什么时候先调 damping

当你看到的现象是：

- 方块落地后还会滑很久
- 圆柱还会转很久
- 物体没有明显穿透，但就是停不下来

这时先调 damping 通常最直接。

但要注意，damping 的作用是“持续耗散能量”，不是“满足条件后直接睡眠”。所以它更像让物体慢慢停下，而不是让引擎更早结束计算。

## 四、让物体更快睡下去：sleep / stabilization

### `physics:startsAsleep`

这是初始条件，只影响仿真开始那一刻物体是不是睡着。

它不负责运行过程中的自动休眠。

### `physxRigidBody:sleepThreshold`

这是运行过程中的休眠阈值。物体速度或能量小到一定程度后，会被引擎自动认为可以休眠。

如果你的目标是“停稳后别再继续抖、别再继续算”，这个参数往往比 damping 更直接。

### `physxRigidBody:stabilizationThreshold`

这是稳定化相关阈值。它通常和低速、小能量状态下的稳定处理有关，可以帮助物体在快停下时更稳，不容易残留细小抖动。

### 一个简单判断

- 想要“慢慢减速”：先调 `linearDamping` / `angularDamping`
- 想要“停稳后快点睡”：先调 `sleepThreshold` / `stabilizationThreshold`

## 五、几何变大和接触提前不是一回事

这几个参数特别容易混。

### 1. 直接扩大 collider

这改的是碰撞几何本身。

物体会在所有碰撞检测里都被当成“真的更大”：

- 接触位置会往外移
- 阻挡边界会往外移
- 重叠测试也会整体往外移

这是几何层面的变化。

### 2. `physxCollision:contactOffset`

它不会改变真实碰撞几何，而是让求解器在距离碰撞体还有一点距离时，提前生成接触约束。

所以它更像“提前准备接触”，不是“把碰撞体做大”。

### 3. `physxCollision:restOffset`

它也不会改变碰撞体本身，但会影响稳定接触时的目标间距。

一个常见理解方式是：方块的碰撞体没变，但停稳后，求解器可能让它和地面保持一点目标距离。

这在一些场景里有帮助：

- 滑动更顺
- 不容易被表面的小误差卡住
- 接触更稳定

## 六、减少穿模：CCD

### `physxRigidBody:enableCCD`

连续碰撞检测。适合速度比较高的物体。

如果不开，离散碰撞检测可能出现这种情况：

- 这一帧还在墙前
- 下一帧已经跑到墙后

这就是常说的穿模或穿透。

### `physxRigidBody:enableSpeculativeCCD`

这也是一类用于减少高速漏碰的方案，属于更偏“预估式”的处理思路。

如果你面对的是高速小物体、薄墙、快速抛射，通常需要在 `enableCCD` 和 `enableSpeculativeCCD` 之间按场景测试，而不是默认完全不管。

## 七、限制发散：速度、冲量、去穿透速度上限

下面这组参数常用于给仿真加“护栏”：

- `physxRigidBody:maxLinearVelocity`
- `physxRigidBody:maxAngularVelocity`
- `physxRigidBody:maxContactImpulse`
- `physxRigidBody:maxDepenetrationVelocity`

它们适合处理这些现象：

- 碰撞后被弹飞太夸张
- 穿透修正过猛
- 某一帧速度突然爆大
- 仿真出现数值发散

其中：

- `maxLinearVelocity` 限制最大线速度
- `maxAngularVelocity` 限制最大角速度
- `maxContactImpulse` 限制单次接触冲量
- `maxDepenetrationVelocity` 限制去穿透修正速度

如果你发现物体在碰撞后行为“不真实但很猛”，先看这组往往比盲目改质量或摩擦更有效。

## 八、求解精度：solver iterations

### `physxRigidBody:solverPositionIterationCount`

位置求解迭代次数。

### `physxRigidBody:solverVelocityIterationCount`

速度求解迭代次数。

一般来说，迭代次数更高，接触和约束会更稳，但计算也会更重。

所以它们更像是“用算力换稳定度”的参数。只有在接触堆叠、关节约束、碰撞稳定性确实不够时，才值得提高。

## 九、提速时最常看的：碰撞近似

### `physics:approximation`

它决定碰撞时拿什么形状来近似物体。

比如：

- `box`
- `convexHull`
- 以及更复杂的一些模式

对 cube 来说，`box` 往往就很自然。

对 cylinder，本地测试里 `DynamicCylinder` 默认也可能是：

```text
physics:approximation = none
```

如果目标是速度优先，不同近似方式通常可以粗略理解为从快到慢大致是：

1. `boundingSphere`
2. `boundingCube`
3. `convexHull`
4. `meshSimplification`
5. `none`
6. `convexDecomposition`
7. `sphereFill`
8. `sdf`

结论很简单：如果你只需要“够用的碰撞”，不要默认上最精细的方式。

## 十、一些偶尔会用到的高级项

### `physxCollision:torsionalPatchRadius`

这个不是普通滑动摩擦，而是接触后围绕接触法线拧转时的摩擦效果。

可以把它理解成“扭转摩擦接触补丁”的半径。

如果它和 `physxCollision:minTorsionalPatchRadius` 都是 0，通常就不会施加这种扭转摩擦；大于 0 时会有对应效果。

### `physxRigidBody:enableGyroscopicForces`

启用陀螺效应。

它对高速旋转物体更重要。开启后旋转行为会更真实，但数值行为也可能更复杂，所以不是所有普通物体都需要打开。

### 锁定自由度

- `physxRigidBody:lockedPosAxis`
- `physxRigidBody:lockedRotAxis`

这组参数很实用。

例如：

- 只允许物体在平面内移动，不允许 z 方向平移
- 不允许翻滚，只允许绕某一个轴旋转

如果你的任务本来就是二维运动、平面推箱子、桌面滑块，这组锁轴参数通常比“靠别的物理参数把它调得像二维”更干净。

## 十一、哪些参数通常不用频繁改

如果只是常规刚体调参，下面这些通常不是第一批要动的：

- `physics:centerOfMass`
- `physics:diagonalInertia`
- `physics:principalAxes`
- `physxRigidBody:cfmScale`
- `physxRigidBody:contactSlopCoefficient`
- `physxRigidBody:retainAccelerations`
- `physxRigidBody:solveContact`

这些参数往往更偏底层数值行为、惯性设定或特殊约束场景。除非你已经非常明确问题来源，否则不建议一开始就改。

## 十二、给自己一个实用调参顺序

如果你面对的是“方块乱滑、乱抖、偶尔穿、而且仿真还慢”，我建议按这个顺序：

1. 先检查 `physics:approximation`，别让碰撞近似过重。
2. 再看 `linearDamping` / `angularDamping`，让它别无限滑和转。
3. 再看 `sleepThreshold` / `stabilizationThreshold`，让它停稳后尽快休眠。
4. 如果有高速漏碰，再开 `enableCCD` 或测试 `enableSpeculativeCCD`。
5. 如果碰撞后数值过猛，再加上限：`maxLinearVelocity`、`maxAngularVelocity`、`maxContactImpulse`、`maxDepenetrationVelocity`。
6. 最后如果接触质量仍不够，再考虑提高 solver iteration。

这个顺序的核心是：先用最便宜、最直接的参数解决问题，再去碰更重的求解和更复杂的碰撞形状。

## 十三、DynamicCuboid 上常见的参数范围

如果是 Stage 里普通的 cube，要看它是怎么创建的。

`VisualCuboid` 只有显示和变换相关属性，比如：

- `size`
- `visibility`
- `xformOp:translate`
- `xformOp:scale`
- `material:binding`

而 `DynamicCuboid` 会在此基础上额外带上一整套物理属性，例如：

- `physics:mass`
- `physics:density`
- `physics:velocity`
- `physics:angularVelocity`
- `physics:approximation`
- `physics:startsAsleep`
- `physxCollision:contactOffset`
- `physxCollision:restOffset`
- `physxRigidBody:linearDamping`
- `physxRigidBody:angularDamping`
- `physxRigidBody:sleepThreshold`
- `physxRigidBody:solverPositionIterationCount`
- `physxRigidBody:solverVelocityIterationCount`

所以平时真正需要关心的，通常也就是本文前面总结出来的这些核心项，而不是看到几十个属性就全部一起调。

## 结论

在 Isaac Sim 里调物理参数时，最重要的不是把每个字段都搞得很细，而是先分清问题类型：

- 运动停不下来：看 damping
- 停稳后还在抖、还在算：看 sleep / stabilization
- 高速穿模：看 CCD
- 碰撞后发散：看各种上限
- 仿真太慢：先看 approximation，再看是否真的需要更高 solver iteration

把问题和参数一一对应起来，调参会快很多，也不容易陷入“什么都改了，但不知道到底是哪一项起作用”的状态。
