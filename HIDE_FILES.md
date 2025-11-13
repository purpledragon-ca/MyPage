# 隐藏文件说明 / Hide Files Guide

## 已隐藏的文件 / Hidden Files

`update_to_github.py` 已添加到 `.gitignore`，不会被提交到GitHub。

## 如果文件已经被提交 / If Files Are Already Committed

如果 `update_to_github.py` 已经被提交到Git，需要从Git历史中移除（但保留本地文件）：

```bash
# 从Git中移除，但保留本地文件
git rm --cached update_to_github.py

# 提交这个更改
git commit -m "Remove update_to_github.py from repository"

# 推送到GitHub
git push
```

## 为什么保留构建脚本？/ Why Keep Build Scripts?

以下文件**必须保留**在仓库中，因为GitHub Actions需要它们：
- `build_projects_manifest.py` - GitHub Actions需要运行它
- `build_posts_manifest.py` - GitHub Actions需要运行它

这些是公开的构建脚本，不包含敏感信息。

## 完全隐藏所有Python文件（不推荐）/ Hide All Python Files (Not Recommended)

如果你想隐藏所有Python文件，可以：

1. 在 `.gitignore` 中添加：
   ```
   *.py
   ```

2. **但是**，这会导致GitHub Actions无法运行构建脚本！

3. 更好的方案：
   - 将构建脚本移到 `.github/scripts/` 目录
   - 或者使用预构建的manifest文件（失去自动构建优势）

## 推荐方案 / Recommended Solution

当前配置是最佳的：
- ✅ 本地部署脚本隐藏（`update_to_github.py`）
- ✅ 构建脚本公开（GitHub Actions需要）
- ✅ 自动构建和部署正常工作

