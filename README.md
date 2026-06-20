# QR Code Workshop · 二维码全能工坊

<div align="center">

**纯前端 · 零上传 · 隐私安全**

一款在浏览器中本地完成所有处理的二维码工具集——生成、解析、WiFi 配置，全程不上传任何数据。

![Language](https://img.shields.io/badge/language-JavaScript-F7DF1E?logo=javascript)
![Build](https://img.shields.io/badge/build-Vite-646CFF?logo=vite)
![License](https://img.shields.io/badge/license-MIT-blue)
![Privacy](https://img.shields.io/badge/privacy-zero--upload-brightgreen)

</div>

---

## 功能特色

| 功能 | 说明 |
|------|------|
| **文本/链接二维码生成** | 输入任意内容，支持自定义尺寸、前景色、背景色，H 级纠错 |
| **Logo 合成** | 上传图片自动嵌入二维码中心，保障可扫描性 |
| **图片二维码解析** | 上传或拖拽含二维码的图片，本地解码展示内容 |
| **WiFi 配置二维码** | 按国际标准生成 `WIFI:S:<SSID>;T:<类型>;P:<密码>;;` 格式 |
| **自定义尺寸** | 预设 200/300/400/500px，支持 160–1000px 精细调节 |
| **放大预览** | 点击二维码打开大图预览，清晰查看细节 |
| **一键下载** | 生成后的二维码可直接下载为 PNG 图片 |
| **亮色/暗色模式** | 主题切换，偏好自动保存到本地 |
| **响应式布局** | PC 和移动端均可流畅使用 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 测试

```bash
# 运行单元测试
npm run test

# 持续监听模式
npm run test:watch

# E2E 冒烟测试（需先安装 Playwright Chromium）
npm run smoke:install
npm run dev   # 另起终端启动服务
npm run smoke
```

## 部署

```bash
# 构建并部署到 GitHub Pages
npm run build
npm run deploy
```

项目已配置 GitHub Actions 自动部署——推送 `main` 分支即可触发构建并发布到 Pages。

## 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Vite + Vanilla JS |
| 二维码生成 | [qrcode.js](https://www.npmjs.com/package/qrcode) |
| 二维码解析 | [jsQR](https://www.npmjs.com/package/jsqr) |
| 图片处理 | Canvas 2D API |
| 测试 | Vitest + Playwright |

## 隐私声明

本项目**不包含后端服务**。二维码生成、Logo 合成、图片读取和二维码解析均在用户浏览器本地完成，**不会上传任何文本、图片或 WiFi 信息**到任何服务器。

---

<div align="center">Made with ❤️ · 本地优先 · 隐私至上</div>
