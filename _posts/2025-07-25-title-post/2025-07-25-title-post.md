---
title: "Isaaclab: self defined lift cube using ur10 + kf140"
date: 2025-07-25
permalink: /posts//isaaclab_lift_cube
tags:
  - isaaclab
  - lift cube
  - ur10
  - kf140
  - solving problem
draft: true   
---
这篇博客记录我如何一步一步从reach position 到 lift cube, 以及在这个过程中我对RL的思考

最开始我把所有东西都写好之后发现模型不收敛，所有我就开始分步查看是什么地方出现了问题
---

reach position -> reach cube
======
我设置的是eelink到cube的距离L2,但是我发现reward曲线如下。而play的时候机械臂倾向于不动。
Figure1
我意识到这可能是夹爪触碰到我在reward最高点的pt 进行play,发现机械臂经历了一个
倾向于接近cube,到把cube会打飞，到不想再靠太近cube的过程，但是让我不理解的是为什么最后他会几乎不动。可能是因为joint vel and positon 的惩罚越来越高。


为了更直观的看结果，使用TensorBoard 和 glgame模式。
tensorboard允许我看各个reward变化来分析机械臂当前的情况，而glgame可以生成短视频，使我可以进行交叉验证

Reward Design
======
于是我增加了lift cube的奖励和cube在一定高度后和目标点距离的奖励。

最开始结果并没有变化，我意识到这是因为我把lift的奖励阈值设置的太高了，so 我调低了阈值


然后我发现，机械臂开始去尝试让他提高高度了，不过是使用的踢他的方式，所以我增加了cube距离目标点距离的惩罚
此外我还发现夹爪似乎对夹取的探索有点偏低，几乎不做夹取，于是我调整了scale。









