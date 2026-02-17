---
title: "Isaac Lab：xxx_env_cfg.py 中不同 'name' 的用法"
date: "2025-07-23"
permalink: "/posts//isaaclab_name_usage"
tags:
---

本文用尽量少的代码说明 xxx_env_cfg.py 里各 name 字段之间的关系，把逻辑讲清楚。

不同 'name' 的用法
======
1. ReachSceneCfg : prim_path

```python
prim = "/World/name_A"         # 世界中仅此一个
prim="{ENV_REGEX_NS}/name_A"   # 会创建多个并行环境。
                               # 例如 num_envs = 32 时，路径为：
                               # [/env1/name_A, /env2/name_A, ..., /env32/name_A]
```

2. ReachSceneCfg: asset_name
```python
'''
当你定义 "name_B" 后，
之后要访问该资产信息时，需要：
params={"asset_cfg": SceneEntityCfg("name_B")}

要使用该资产时，设置：
asset_name="name_B"
'''
name_B = AssetBaseCfg()


# 1) 定义 ActionCfg
xxx_action: ActionTerm = mdp.JointPositionActionCfg(
    asset_name="name_B", 
    joint_names=xxx,
) 
       
# 2) 定义 CommandsCfg
xxx_pose = mdp.UniformPoseCommandCfg(
    asset_name="name_B",
    body_name=xxx,
)

# 定义 ObservationsCfg
xxx_pos = ObsTerm(
    func=xxx, 
    noise=xxx,
    params={"asset_cfg": SceneEntityCfg("name_B")}
)

# 定义 Rewards
xxx_rewards = RewTerm(
    func=xxx,
    weight=xxx,
    params={"asset_cfg": SceneEntityCfg("name_B"), 
            },
)
```

3. 其他 Cfg 中的 Name
```python
'''
原则类似：
在某个 config 里定义了名字，
之后就用这个名字作为唯一标识来引用。
'''
command_name_C = mdp.UniformPoseCommandCfg()
observe_name_D = ObsTerm(func=mdp.generated_commands, params={"command_name": "command_name_C"})
reward_name_E = RewTerm(func=mdp.xxx, weight=xxx, params={"command_name": "command_name_C"})
```
