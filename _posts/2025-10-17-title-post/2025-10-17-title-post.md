---
title: "Tune Isaac Sim Joint Parameters Step-by-Step (Damping, Stiffness, Max force)"
date: 2025-10-17
permalink: /posts/2025/10/blog-post-2/
tags:
  - IsaacSim
  - IsaacLab
  - URDF import
  - Gain Tuner
---

Goal: make the **Observed Joint** follow the **Command Joint** as fast and smooth as a real robot — removing delay, ringing, and steady-state error.

## 0. Initial Situation

- Observed joint was **too slow**, never reached target, and had a **steady offset**.
- Initial parameters:  
  `Max Force = 10`, `Stiffness = 0.05`, `Damping = 0.012`, `Max Actuator Velocity = 60`，`damp ratio = 0.7`.
  <img src="assets/1.png" alt="Oringinal Setting" width="600"/>

## 1. Round 1
  Problem: Reach the joint limit, cannot reach lower target.
  Solution: Change command to [-50,50], increase stiffness.
  <img src="assets/2.png" alt="After change command range, and increase stiffness" width="600"/>

## 2. Round 2
  Problem: So damping, and have an offset
  Solution: increase damping, and double the force limit (Because of the friction)
  I also found that increasing stiffness or decrease the damping could reduce the offsite trend.
  <img src="assets/3.png" alt="After increase damping, and double the force limit" width="600"/>

## 3. Round 3
 Although there still have a small offset, it only occuered when I run in the Gain Tuner. It will not have offset if I tune in Property.
 (Seems Gain Tuning will cause the offset)
 <img src="assets/4.png" alt="Tune in Property" width="600"/>
