# Chrome插件开发学习项目 🚀

这是一个完整的Chrome插件开发学习项目，通过实际的「网页工具箱」插件来学习Chrome Extension的各个核心概念。

## 📚 项目特点

- ✅ **Manifest V3** - 使用最新的Chrome插件规范
- 🎯 **完整功能** - 包含popup、background、content script等所有组件
- 📖 **详细注释** - 每个文件都有丰富的中文注释
- 🛠️ **实用工具** - 网页信息查看、文本高亮、实用功能等
- 🎨 **现代UI** - 美观的渐变设计和动画效果

## 🏗️ 项目结构

```
chrome-extension-learning/
├── manifest.json          # 插件配置文件（必需）
├── background.js          # 后台服务脚本
├── content.js            # 内容脚本（注入到网页）
├── popup.html            # 弹出页面HTML
├── popup.js              # 弹出页面逻辑
├── icons/                # 图标文件夹
│   ├── icon16.png       # 16x16 图标
│   ├── icon32.png       # 32x32 图标
│   ├── icon48.png       # 48x48 图标
│   └── icon128.png      # 128x128 图标
├── docs/                 # 学习文档
├── examples/             # 示例代码
└── README.md            # 项目说明
```

## 🚀 快速开始

### 1. 安装插件

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目文件夹

### 2. 使用插件

- **固定侧边栏**：点击网页右侧的🛠️浮动按钮打开固定在右侧的工具栏
- **传统弹窗**：点击浏览器工具栏中的🎤图标打开传统popup工具箱
- **右键菜单**：在网页上右键可以使用快捷功能
- **键盘快捷键**：按ESC键可以关闭侧边栏

### 3. 主要特色

- ✨ **双模式界面**：支持传统popup模式和现代侧边栏模式
- 📌 **固定右侧**：侧边栏固定在网页右侧，不会被页面滚动影响
- 🎯 **实时数据**：自动收集并展示当前网页的详细信息
- 🛠️ **实用工具**：一键回到顶部、高亮链接、复制URL等功能

## 📖 学习路径

### 基础概念
1. [Chrome插件架构](#chrome插件架构)
2. [Manifest文件详解](#manifest文件)
3. [权限系统](#权限系统)

### 核心组件
4. [Background Script](#background-script)
5. [Content Script](#content-script)
6. [Popup页面](#popup页面)
7. [图标和UI](#图标和ui)

### 高级功能
8. [消息传递](#消息传递)
9. [存储API](#存储api)
10. [右键菜单](#右键菜单)
11. [通知系统](#通知系统)

## 🏗️ Chrome插件架构

Chrome插件基于**事件驱动**的架构，主要包含以下组件：

```
┌─────────────────┐    ┌─────────────────┐
│   Popup Page    │    │  Background     │
│   (popup.html)  │◄──►│  Script         │
│   用户界面       │    │  (background.js)│
└─────────────────┘    └─────────────────┘
         ▲                        ▲
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│  Content Script │    │   Chrome APIs   │
│  (content.js)   │    │   (storage,     │
│  注入网页        │    │   notifications)│
└─────────────────┘    └─────────────────┘
```

## 📋 Manifest文件

`manifest.json` 是插件的配置文件，定义了插件的基本信息、权限和组件：

```json
{
  "manifest_version": 3,        // 使用Manifest V3
  "name": "插件名称",
  "version": "1.0",
  "description": "插件描述",
  "permissions": [              // 权限声明
    "activeTab",               // 访问当前标签页
    "storage",                 // 使用存储API
    "contextMenus"             // 创建右键菜单
  ],
  "action": {                   // 工具栏按钮配置
    "default_popup": "popup.html"
  },
  "background": {               // 后台脚本
    "service_worker": "background.js"
  },
  "content_scripts": [          // 内容脚本
    {
      "matches": ["http://*/*", "https://*/*"],
      "js": ["content.js"]
    }
  ]
}
```

## 🔧 主要功能

### 网页信息查看
- 📄 页面标题、URL、域名、协议
- 📊 图片、链接、脚本数量统计
- 🔍 实时获取页面元素信息

### 实用工具
- ⬆️ 一键回到顶部
- 🔗 高亮所有链接
- 🖼️ 显示图片信息
- 📋 复制页面URL

### 右键菜单
- 📋 复制页面信息
- ✨ 高亮选中文本
- 🛠️ 快捷工具访问

## 🛠️ 开发技巧

### 调试方法
1. **Popup调试**：右键popup → 检查
2. **Background调试**：扩展程序页面 → 背景页面 → 检查
3. **Content Script调试**：网页 → F12 → Console

### 常用API
```javascript
// 获取当前标签页
chrome.tabs.query({active: true, currentWindow: true})

// 向Content Script发送消息
chrome.tabs.sendMessage(tabId, message)

// 存储数据
chrome.storage.sync.set({key: 'value'})

// 创建右键菜单
chrome.contextMenus.create({...})
```

## 📚 学习资源

- [Chrome Extension官方文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome API参考](https://developer.chrome.com/docs/extensions/reference/)

## 🤝 参与贡献

欢迎提交Issue和Pull Request来改进这个学习项目！

## 📄 许可证

MIT License - 自由使用和学习

---

**Happy Coding! 🎉**

通过这个项目，你将掌握Chrome插件开发的核心技能，能够创建属于自己的浏览器扩展程序。