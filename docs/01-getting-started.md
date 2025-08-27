# Chrome插件开发入门指南

## 什么是Chrome插件？

Chrome插件（Chrome Extension）是运行在Chrome浏览器中的小程序，可以增强浏览器功能、修改网页内容、提供实用工具等。

## 核心概念

### 1. Manifest文件
- **作用**：插件的配置文件，类似于应用程序的"身份证"
- **位置**：项目根目录的`manifest.json`
- **内容**：定义插件名称、版本、权限、文件路径等

### 2. 主要组件

#### Background Script（后台脚本）
- **生命周期**：插件运行期间持续存在
- **用途**：处理插件级别的事件，如安装、更新、消息处理
- **特点**：不能直接操作DOM，但可以使用大部分Chrome API

#### Content Script（内容脚本）
- **运行环境**：注入到网页中运行
- **用途**：读取和修改网页内容
- **特点**：可以访问DOM，但Chrome API有限制

#### Popup页面
- **触发方式**：点击工具栏图标时显示
- **用途**：提供用户界面和快捷操作
- **特点**：独立的HTML页面，可以使用Chrome API

## 开发环境设置

### 必需工具
1. **Chrome浏览器** - 开发和测试环境
2. **代码编辑器** - VS Code推荐
3. **基础技能** - HTML、CSS、JavaScript

### 开发者模式
1. 打开Chrome
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 现在可以加载本地插件进行测试

## 第一个插件：Hello World

### 1. 创建项目结构
```
hello-world-extension/
├── manifest.json
├── popup.html
└── popup.js
```

### 2. manifest.json
```json
{
  "manifest_version": 3,
  "name": "Hello World",
  "version": "1.0",
  "description": "我的第一个Chrome插件",
  "action": {
    "default_popup": "popup.html"
  }
}
```

### 3. popup.html
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { width: 200px; padding: 20px; }
        button { width: 100%; padding: 10px; }
    </style>
</head>
<body>
    <h3>Hello World!</h3>
    <button id="clickMe">点击我</button>
    <script src="popup.js"></script>
</body>
</html>
```

### 4. popup.js
```javascript
document.getElementById('clickMe').addEventListener('click', () => {
    alert('Hello from Chrome Extension!');
});
```

### 5. 加载和测试
1. 打开 `chrome://extensions/`
2. 点击"加载已解压的扩展程序"
3. 选择项目文件夹
4. 点击工具栏中的插件图标测试

## 常见问题

### Q: 为什么使用Manifest V3？
A: Manifest V3是Chrome插件的最新标准，提供了更好的安全性、性能和隐私保护。

### Q: 插件无法加载怎么办？
A: 检查manifest.json语法是否正确，确保所有引用的文件都存在。

### Q: 如何调试插件？
A: 
- Popup：右键popup页面 → 检查
- Background：扩展程序页面 → 服务工作进程 → 检查
- Content Script：在目标网页按F12

## 下一步

学完这个基础教程后，你可以继续学习：
- [Manifest文件详解](02-manifest-deep-dive.md)
- [Background Script开发](03-background-script.md)
- [Content Script开发](04-content-script.md)
- [消息传递机制](05-messaging.md)

---

**记住**：Chrome插件开发最重要的是理解各个组件的职责和它们之间的交互方式。多动手实践，遇到问题查阅官方文档！