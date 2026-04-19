---
title: "Isaac Sim / MoveIt 指令与观测记录程序"
level: "mid"
tags: ['ROS2', 'MoveIt', 'IsaacSim', '数据可视化']
cover: "assets/coverpage.png"
order: "103"
---

> 我写了一个记录和可视化程序，用来同时记录 MoveIt 下发的关节指令和 Isaac Sim 返回的关节观测位置，帮助定位机械臂仿真轨迹和现实轨迹不一致的问题。

## 项目概述

这个项目的重点是我写的 **cmd / obs 记录程序**。在调试机械臂运动轨迹时，我发现单靠观察 Isaac Sim 里的运动很难判断问题来自控制参数、速度限制，还是仿真时间本身。于是我编写了一个脚本，同时记录：

- MoveIt 发布的关节目标位置 `cmd`
- Isaac Sim 中实际反馈的关节观测位置 `obs`
- 两路数据对应的时间戳

记录完成后，我把数据导出并在 Web 端可视化，把每个关节的 `cmd` 和 `obs` 叠加显示，从而更直接地分析跟踪误差、速度差异和时间偏移。

## 程序解决的问题

这个记录程序主要用于回答三个问题：

- `obs` 是否真的跟上了 `cmd` 的轨迹形状？
- 在相同最大速度设置下，Isaac Sim 的实际运动速度是否和 MoveIt 指令一致？
- Isaac Sim 内部时间、ROS 时间和 MoveIt 发布命令的时间是否一致？

## Web 可视化

记录数据后，Web 页面会把 `cmd` 和 `obs` 画在同一张图里，便于比较每个关节的响应。

<img src="assets/coverpage.png" alt="时间对齐前的 cmd 和 obs 对比" width="100%">

当我把 Isaac Sim 和 MoveIt 的时间戳对齐后，`obs` 和 `cmd` 几乎一致。

<img src="assets/after-aligned.jpeg" alt="时间对齐后的 cmd 和 obs 对比" width="100%">

## 结果

这个工具帮助我确认：问题不只是最大关节速度设置不够大，而是 Isaac Sim 和 MoveIt 的时间流动速度不一致。

```text
真实世界 1s = ROS 1s = MoveIt 1s ≈ Isaac Sim 0.55s
```

MoveIt 只会按照自己的时间发布命令，不会关心 Isaac Sim 内部实际过去了多长时间。因此在没有对齐时间戳时，即使 MoveIt 的最大速度和 Isaac Sim 的最大关节速度设置成一样，Isaac Sim 的 `obs` 仍然会表现得更慢。

详细分析见这篇记录：[2026-03-31 Isaac Sim / MoveIt 时间基准分析](/pages/post_page.html?id=2026-03-31-isaac-moveit-timebase&lang=zh)。
