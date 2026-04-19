---
title: "我找到了 Isaac Sim 比 MoveIt 慢的原因"
date: "2026-03-31"
tags: ['ROS2', 'MoveIt', 'IsaacSim', '调试记录']
cover: "assets/cmd-vs-obs.png"
---

这篇记录的是我在 2026-03-31 发现的一个问题：机械臂的运动轨迹在 Isaac Sim 仿真里表现出来的结果，和现实中、以及 MoveIt 指令中的预期不一致。

## 最开始的现象

我首先注意到一个现象：`obs` 跟不上 `cmd` 的速度。

这里的 `cmd` 是 MoveIt 下发的关节目标位置，`obs` 是 Isaac Sim 里反馈出来的关节观测位置。直观看起来，MoveIt 的命令已经到了前面，但 Isaac Sim 里的机械臂还在后面追。

于是我先调大了 Isaac Sim 的最大关节速度。调大之后，`obs` 确实可以更接近 `cmd`。但是接下来我发现了一个很奇怪的现象：

当我把 **MoveIt cmd 的最大速度值** 和 **Isaac Sim 的最大关节速度** 设置成一致时，Isaac Sim 仍然跟不上 MoveIt 的 cmd。

如果两个最大速度设置一样，理论上 Isaac Sim 不应该还慢这么多。这个现象让我意识到，问题可能不只是关节速度上限，而是时间戳或时间流速不一致。

## 记录脚本

为了更清楚地看问题，我写了一个脚本，同时记录：

- MoveIt 发布的 `cmd`
- Isaac Sim 返回的 `obs position`
- 两边对应的时间戳

然后我把记录的数据在 Web 端可视化，把 `cmd` 和 `obs` 的轨迹画在同一张图里。

<img src="assets/cmd-vs-obs.png" alt="时间对齐前 cmd 和 obs 的对比" width="100%">

## 数据分析

分析记录结果后，我找到了在相同最大速度设置下 Isaac Sim 还是慢的原因：

**Isaac Sim 里面的时间流动速度和 MoveIt 不一样。**

我观察到的关系大概是：

```text
真实世界 1s = ROS 1s = MoveIt 1s ≈ Isaac Sim 0.55s
```

也就是说，现实世界过了 1 秒，ROS 和 MoveIt 也认为过了 1 秒，但 Isaac Sim 内部实际只推进了大约 0.55 秒。

MoveIt 只负责按时发布命令，它不会去管 Isaac Sim 里面到底过了多长时间。所以即使 MoveIt 的最大速度和 Isaac Sim 的最大关节速度数值一致，Isaac Sim 里的机械臂也会因为仿真时间推进更慢而表现得跟不上。

## 时间戳对齐后的结果

当我把 Isaac Sim 和 MoveIt 的时间戳对齐后，`obs` 和 `cmd` 几乎一致。

<img src="assets/after-aligned.jpeg" alt="时间对齐后 cmd 和 obs 几乎一致" width="100%">

这个结果说明，之前看到的 “Isaac Sim 比 MoveIt 慢” 主要不是最大速度参数本身的问题，而是 Isaac Sim 和 MoveIt 的时间基准不一致导致的。
