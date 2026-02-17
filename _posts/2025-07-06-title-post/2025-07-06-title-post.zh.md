---
title: "批处理脚本：嵌套 For 循环为什么用不到更新后的变量，以及如何修复"
date: "2025-07-06"
permalink: "/posts//file_backup"
tags:
---

最近在写备份文件夹的批处理脚本时遇到一个棘手问题：需要先遍历一组目录，在循环里设置像 `Backup_DIR` 这样的变量，再在嵌套的 `for /r` 里用这个变量处理文件。结果内层 `for /r` 就像变量是空的一样，根本不生效。

为什么会这样？
======
在批处理脚本里，像 `%VAR%` 这样的变量是在 **脚本被解析时** 就被替换掉的，而不是在运行时。即使用 `!VAR!` 开启了延迟变量扩展，`for /r` 的起始路径仍然会在一开始就被固定下来，看不到同一循环里后面才更新的变量。

所以如果在循环里设置 `Backup_DIR`，那么 `for /r !Backup_DIR!` 会认为它是空的。

我是怎么修的？
======

用 `pushd` 先进入目标文件夹，然后使用 **不指定起始路径** 的 `for /r %%F in (*)`。这样 `for /r` 会从当前目录自动开始，就绕开了变量问题。

## 使用 pushd 的示例解法 (.bat)

```batch
@echo off
setlocal enabledelayedexpansion

set DIRS="C:\Folder1" "C:\Folder2"

for %%D in (%DIRS%) do (
    set "Backup_DIR=%%~D"
    pushd "!Backup_DIR!"
    for /r %%F in (*) do (
        echo Found file: %%F
    )
    popd
)
```
