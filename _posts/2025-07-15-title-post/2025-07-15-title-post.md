---
title: 'Isaaclab install for Windows'
date: 2025-07-15
permalink: /posts//isaaclab_install_for_windows
tags:
  - isaaclab
  - ttl
---

Following the instruction of install isaaclab, but got an error, fixed it by looking github issue.

What happened
======
I'm following the isaaclab install guide:
https://isaac-sim.github.io/IsaacLab/main/source/setup/installation/pip_installation.html#installing-isaac-lab

And when I run 
```bash
isaaclab.bat --install rl_games :: or "isaaclab.bat -i rl_games"
```

I got an error shows that:
```bash
  File "E:\Anaconda\envs\env_isaaclab\lib\site-packages\pip\_vendor\packaging\requirements.py", line 38, in __init__
    raise InvalidRequirement(str(e)) from e
pip._vendor.packaging.requirements.InvalidRequirement: Expected matching RIGHT_BRACKET for LEFT_BRACKET, after extras
    placeholder[::]
               ~^
```

How did I fix it?
======

By looking the github issue:
https://github.com/isaac-sim/IsaacLab/issues/2028

I found that we only need to run:
```bash
isaaclab.bat --install
```
And problem solved