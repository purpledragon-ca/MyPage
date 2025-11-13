---
title: Delivery Robot AprilTag IR Localization
level: Mid
tags: [Robotics, AprilTag, Infrared, Localization]
cover: assets/coverpage.png
order: 25
# repo: https://github.com/yourname/apriltag-ir-localization
# demo: https://your-demo-site.example.com
# pdf:  /assets/apriltag-accuracy-report.pdf
---

> Pose accuracy test of a restaurant delivery robot based on AprilTag, with an **infrared-enhanced AprilTag perception stack** for robust localization under real-world lighting and clutter.

## Overview

This project evaluates the pose accuracy of a delivery robot that localizes using AprilTag-based visual markers in a restaurant-like environment.

A key contribution of this robot is an **active infrared AprilTag sensing pipeline**:

- **Infrared emitter / projector**
- **Retro-reflective AprilTag stickers**
- **Infrared camera**
- **Polarizing filter**

By combining an IR light source, retro-reflective tags, and an IR camera with a polarizer, the system:

- Boosts AprilTag contrast against the background
- Suppresses specular highlights and ambient lighting interference
- Reduces the impact of people, screens, and other visual clutter on tag detection

## System Setup

- **Environment:** Factory 3F, laid out to mimic a restaurant (tables, chairs, walls, doors, trash bins)
- **Navigation targets:** 8 waypoints, robot moves in order 1 → 8
- **Tag placement:** Each navigation point is under an AprilTag on the wall
- **Pose sources:**
  - Target pose: configured via UI
  - Robot pose at each waypoint
- **Error metrics:**
  - **Mean error:** mean of absolute errors
  - **Max error:** (max − min) / 2 for each dimension

Two lighting conditions are tested:

1. **Lights OFF** – robot relies on its own IR illumination only  
2. **Lights ON** – ambient lighting enabled (more realistic restaurant condition)

> Note: The IR–retro-reflective–camera–polarizer design is meant to keep AprilTag detection stable in both cases.



## Test 1: Navigation Accuracy without Lighting

### Test Procedure

In the **no-light** environment, with the waypoint located below the QR code, the navigation accuracy test was carried out as follows:

- The robot was commanded to navigate sequentially to **8 waypoints**.
- When the robot arrived at each waypoint, its pose was recorded, giving **8 pose samples per run**.
- This procedure was repeated **10 times**, so that each waypoint accumulated **10 pose samples**.
- The recorded poses were compared with the target waypoint poses to compute the **mean error** and **maximum error** in position (**x, y in cm**) and **yaw (°)**.

### Results (Mean Error, 10 Runs)

| Point | x_mean (cm) | y_mean (cm) | yaw_mean (°) |
|-------|-------------|-------------|--------------|
| 1     | 4.68        | 2.27        | 1.20         |
| 2     | 5.69        | 5.72        | 1.74         |
| 3     | 3.41        | 2.51        | 1.56         |
| 4     | 6.15        | 6.28        | 1.87         |
| 5     | 4.21        | 4.60        | 0.52         |
| 6     | 3.14        | 2.86        | 1.40         |
| 7     | 4.55        | 3.49        | 2.06         |
| 8     | 7.91        | 7.67        | 2.03         |

### Results (Maximum Error, 10 Runs)

| Point | x_max (cm) | y_max (cm) | yaw_max (°) |
|-------|------------|------------|-------------|
| 1     | 8.85       | 8.96       | 2.53        |
| 2     | 5.95       | 13.61      | 2.57        |
| 3     | 8.40       | 3.82       | 3.67        |
| 4     | 11.24      | 5.66       | 3.73        |
| 5     | 11.96      | 7.55       | 1.04        |
| 6     | 3.87       | 9.05       | 2.71        |
| 7     | 6.06       | 4.55       | 3.02        |
| 8     | 6.44       | 6.57       | 3.30        |

---

## Test 2: Navigation Accuracy with Lighting

### Test Procedure

In the **lights-on** environment, with the waypoint located below the QR code, the navigation accuracy test was carried out as follows:

- Based on Test 1, the **ambient light was turned on**.
- The robot was commanded to navigate sequentially to **the same 8 waypoints**.
- When the robot arrived at each waypoint, its pose was recorded, giving **8 pose samples per run**.
- This procedure was repeated **10 times**, so that each waypoint accumulated **10 pose samples**.
- The recorded poses were compared with the target waypoint poses to compute the **mean error** and **maximum error** in position (**x, y in cm**) and **yaw (°)**.

### Results (Mean Error, 10 Runs)

| Point | x_mean (cm) | y_mean (cm) | yaw_mean (°) |
|-------|-------------|-------------|--------------|
| 1     | 2.71        | 3.17        | 1.26         |
| 2     | 4.14        | 3.92        | 1.02         |
| 3     | 3.16        | 1.36        | 0.92         |
| 4     | 5.29        | 7.40        | 1.69         |
| 5     | 1.99        | 3.79        | 1.74         |
| 6     | 3.41        | 1.78        | 2.65         |
| 7     | 3.92        | 3.79        | 1.80         |
| 8     | 5.43        | 6.45        | 1.19         |

### Results (Maximum Error, 10 Runs)

| Point | x_max (cm) | y_max (cm) | yaw_max (°) |
|-------|------------|------------|-------------|
| 1     | 4.82       | 6.69       | 2.45        |
| 2     | 6.33       | 7.06       | 1.83        |
| 3     | 4.99       | 3.90       | 2.21        |
| 4     | 9.54       | 6.53       | 2.90        |
| 5     | 4.48       | 6.55       | 3.14        |
| 6     | 7.14       | 2.73       | 4.67        |
| 7     | 6.83       | 2.87       | 2.02        |
| 8     | 5.90       | 9.13       | 3.12        |



## Findings

From comparing **lights OFF vs. lights ON** and different waypoint configurations, we observe:

- **Ambient light helps accuracy**  
  - Errors with lights ON are consistently smaller than with lights OFF.  
  - Likely because the robot’s built-in IR light was too strong alone; ambient light partially cancels harsh IR reflections.

- **Obstacles near the waypoint hurt accuracy**  
  - Waypoints with nearby obstacles show larger errors than relatively open waypoints.

- **Obstacle avoidance during motion has little impact on final accuracy**  
  - A route segment with obstacles (requiring avoidance) does **not** significantly degrade the final pose accuracy compared to a clear segment.

- **Tag mounting height matters**  
  - A tag at 2.7 m yields slightly better accuracy than one at 3.4 m, indicating that **tag height affects pose estimation quality**.

- **Too many visible tags can be harmful**  
  - At one waypoint, the robot can see four tags at once, but pose error is relatively large, suggesting that **excessive visible tags may not improve—and can even degrade—accuracy**.
