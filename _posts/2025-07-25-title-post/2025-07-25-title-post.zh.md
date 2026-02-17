---
title: "Isaac Lab：用 UR10 + KF140 自定义 lift cube"
date: "2025-07-25"
permalink: "/posts//isaaclab_lift_cube"
tags:
draft: "true"
---

这篇博客记录我如何从 reach position 一步步做到 lift cube，以及在这个过程中对 RL 的一些想法。

最开始把所有东西都写好之后发现模型不收敛，于是开始分步排查问题出在哪里。
---

reach position → reach cube
======
我设的是末端到 cube 的距离 L2，但 reward 曲线如下；play 时机械臂几乎不动。
Figure1
我意识到可能是夹爪在 reward 最高点碰到 cube 后进行 play，发现机械臂经历了：先靠近 cube → 把 cube 打飞 → 之后不敢再靠太近的过程。不太理解的是为什么最后几乎不动，可能是 joint vel 和 position 的惩罚越来越大。

为了更直观地看结果，使用了 TensorBoard 和 glgame 模式。
TensorBoard 可以看各 reward 变化来分析机械臂当前状态，glgame 可以生成短视频，方便交叉验证。

Reward Design
======
于是增加了 lift cube 的奖励，以及 cube 达到一定高度后与目标点距离的奖励。

一开始结果没变化，意识到是 lift 的奖励阈值设得太高，于是调低了阈值。

之后机械臂开始尝试把 cube 抬高，但用的是“踢”的方式，所以又增加了 cube 与目标点距离的惩罚。
另外发现夹爪对“夹取”的探索偏少，几乎不夹，于是调整了 scale。
