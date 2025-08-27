# Manifest文件深度解析

`manifest.json`是Chrome插件的核心配置文件，定义了插件的所有基本信息和行为。

## 基本结构

### 必需字段

```json
{
  "manifest_version": 3,        // 必需：Manifest版本
  "name": "插件名称",            // 必需：插件显示名称
  "version": "1.0",            // 必需：版本号
  "description": "插件描述"      // 推荐：简短描述
}
```

### 权限声明

权限系统是Chrome插件安全机制的核心：

```json
{
  "permissions": [
    "activeTab",        // 访问当前活动标签页
    "storage",          // 使用chrome.storage API
    "contextMenus",     // 创建右键菜单
    "notifications",    // 显示系统通知
    "alarms",          // 使用定时器
    "tabs",            // 访问标签页API
    "history",         // 访问浏览历史
    "bookmarks"        // 访问书签
  ],
  "host_permissions": [
    "https://*.example.com/*",  // 特定域名权限
    "<all_urls>"               // 所有网站权限（谨慎使用）
  ]
}
```

## 核心组件配置

### 1. Action（工具栏按钮）

```json
{
  "action": {
    "default_popup": "popup.html",    // 点击时显示的页面
    "default_title": "插件工具提示",   // 鼠标悬停提示
    "default_icon": {                // 工具栏图标
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  }
}
```

### 2. Background Script

**Manifest V3使用Service Worker**：

```json
{
  "background": {
    "service_worker": "background.js",
    "type": "module"  // 可选：使用ES6模块
  }
}
```

**Manifest V2（已废弃）**：
```json
{
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  }
}
```

### 3. Content Scripts

```json
{
  "content_scripts": [
    {
      "matches": [              // 匹配的网站
        "http://*/*",
        "https://*/*"
      ],
      "js": ["content.js"],    // 注入的JS文件
      "css": ["content.css"],  // 注入的CSS文件（可选）
      "run_at": "document_end", // 运行时机
      "all_frames": false      // 是否在所有框架中运行
    }
  ]
}
```

**run_at选项**：
- `"document_start"` - DOM开始构建时
- `"document_end"` - DOM构建完成时（默认）
- `"document_idle"` - 页面空闲时

### 4. 图标配置

```json
{
  "icons": {
    "16": "icons/icon16.png",    // 扩展程序页面
    "32": "icons/icon32.png",    // Windows计算机
    "48": "icons/icon48.png",    // 扩展程序管理页
    "128": "icons/icon128.png"   // 安装和Chrome网上应用店
  }
}
```

## 高级配置

### 1. Web Accessible Resources

允许网页访问插件资源：

```json
{
  "web_accessible_resources": [
    {
      "resources": ["images/*", "styles/*"],
      "matches": ["https://example.com/*"]
    }
  ]
}
```

### 2. Content Security Policy

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 3. 外部连接

```json
{
  "externally_connectable": {
    "matches": ["https://example.com/*"],
    "ids": ["other-extension-id"]
  }
}
```

### 4. 可选权限

```json
{
  "optional_permissions": [
    "downloads",
    "https://api.example.com/*"
  ]
}
```

## 本项目的Manifest分析

让我们分析一下本项目的`manifest.json`：

```json
{
  "manifest_version": 3,                    // ✅ 使用最新版本
  "name": "网页工具箱",                      // ✅ 清晰的名称
  "version": "1.0",                        // ✅ 版本控制
  "description": "一个实用的网页工具箱...",   // ✅ 详细描述
  
  "permissions": [                         // ✅ 最小权限原则
    "activeTab",      // 只访问当前标签页
    "storage",        // 保存用户设置
    "contextMenus",   // 右键菜单功能
    "notifications",  // 消息通知
    "alarms"          // 定时任务
  ],
  
  "action": {
    "default_popup": "popup.html",          // ✅ 用户界面
    "default_title": "网页工具箱",
    "default_icon": { /* ... */ }           // ✅ 多尺寸图标
  },
  
  "background": {
    "service_worker": "background.js"       // ✅ V3标准
  },
  
  "content_scripts": [{
    "matches": ["http://*/*", "https://*/*"], // ✅ 所有网站
    "js": ["content.js"],
    "run_at": "document_end"                // ✅ 合适的时机
  }]
}
```

## 最佳实践

### 1. 权限最小化
- 只申请必需的权限
- 使用`activeTab`而不是`tabs`权限
- 考虑使用可选权限

### 2. 图标规范
- 提供所有尺寸的图标
- 使用PNG格式，支持透明背景
- 确保在不同主题下都清晰可见

### 3. 版本管理
- 使用语义化版本号（如1.0.0）
- 每次更新递增版本号
- 在描述中说明主要功能

### 4. 安全考虑
- 严格的CSP策略
- 不使用`eval()`等危险函数
- 验证所有外部输入

## 常见错误

### 1. 语法错误
```json
// ❌ 错误：有注释和尾随逗号
{
  "name": "test", // 这是注释
  "version": "1.0",  // 尾随逗号
}

// ✅ 正确：纯JSON格式
{
  "name": "test",
  "version": "1.0"
}
```

### 2. 权限问题
```json
// ❌ 过度权限申请
"permissions": ["<all_urls>", "tabs", "history"]

// ✅ 最小权限原则
"permissions": ["activeTab", "storage"]
```

### 3. 文件路径错误
```json
// ❌ 文件不存在
"default_popup": "popup.htm"  // 应该是.html

// ✅ 确保文件存在
"default_popup": "popup.html"
```

## 调试技巧

1. **JSON验证**：使用在线JSON验证器检查语法
2. **权限测试**：逐步添加权限，测试是否必需
3. **错误日志**：查看chrome://extensions/页面的错误信息
4. **重新加载**：修改manifest后要重新加载插件

---

**下一步**：学习[Background Script开发](03-background-script.md)，了解插件的"大脑"如何工作。