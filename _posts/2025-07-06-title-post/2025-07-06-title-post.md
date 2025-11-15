---
title: 'Batch Script: Why My Nested For Loop Couldn’t Use Updated Variables — and How I Fixed It'
date: 2025-07-06
permalink: /posts//file_backup
tags:
  - batch
  - problem solving
---

Recently, I ran into a tricky problem while writing a batch script to back up folders. I needed to loop through a list of directories, set a variable like `Backup_DIR` inside that loop, and then use it in a nested `for /r` to process files. But it just wouldn’t work — the inner `for /r` acted like the variable was empty!

Why did this happen?
======
In batch scripts, variables like `%VAR%` are replaced **when the script is read**, not when it runs. Even if I enable delayed variable expansion with `!VAR!`, the `for /r` start path still gets fixed early — it doesn’t see updated variables set in the same loop.

So if I set `Backup_DIR` inside the loop, `for /r !Backup_DIR!` would see it as empty.

How did I fix it?
======

I changed into the target folder with `pushd`, then used `for /r %%F in (*)` **without specifying a start path**. `for /r` then starts from the current folder automatically, and I avoided variable issues.

## Example solution with pushd (.bat)

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