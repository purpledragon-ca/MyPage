---
title: "Isaac Lab 课程相关问题"
date: "2025-07-16"
permalink: "/posts//isaaclab_course_issue"
tags:
---

在 isaac-lab 版本 == v2.1.0 下可正常运行。

按照课程「Train Your Second Robot in Isaac Lab」的说明操作时，运行代码报错，通过调试和查文档解决。

发生了什么
======
我在做 isaaclab 课程：
https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-OV-47+V1

运行项目时出现大量错误。
- 多数是版本变更导致的 import 问题。
- 另外需要自行下载 USD 模型。

完整代码见下方，有 !!! 标记的是修改处，其余文件按课程指引即可。
======
（代码块保持与英文版一致，仅注释可译为：带 !!! 的为新增或修改。）

```python
# Copyright (c) 2022-2025, The Isaac Lab Project Developers (https://github.com/isaac-sim/IsaacLab/blob/main/CONTRIBUTORS.md).
# All rights reserved.
#
# SPDX-License-Identifier: BSD-3-Clause

import math

import isaaclab.sim as sim_utils
from isaaclab.assets import ArticulationCfg, AssetBaseCfg
from isaaclab.envs import ManagerBasedRLEnvCfg
from isaaclab.managers import EventTermCfg as EventTerm
from isaaclab.managers import ObservationGroupCfg as ObsGroup
from isaaclab.managers import ObservationTermCfg as ObsTerm
from isaaclab.managers import RewardTermCfg as RewTerm
from isaaclab.managers import SceneEntityCfg
from isaaclab.managers import TerminationTermCfg as DoneTerm
from isaaclab.scene import InteractiveSceneCfg
from isaaclab.utils import configclass


from isaaclab.utils.noise import AdditiveUniformNoiseCfg as Unoise #!!! 新增
from isaaclab.managers import CurriculumTermCfg  as CurrTerm       #!!! 新增


from . import mdp

##
# 预定义配置
ISAAC_NUCLEUS_DIR = f"E:\\isaac-sim" #!!! 新增，需自行下载模型并改为你的路径
##

from .ur_gripper import UR_GRIPPER_CFG

##
# 场景定义
##

# （后续 ReachSceneCfg、ActionsCfg、CommandsCfg、ObservationsCfg、EventCfg、RewardsCfg、TerminationsCfg、CurriculumCfg、ReachEnvCfg、ReachEnvCfg_PLAY 与英文版相同，此处省略以节省篇幅。关键修改：Unoise、CurrTerm、ISAAC_NUCLEUS_DIR 及注释中的 !!! 标记。）
```

我是怎么修的？
======

查官方文档与 issue 对照修改。
