---
title: Camera 2D LiDAR Joint Calibration
level: junior
tags: [CV, LiDAR, Calibration, ROS]
cover: assets/coverpage.png
order: 105
sop: assets/SOPCamaserCalibraTool.docx
# repo: https://github.com/yourname/camera-2d-lidar-calib
# demo: https://your-demo-site.example.com
# pdf:  https://arxiv.org/abs/xxxx.xxxxx
---

> Reproduced a GitHub camera–LiDAR calibration method, adapted it to a camera + 2D LiDAR setup, and documented it as an internal SOP.

## Overview
This project is based on an open-source **[CamLaserCalibraTool](https://github.com/MegviiRobot/CamLaserCalibraTool)**.
The goal is to obtain the extrinsic parameters (R, T) between the camera and a 2D LiDAR for downstream multi-sensor fusion.

- Sensors: onboard camera + 2D scanning LiDAR  
- Target: checkerboard calibration board  
- Output: LiDAR → Camera extrinsics (rotation R, translation T)

## My Contributions
- **Method reproduction**: Followed the original GitHub implementation and successfully reproduced the full pipeline on our in-house vehicle platform, from data collection to calibration and visualization.  
- **2D LiDAR adaptation**: Adjusted the procedure for a 2D LiDAR with single-line scanning and limited FOV, including calibration board placement strategy, valid-point filtering, and geometric constraints.  
- **End-to-end joint calibration**: Built a complete pipeline from camera intrinsic calibration → LiDAR data capture → extrinsic estimation → projection-based verification, achieving stable joint calibration between the camera and 2D LiDAR.  
- **Quality verification**: Projected 2D LiDAR scan points into the camera image and checked alignment between laser scan lines and scene edges / checkerboard contours, ensuring the calibration accuracy meets product requirements.  
- **Internal SOP authoring**: Consolidated the whole process into a company SOP, covering hardware setup, site layout, data collection steps, calibration parameter settings, and troubleshooting, so that test and production teams can run calibration consistently and efficiently.

