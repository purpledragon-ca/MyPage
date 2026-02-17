---
title: "Isaac Lab：VSCode 开发环境"
date: "2025-07-19"
permalink: "/posts//isaaclab_vscode"
tags:
---

我发现 VSCode 无法识别 Isaac Sim 的库。查阅文档后得知，必须使用 Isaac Sim 的二进制安装才能获得完整的开发支持。本文记录我的安装步骤（Isaac Sim 4.50，Isaac Lab 2.0，Windows 11）。

---

下载 isaac-sim
======

下载链接：https://docs.isaacsim.omniverse.nvidia.com/4.5.0/installation/download.html
```bash
# 快速安装，参考：https://docs.isaacsim.omniverse.nvidia.com/4.5.0/installation/install_workstation.html
mkdir C:\isaacsim
cd %USERPROFILE%/Downloads
tar -xvzf "isaac-sim-standalone@4.5.0-rc.36+release.19112.f59b3005.gl.windows-x86_64.release.zip" -C C:\isaacsim
cd C:\isaacsim
post_install.bat
isaac-sim.selector.bat
```

安装 isaac-sim
======
为避免每次都要找 Isaac Sim 安装目录，建议在后续步骤中为终端设置以下环境变量：

```bash
# 参考：https://isaac-sim.github.io/IsaacLab/main/source/setup/installation/binaries_installation.html
:: Isaac Sim 根目录
set ISAACSIM_PATH="C:/isaacsim"
:: Isaac Sim 的 Python 可执行文件
set ISAACSIM_PYTHON_EXE="%ISAACSIM_PATH:"=%\\python.bat"
```

确认仿真器能正常运行：
```bash
%ISAACSIM_PATH%\isaac-sim.bat
```

确认能用独立 Python 脚本启动仿真器（会看到一些资产）：
```bash
:: 检查 python 路径是否正确
%ISAACSIM_PYTHON_EXE% -c "print('Isaac Sim configuration is now complete.')"
:: 检查能否从 python 启动 Isaac Sim
%ISAACSIM_PYTHON_EXE% %ISAACSIM_PATH%\standalone_examples\api\isaacsim.core.api\add_cubes.py
```

安装 Isaac Lab
======
```bash
## 下载
git clone https://github.com/isaac-sim/IsaacLab.git
cd IsaacLab
mklink /D _isaac_sim path_to_isaac_sim # 例如：mklink /D _isaac_sim C:/isaacsim

## 创建 Conda 环境
isaaclab.bat --conda my_env # 默认 env_isaaclab
conda activate env_isaaclab

## 安装
isaaclab.bat --install

## 验证安装
isaaclab.bat -p scripts\\tutorials\\00_sim\\create_empty.py

## 训练机器人！！首次启动可能很慢
isaaclab.bat -p scripts/reinforcement_learning/rsl_rl/train.py --task=Isaac-Ant-v0 --headless
isaaclab.bat -p scripts/reinforcement_learning/rsl_rl/train.py --task=Isaac-Velocity-Rough-Anymal-C-v0 --headless
```

配置 Isaac Lab（VSCode）
======
参考：https://isaac-sim.github.io/IsaacLab/main/source/overview/developer-guide/vs_code.html

1. 在 Visual Studio Code 中打开 Isaac Lab 目录

2. 运行 VSCode 任务：按 `Ctrl+Shift+P`，选择 “Tasks: Run Task”，在列表中选择并运行 `setup_python_env`。

3. 若执行正常，会生成以下文件：

  .vscode/launch.json：包含调试 Python 的启动配置。
  .vscode/settings.json：包含 Python 解释器与环境设置。

4. 在提供的配置中，默认 Python 解释器设为 Omniverse 提供的可执行文件，在 .vscode/settings.json 中指定：
```json
{
   "python.defaultInterpreterPath": "${workspaceFolder}/_isaac_sim/python.sh",
}
```
