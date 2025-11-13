---
title: MNIST-CNN
level: junior
tags: [Python, CV, CNN]
cover: /assets/p1-cover.svg
order: 14
# repo: https://github.com/yourname/mnist-cnn
# demo: https://your-demo-site.example.com
# pdf:  https://arxiv.org/abs/1234.56789
---

> Baseline CNN for handwritten digits with training/eval scripts, metrics, and a confusion matrix.

## Overview
This project implements a compact CNN trained on MNIST. It reaches ~99% test accuracy in a few epochs.

- Optimizer: Adam
- Loss: CrossEntropy
- Framework: PyTorch

## Results
![Confusion Matrix](./assets/minist-cm.png)

```python
# infer.py
import torch
from model import Net
m = Net().eval().to("cuda")
x = torch.rand(1,1,28,28, device="cuda")
with torch.no_grad():
    logits = m(x)
print(logits.argmax(dim=1))
