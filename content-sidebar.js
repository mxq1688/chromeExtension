// content-sidebar.js - 注入侧边栏到网页的内容脚本

console.log('🛠️ [网页工具箱] Sidebar content script loaded on:', window.location.href);

// 防止重复注入
if (window.webToolboxSidebarInjected) {
    console.log('Sidebar already injected, skipping...');
} else {
    window.webToolboxSidebarInjected = true;
    initializeSidebar();
}

// 侧边栏状态
let sidebarVisible = false;
let sidebarContainer = null;
let sidebarToggle = null;

function initializeSidebar() {
    // 创建侧边栏HTML结构
    createSidebarElements();
    
    // 添加样式
    injectStyles();
    
    // 初始化事件监听器
    setupEventListeners();
    
    // 监听来自background script的消息
    chrome.runtime.onMessage.addListener(handleMessages);
    
    console.log('✅ Sidebar initialized successfully');
}

function createSidebarElements() {
    // 创建切换按钮
    sidebarToggle = document.createElement('button');
    sidebarToggle.id = 'webtoolbox-toggle';
    sidebarToggle.innerHTML = '🛠️';
    sidebarToggle.title = '网页工具箱';
    
    // 创建侧边栏容器
    sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'webtoolbox-sidebar';
    sidebarContainer.innerHTML = `
        <div class="webtoolbox-header">
            <button class="webtoolbox-close" id="webtoolbox-close">×</button>
            <h1>🛠️ 网页工具箱</h1>
        </div>
        
        <div class="webtoolbox-content">
            <div id="webtoolbox-loading" class="webtoolbox-loading">
                <div class="webtoolbox-spinner"></div>
                正在加载页面信息...
            </div>
            
            <div id="webtoolbox-page-info" class="webtoolbox-section" style="display: none;">
                <h3>📄 页面信息</h3>
                <div class="webtoolbox-item">
                    <span class="webtoolbox-label">标题：</span>
                    <span class="webtoolbox-value" id="webtoolbox-title">-</span>
                </div>
                <div class="webtoolbox-item">
                    <span class="webtoolbox-label">URL：</span>
                    <span class="webtoolbox-value" id="webtoolbox-url">-</span>
                </div>
                <div class="webtoolbox-item">
                    <span class="webtoolbox-label">域名：</span>
                    <span class="webtoolbox-value" id="webtoolbox-domain">-</span>
                </div>
                <div class="webtoolbox-item">
                    <span class="webtoolbox-label">协议：</span>
                    <span class="webtoolbox-value" id="webtoolbox-protocol">-</span>
                </div>
            </div>
            
            <div id="webtoolbox-page-stats" class="webtoolbox-section" style="display: none;">
                <h3>📊 页面统计</h3>
                <div class="webtoolbox-item">
                    <span class="webtoolbox-label">图片数量：</span>
                    <span class="webtoolbox-value" id="webtoolbox-images">-</span>
                </div>
                <div class="webtoolbox-item">
                    <span class="webtoolbox-label">链接数量：</span>
                    <span class="webtoolbox-value" id="webtoolbox-links">-</span>
                </div>
                <div class="webtoolbox-item">
                    <span class="webtoolbox-label">脚本数量：</span>
                    <span class="webtoolbox-value" id="webtoolbox-scripts">-</span>
                </div>
            </div>
            
            <div class="webtoolbox-section">
                <h3>🔧 实用工具</h3>
                <button class="webtoolbox-button" id="webtoolbox-scroll-top">回到顶部</button>
                <button class="webtoolbox-button" id="webtoolbox-highlight-links">高亮所有链接</button>
                <button class="webtoolbox-button" id="webtoolbox-show-images">显示图片信息</button>
                <button class="webtoolbox-button" id="webtoolbox-copy-url">复制当前URL</button>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(sidebarToggle);
    document.body.appendChild(sidebarContainer);
}

function injectStyles() {
    const style = document.createElement('style');
    style.id = 'webtoolbox-styles';
    style.textContent = `
        /* 切换按钮样式 */
        #webtoolbox-toggle {
            position: fixed !important;
            top: 50% !important;
            right: 15px !important;
            width: 45px !important;
            height: 45px !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            border: none !important;
            border-radius: 50% !important;
            color: white !important;
            font-size: 18px !important;
            cursor: pointer !important;
            z-index: 2147483647 !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
            transform: translateY(-50%) !important;
            transition: all 0.3s ease !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        
        #webtoolbox-toggle:hover {
            transform: translateY(-50%) scale(1.1) !important;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
        }
        
        /* 侧边栏容器样式 */
        #webtoolbox-sidebar {
            position: fixed !important;
            top: 0 !important;
            right: -380px !important;
            width: 360px !important;
            height: 100vh !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            z-index: 2147483646 !important;
            transition: right 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
            box-shadow: -5px 0 25px rgba(0, 0, 0, 0.3) !important;
            overflow-y: auto !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            color: white !important;
        }
        
        #webtoolbox-sidebar.webtoolbox-active {
            right: 0 !important;
        }
        
        #webtoolbox-toggle.webtoolbox-sidebar-open {
            right: 375px !important;
        }
        
        /* 头部样式 */
        .webtoolbox-header {
            background: rgba(255, 255, 255, 0.1) !important;
            padding: 20px !important;
            text-align: center !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
            position: relative !important;
        }
        
        .webtoolbox-header h1 {
            margin: 0 !important;
            font-size: 18px !important;
            font-weight: 600 !important;
            color: white !important;
        }
        
        .webtoolbox-close {
            position: absolute !important;
            top: 15px !important;
            right: 15px !important;
            background: none !important;
            border: none !important;
            color: white !important;
            font-size: 24px !important;
            cursor: pointer !important;
            width: 35px !important;
            height: 35px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: background 0.3s ease !important;
        }
        
        .webtoolbox-close:hover {
            background: rgba(255, 255, 255, 0.2) !important;
        }
        
        /* 内容区域样式 */
        .webtoolbox-content {
            padding: 20px !important;
        }
        
        .webtoolbox-section {
            background: rgba(255, 255, 255, 0.1) !important;
            border-radius: 10px !important;
            padding: 18px !important;
            margin-bottom: 18px !important;
            backdrop-filter: blur(10px) !important;
        }
        
        .webtoolbox-section h3 {
            margin: 0 0 15px 0 !important;
            font-size: 14px !important;
            color: #e0e0e0 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            font-weight: 600 !important;
        }
        
        .webtoolbox-item {
            margin: 12px 0 !important;
            font-size: 13px !important;
            line-height: 1.5 !important;
        }
        
        .webtoolbox-label {
            font-weight: 600 !important;
            color: #f0f0f0 !important;
        }
        
        .webtoolbox-value {
            color: #d0d0d0 !important;
            word-break: break-all !important;
        }
        
        .webtoolbox-button {
            width: 100% !important;
            padding: 12px !important;
            margin: 8px 0 !important;
            background: rgba(255, 255, 255, 0.2) !important;
            border: none !important;
            border-radius: 8px !important;
            color: white !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }
        
        .webtoolbox-button:hover {
            background: rgba(255, 255, 255, 0.3) !important;
            transform: translateY(-2px) !important;
        }
        
        .webtoolbox-button:active {
            transform: translateY(0) !important;
        }
        
        /* 加载动画 */
        .webtoolbox-loading {
            text-align: center !important;
            padding: 30px 20px !important;
            color: #d0d0d0 !important;
        }
        
        .webtoolbox-spinner {
            border: 3px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 50% !important;
            border-top: 3px solid white !important;
            width: 25px !important;
            height: 25px !important;
            animation: webtoolbox-spin 1s linear infinite !important;
            margin: 0 auto 15px !important;
        }
        
        @keyframes webtoolbox-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* 高亮链接样式 */
        .webtoolbox-highlighted-link {
            background-color: rgba(255, 255, 0, 0.3) !important;
            border: 2px solid #ffff00 !important;
            border-radius: 3px !important;
        }
    `;
    
    document.head.appendChild(style);
}

function setupEventListeners() {
    // 切换按钮事件
    sidebarToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
    });
    
    // 关闭按钮事件
    const closeBtn = document.getElementById('webtoolbox-close');
    closeBtn.addEventListener('click', hideSidebar);
    
    // 工具按钮事件
    document.getElementById('webtoolbox-scroll-top').addEventListener('click', scrollToTop);
    document.getElementById('webtoolbox-highlight-links').addEventListener('click', toggleHighlightLinks);
    document.getElementById('webtoolbox-show-images').addEventListener('click', showImageInfo);
    document.getElementById('webtoolbox-copy-url').addEventListener('click', copyCurrentUrl);
    
    // 点击外部关闭
    document.addEventListener('click', (e) => {
        if (sidebarVisible && 
            !sidebarContainer.contains(e.target) && 
            !sidebarToggle.contains(e.target)) {
            hideSidebar();
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebarVisible) {
            hideSidebar();
        }
    });
}

// 侧边栏控制函数
function toggleSidebar() {
    if (sidebarVisible) {
        hideSidebar();
    } else {
        showSidebar();
    }
}

function showSidebar() {
    sidebarContainer.classList.add('webtoolbox-active');
    sidebarToggle.classList.add('webtoolbox-sidebar-open');
    sidebarVisible = true;
    
    // 加载页面数据
    loadPageData();
}

function hideSidebar() {
    sidebarContainer.classList.remove('webtoolbox-active');
    sidebarToggle.classList.remove('webtoolbox-sidebar-open');
    sidebarVisible = false;
}

// 加载页面数据
function loadPageData() {
    const loading = document.getElementById('webtoolbox-loading');
    const pageInfo = document.getElementById('webtoolbox-page-info');
    const pageStats = document.getElementById('webtoolbox-page-stats');
    
    // 显示加载状态
    loading.style.display = 'block';
    pageInfo.style.display = 'none';
    pageStats.style.display = 'none';
    
    // 收集页面数据
    setTimeout(() => {
        const pageData = {
            title: document.title || '未知标题',
            url: window.location.href,
            domain: window.location.hostname,
            protocol: window.location.protocol.replace(':', ''),
            imageCount: document.querySelectorAll('img').length,
            linkCount: document.querySelectorAll('a').length,
            scriptCount: document.querySelectorAll('script').length
        };
        
        // 更新显示
        document.getElementById('webtoolbox-title').textContent = pageData.title;
        document.getElementById('webtoolbox-url').textContent = pageData.url;
        document.getElementById('webtoolbox-domain').textContent = pageData.domain;
        document.getElementById('webtoolbox-protocol').textContent = pageData.protocol;
        document.getElementById('webtoolbox-images').textContent = pageData.imageCount;
        document.getElementById('webtoolbox-links').textContent = pageData.linkCount;
        document.getElementById('webtoolbox-scripts').textContent = pageData.scriptCount;
        
        // 隐藏加载，显示内容
        loading.style.display = 'none';
        pageInfo.style.display = 'block';
        pageStats.style.display = 'block';
    }, 800);
}

// 工具函数
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    showNotification('已回到页面顶部');
}

let linksHighlighted = false;
function toggleHighlightLinks() {
    const links = document.querySelectorAll('a');
    const button = document.getElementById('webtoolbox-highlight-links');
    
    if (linksHighlighted) {
        // 移除高亮
        links.forEach(link => {
            link.classList.remove('webtoolbox-highlighted-link');
        });
        button.textContent = '高亮所有链接';
        showNotification('已取消链接高亮');
        linksHighlighted = false;
    } else {
        // 添加高亮
        links.forEach(link => {
            link.classList.add('webtoolbox-highlighted-link');
        });
        button.textContent = '取消链接高亮';
        showNotification(`已高亮 ${links.length} 个链接`);
        linksHighlighted = true;
    }
}

function showImageInfo() {
    const images = document.querySelectorAll('img');
    let info = `页面共有 ${images.length} 张图片:\n\n`;
    
    images.forEach((img, index) => {
        info += `${index + 1}. ${img.src || '无源地址'}\n`;
        if (img.naturalWidth && img.naturalHeight) {
            info += `   尺寸: ${img.naturalWidth}x${img.naturalHeight}\n`;
        }
        info += `   Alt: ${img.alt || '无描述'}\n\n`;
        
        if (index >= 9) {
            info += `... 还有 ${images.length - 10} 张图片`;
            return;
        }
    });
    
    alert(info);
}

function copyCurrentUrl() {
    const url = window.location.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('URL已复制到剪贴板');
        }).catch(() => {
            fallbackCopy(url);
        });
    } else {
        fallbackCopy(url);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('URL已复制到剪贴板');
    } catch (err) {
        showNotification('复制失败，请手动复制');
        console.error('复制失败:', err);
    }
    
    document.body.removeChild(textArea);
}

// 显示通知
function showNotification(message) {
    // 移除已存在的通知
    const existingNotification = document.querySelector('.webtoolbox-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'webtoolbox-notification';
    notification.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        background: rgba(0, 0, 0, 0.9) !important;
        color: white !important;
        padding: 15px 20px !important;
        border-radius: 8px !important;
        font-size: 14px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        z-index: 2147483647 !important;
        transform: translateX(100%) !important;
        transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        max-width: 300px !important;
        word-wrap: break-word !important;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// 处理来自background script的消息
function handleMessages(request, sender, sendResponse) {
    console.log('Sidebar received message:', request);
    
    switch (request.action) {
        case 'toggleSidebar':
            toggleSidebar();
            sendResponse({ success: true });
            break;
        case 'showSidebar':
            showSidebar();
            sendResponse({ success: true });
            break;
        case 'hideSidebar':
            hideSidebar();
            sendResponse({ success: true });
            break;
        default:
            sendResponse({ error: 'Unknown action' });
    }
}

// 导出到全局以供调试
window.webToolbox = {
    toggle: toggleSidebar,
    show: showSidebar,
    hide: hideSidebar,
    isVisible: () => sidebarVisible
};

console.log('🎉 [网页工具箱] 侧边栏初始化完成！点击右侧按钮打开工具箱。');