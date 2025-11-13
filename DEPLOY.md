# 部署指南 / Deployment Guide

## 快速使用 / Quick Usage

### 上传到GitHub / Push to GitHub

只需要运行一条命令：

```bash
python update_to_github.py -c "commit message"
```

例如：
```bash
python update_to_github.py -c "Add new project"
python update_to_github.py -c "Update posts and fix bugs"
```

### 脚本会自动执行 / Script will automatically:

1. ✅ 运行 `build_projects_manifest.py` 构建项目清单
2. ✅ 运行 `build_posts_manifest.py` 构建文章清单
3. ✅ 使用 `git add -A` 暂存所有更改
4. ✅ 使用你提供的消息提交更改
5. ✅ 推送到GitHub

### GitHub Actions自动部署 / Automatic Deployment

推送后，GitHub Actions会自动：
- 🔄 重新构建清单文件
- 🚀 部署到GitHub Pages
- 🌐 更新你的网站

## 首次设置 / First Time Setup

### 1. 启用GitHub Pages / Enable GitHub Pages

1. 进入仓库设置：`Settings` → `Pages`
2. 设置Source为：`GitHub Actions`
3. 保存设置

### 2. 配置Git（如果还没配置）/ Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. 设置远程仓库（如果还没设置）/ Set Remote Repository

```bash
git remote add origin https://github.com/yourusername/your-repo.git
```

## 故障排除 / Troubleshooting

### 问题：脚本运行失败 / Script fails

**检查：**
- Python是否已安装：`python --version`
- Git是否已安装：`git --version`
- 是否在正确的目录中运行脚本

### 问题：GitHub Actions部署失败 / GitHub Actions fails

**检查：**
1. 仓库设置中是否启用了GitHub Pages
2. Pages的Source是否设置为"GitHub Actions"
3. 查看Actions标签页中的错误日志

### 问题：没有更改被提交 / No changes committed

这是正常的！如果所有文件都是最新的，git会提示"nothing to commit"。

## 工作流程 / Workflow

```
本地修改文件
    ↓
运行: python update_to_github.py -c "message"
    ↓
自动构建清单
    ↓
Git提交并推送
    ↓
GitHub Actions触发
    ↓
自动部署到GitHub Pages
    ↓
网站更新完成！
```

