---
title: SO101 Imitation Learning — Lift Cube to Plate
level: junior
tags: [so101, lerobot, il]
cover: assets/coverpage.png
order: 107
---
> Use the SO101 robot arm for imitation learning: teleoperate to collect trajectories, then train a policy so the arm autonomously lifts a cube and places it on a plate.

## Overview

This project follows the [LeRobot tutorial on real-world robots](https://huggingface.co/docs/lerobot/en/il_robots) to train an SO101 arm to perform **lift cube to plate** via imitation learning.

Workflow:

1. **Teleoperate** — Use the SO101 leader arm (or keyboard) to demonstrate the task and record trajectories.
2. **Record dataset** — Save observations and actions with `lerobot-record` and upload to the Hugging Face Hub.
3. **Train policy** — Train an ACT (or other) policy with `lerobot-train` on the recorded data.
4. **Evaluate** — Run inference with the trained checkpoint so the follower arm repeats the task autonomously.

The goal is to have the robot arm reliably lift a cube and place it on a plate, replicating the demonstrated motions.

## Result

With enough diverse demonstrations, the trained policy can imitate the lift-cube-to-plate behavior and run autonomously on the SO101 follower arm.

<video src="assets/act_vla.mp4" controls width="100%" style="max-width: 100%; border-radius: var(--radius-sm); margin: 1em auto; display: block;"></video>
