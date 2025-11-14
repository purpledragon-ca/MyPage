---
title: Human legs tracking with 2D LiDAR
level: Mid
tags: [ROS, LiDAR, ML]
cover: assets/coverpage.png
order: 102
---
> Pedestrian tracking and following on a mobile robot using a 2D LiDAR and the ROS leg_tracker pipeline.


## Overview

This project is based on the ROS package  [leg_tracker](https://github.com/angusleigh/leg_tracker).  
It was my first serious ROS project: I started with basic tasks (recording bags, editing simple C++ nodes, checking ROS nodes/topics, and reading `CMakeLists.txt` and `package.xml` files), and after about one month I was able to work with my supervisor on deeper changes to the tracking pipeline.

My main contributions are:

- Adapting the leg tracking system to our own robot and LiDAR
- Modifying clustering parameters and feature set for denser point clouds
- Deploying the full pipeline (including Kalman filtering and inertial tracking) on our robot to achieve pedestrian following and obstacle avoidance

---

## Platform adaptation

- Added a LiDAR “masking” region to remove returns from the robot base and support pillars.  
- Tuned the cluster definition to match our sensor:
  - Adjusted max point-to-point distance
  - Adjusted minimum cluster size  
  These changes were necessary because our LiDAR produced much denser point clouds than in the original example.

---

## Feature and tracking pipeline

- Modified the feature combination used for leg classification.  
  The original code used only eight features; we adjusted this set to better separate human legs from noise and other obstacles with our data.
- Kept the original Kalman filter and inertial tracking logic from the package, using it to maintain stable tracks even with temporary occlusions or measurement noise.

With these modifications, we successfully ran leg tracking on our mobile robot and achieved reliable people detect and avoid crash test.
