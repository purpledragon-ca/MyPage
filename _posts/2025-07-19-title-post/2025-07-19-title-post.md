---
title: "Isaaclab: VScode development"
date: 2025-07-19
permalink: /posts//isaaclab_vscode
tags:
  - isaaclab
  - vscode
  - ttl
---
I found that VSCode could not recognize the Isaac Sim libraries. After checking the documentation, I learned that you must use the binary installation of Isaac Sim for proper development support. This post documents my installation steps (Isaac Sim 4.50, IsaacLab 2.0, Windows 11).

---

Download isaac-sim
======

Download Link: https://docs.isaacsim.omniverse.nvidia.com/4.5.0/installation/download.html
```bash
#quick install, reference: https://docs.isaacsim.omniverse.nvidia.com/4.5.0/installation/install_workstation.html
mkdir C:\isaacsim
cd %USERPROFILE%/Downloads
tar -xvzf "isaac-sim-standalone@4.5.0-rc.36+release.19112.f59b3005.gl.windows-x86_64.release.zip" -C C:\isaacsim
cd C:\isaacsim
post_install.bat
isaac-sim.selector.bat
```

Install isaac-sim
======
To avoid the overhead of finding and locating the Isaac Sim installation directory every time, it is recommended exporting the following environment variables to your terminal for the remaining of the installation instructions:

```bash
# Reference: https://isaac-sim.github.io/IsaacLab/main/source/setup/installation/binaries_installation.html
:: Isaac Sim root directory
set ISAACSIM_PATH="C:/isaacsim"
:: Isaac Sim python executable
set ISAACSIM_PYTHON_EXE="%ISAACSIM_PATH:"=%\\python.bat"
```


Check that the simulator runs as expected:
```bash
%ISAACSIM_PATH%\isaac-sim.bat
```

Check that the simulator runs from a standalone python script, you will see some asset.
```bash
:: checks that python path is set correctly
%ISAACSIM_PYTHON_EXE% -c "print('Isaac Sim configuration is now complete.')"
:: checks that Isaac Sim can be launched from python
%ISAACSIM_PYTHON_EXE% %ISAACSIM_PATH%\standalone_examples\api\isaacsim.core.api\add_cubes.py
```

Install IsaacLab
======
```bash
## Download
git clone https://github.com/isaac-sim/IsaacLab.git
cd IsaacLab
mklink /D _isaac_sim path_to_isaac_sim #For example: mklink /D _isaac_sim C:/isaacsim

## Create_Conda_Env
isaaclab.bat --conda my_env #Default env_isaaclab
conda activate env_isaaclab

##Install
isaaclab.bat --install

## Verify installation
isaaclab.bat -p scripts\\tutorials\\00_sim\\create_empty.py

## Train robot!! It may take a long long time to start
isaaclab.bat -p scripts/reinforcement_learning/rsl_rl/train.py --task=Isaac-Ant-v0 --headless
isaaclab.bat -p scripts/reinforcement_learning/rsl_rl/train.py --task=Isaac-Velocity-Rough-Anymal-C-v0 --headless
```

Install IsaacLab
======
Reference: https://isaac-sim.github.io/IsaacLab/main/source/overview/developer-guide/vs_code.html

1. Open the IsaacLab directory on Visual Studio Code IDE

2. Run VSCode Tasks, by pressing 'Ctrl+Shift+P', selecting 'Tasks: Run Task' and running the 'setup_python_env' in the drop down menu.

3. If everything executes correctly, it should create the following files:

  .vscode/launch.json: Contains the launch configurations for debugging python code.

  .vscode/settings.json: Contains the settings for the python interpreter and the python environment.

4. In the provided configuration, we set the default python interpreter to use the python executable provided by Omniverse. This is specified in the .vscode/settings.json file:
```json
{
   "python.defaultInterpreterPath": "${workspaceFolder}/_isaac_sim/python.sh",
}
```