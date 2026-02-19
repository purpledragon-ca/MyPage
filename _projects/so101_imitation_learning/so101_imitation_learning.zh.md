---
title: "SO101 模仿学习：托举方块到托盘"
level: "junior"
tags: ['so101', 'lerobot', 'imitation learning']
cover: "assets/coverpage.png"
order: "102"
---
> 使用 SO101 机械臂做模仿学习：先遥操作采集轨迹，再训练策略，使机械臂自主完成将方块托举到托盘上的任务。

## 概述

本项目按照 [LeRobot 真实机器人教程](https://huggingface.co/docs/lerobot/en/il_robots)，通过模仿学习让 SO101 机械臂完成 **托举方块到托盘** 的任务。

流程概览：

1. **遥操作** — 用 SO101 主臂（或键盘）演示任务并录制轨迹。
2. **录制数据集** — 用 `lerobot-record` 保存观测与动作并上传至 Hugging Face Hub。
3. **训练策略** — 用 `lerobot-train` 在录制数据上训练 ACT（或其他）策略。
4. **评估** — 用训练好的 checkpoint 做推理，让从臂自主复现任务。

目标是让机械臂稳定地将方块托举并放到托盘上，复现演示动作。

## 结果

在采集足够多样化的演示后，训练得到的策略可以模仿「托举方块到托盘」的行为，并在 SO101 从臂上自主运行。

<video src="assets/act_vla.mp4" controls width="100%" style="max-width: 100%; border-radius: var(--radius-sm); margin: 1em auto; display: block;"></video>
