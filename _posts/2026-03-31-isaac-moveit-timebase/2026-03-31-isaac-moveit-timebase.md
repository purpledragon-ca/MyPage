---
title: "Why Isaac Sim Looked Slower Than MoveIt"
date: "2026-03-31"
tags: ['ROS2', 'MoveIt', 'IsaacSim', 'Debugging']
cover: "assets/cmd-vs-obs.png"
---

While comparing a robot arm trajectory in simulation and the real world, I found that the motion in Isaac Sim did not match what MoveIt was commanding.

## Initial Observation

The first symptom was simple: the observed joint position in Isaac Sim could not keep up with the command position from MoveIt.

I first increased Isaac Sim's maximum joint velocity. After that, the observed trajectory could follow the command more closely. But then I found something strange: when I set MoveIt's maximum command velocity and Isaac Sim's maximum joint velocity to the same value, Isaac Sim still looked slower than the command.

That suggested the issue was not only a joint velocity limit.

## Recorder

To inspect the problem more directly, I wrote a script to record both streams:

- MoveIt command position
- Isaac Sim observed position
- timestamps for both sides

Then I visualized the data on the web so I could compare the command and observation curves.

<img src="assets/cmd-vs-obs.png" alt="Command and observation before timestamp alignment" width="100%">

## Finding

The recorded data showed the reason: Isaac Sim and MoveIt were not advancing through time at the same effective rate.

```text
real world 1s = ROS 1s = MoveIt 1s ~= Isaac Sim 0.55s
```

MoveIt publishes commands on schedule. It does not know how much time has actually passed inside Isaac Sim. So even when the maximum velocity values match numerically, the simulated robot can still look slower because Isaac Sim time is advancing more slowly.

## After Timestamp Alignment

After aligning the Isaac Sim timestamp with the MoveIt timestamp, the observed trajectory and command trajectory became almost identical.

<img src="assets/after-aligned.jpeg" alt="Command and observation after timestamp alignment" width="100%">

The result confirmed that the mismatch was mainly a timebase problem, not simply a velocity limit problem.
