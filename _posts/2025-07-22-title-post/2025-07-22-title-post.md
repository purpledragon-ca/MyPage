---
title: "Isaaclab: How different 'name' works in xxx_env_cfg.py"
date: 2025-07-23
permalink: /posts//isaaclab_name_usage
tags:
  - isaaclab
  - ttl
---
This post explains the relationship between different name fields in xxx_env_cfg.py using the minimal amount of code to make the logic clear.
---

How different 'name' works
======
1. ReachSceneCfg : prim_path

```python
prim = "/World/name_A"         # Only one in this world
prim="{ENV_REGEX_NS}/name_A"   # Will create multiple parallel environments. 
                               # For example, if num_envs = 32, The paths will be: 
                               # [/env1/name_A, /env2/name_A, ..., /env32/name_A]
```

2. ReachSceneCfg: asset_name
```python
'''
When you define "name_B",
later when you want to access this asset's information, you need:
params={"asset_cfg": SceneEntityCfg("name_B")}

When you want to use this asset, you set:
asset_name="name_B"
'''
name_B = AssetBaseCfg()


# 1) Define ActionCfg
xxx_action: ActionTerm = mdp.JointPositionActionCfg(
    asset_name="name_B", 
    joint_names=xxx,
) 
       
#) Define CommandsCfg
xxx_pose = mdp.UniformPoseCommandCfg(
    asset_name="name_B",
    body_name=xxx,
)

# Define ObservationsCfg
xxx_pos = ObsTerm(
    func=xxx, 
    noise=xxx,
    params={"asset_cfg": SceneEntityCfg("name_B")}
)

# Define Rewards
xxx_rewards = RewTerm(
    func=xxx,
    weight=xxx,
    params={"asset_cfg": SceneEntityCfg("name_B"), 
            },
)
```

3. Name in other Cfgs
```python
'''
The principle is similar: 
when you define a name in a config,
you later use this name as a unique identifier.
'''
command_name_C = mdp.UniformPoseCommandCfg()
observe_name_D = ObsTerm(func=mdp.generated_commands, params={"command_name": "command_name_C"})
reward_name_E = RewTerm(func=mdp.xxx, weight=xxx, params={"command_name": "command_name_C"})
```

