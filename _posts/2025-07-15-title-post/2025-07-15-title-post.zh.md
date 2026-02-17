---
title: "Windows 下安装 Isaac Lab"
date: "2025-07-15"
permalink: "/posts//isaaclab_install_for_windows"
tags:
---

按官方文档安装 isaaclab 时遇到报错，通过查阅 GitHub issue 解决。

发生了什么
======
我按照 isaaclab 安装指南操作：
https://isaac-sim.github.io/IsaacLab/main/source/setup/installation/pip_installation.html#installing-isaac-lab

执行：
```bash
isaaclab.bat --install rl_games :: 或 "isaaclab.bat -i rl_games"
```

出现如下错误：
```bash
  File "E:\Anaconda\envs\env_isaaclab\lib\site-packages\pip\_vendor\packaging\requirements.py", line 38, in __init__
    raise InvalidRequirement(str(e)) from e
pip._vendor.packaging.requirements.InvalidRequirement: Expected matching RIGHT_BRACKET for LEFT_BRACKET, after extras
    placeholder[::]
               ~^
```

我是怎么修的？
======

参考 GitHub issue：
https://github.com/isaac-sim/IsaacLab/issues/2028

只需执行：
```bash
isaaclab.bat --install
```
问题即解决。
