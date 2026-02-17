---
title: "基于 ROS2 的 AmazingHand 键盘控制"
level: "junior"
tags: ['ROS2']
cover: "assets/coverpage.png"
order: "100"
---

> ROS2 包，复现并暴露原有 `AmazingHand_Demo.py` 的手势，支持键盘控制。

## 演示
<video src="./assets/demo.mp4" controls muted loop style="max-width:100%"></video>

## amazing_hand_ros2

ROS2 包，复现并暴露原有 `AmazingHand_Demo.py` 的手势：

- `amazing_hand_node`：订阅 `amazing_hand/command` 并驱动硬件。
- `amazing_hand_keyboard`：从键盘发布指令，并监听 `amazing_hand/state`。

### 编译

```bash
cd ~/AmazingHand
colcon build --packages-select amazing_hand_ros2
source install/setup.bash
```

### 运行硬件节点

```bash
ros2 run amazing_hand_ros2 amazing_hand_node \
  --ros-args \
    -p serial_port:=/dev/ttyACM0 \
    -p baudrate:=1000000 \
    -p timeout:=0.5 \
    -p side:=1
```

### 键盘映射

| 按键 | 指令        | 说明       |
|-----|----------------|--------------------|
| `o` | `open`         | 张开手     |
| `c` | `close`        | 握拳       |
| `s` | `spread`       | 手指张开   |
| `l` | `clench`       | 握紧       |
| `i` | `index_point`  | 食指指向   |
| `n` | `nonono`       | 食指摇摆   |
| `p` | `pinch`        | 捏合       |
| `v` | `victory`      | 胜利/和平  |
| `k` | `perfect`     | 完美/OK    |
| `g` | `scissors`     | 剪刀       |
| `m` | `middle_finger`| 竖中指     |

在已 source 工作空间的终端中启动键盘节点：

```bash
ros2 run amazing_hand_ros2 amazing_hand_keyboard
```

按 `h` 查看帮助，`q` 退出。每个按键会向 `amazing_hand/command` 发布对应指令。
