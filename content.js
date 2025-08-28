// content.js - 优化版内容脚本

console.log('🛠️ [网页工具箱] Content script loading on:', window.location.href);

// 防止重复注入
if (window.webToolboxContentScript) {
    console.log('⚠️ Content script already exists, skipping...');
} else {
    window.webToolboxContentScript = {
        version: '2.0',
        initialized: false,
        state: {
            linksHighlighted: false,
            highlightStyle: null
        }
    };
    
    // 初始化内容脚本
    initializeContentScript();
}

function initializeContentScript() {
    console.log('🚀 Initializing content script...');
    
    // 创建高亮样式
    createHighlightStyle();
    
    // 设置消息监听器
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // 标记为已初始化
    window.webToolboxContentScript.initialized = true;
    
    console.log('✅ Content script initialized successfully');
}

// 创建高亮CSS样式
function createHighlightStyle() {
    const styleId = 'webtoolbox-highlight-style';
    
    // 移除旧样式（如果存在）
    const oldStyle = document.getElementById(styleId);
    if (oldStyle) {
        oldStyle.remove();
    }
    
    // 创建新样式
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .webtoolbox-highlighted-link {
            background-color: rgba(255, 255, 0, 0.3) !important;
            border: 2px solid #ffdd00 !important;
            box-shadow: 0 0 8px rgba(255, 221, 0, 0.6) !important;
            border-radius: 3px !important;
            transition: all 0.2s ease !important;
        }
        
        .webtoolbox-highlighted-link:hover {
            background-color: rgba(255, 255, 0, 0.5) !important;
            box-shadow: 0 0 12px rgba(255, 221, 0, 0.8) !important;
        }
    `;
    
    document.head.appendChild(style);
    window.webToolboxContentScript.state.highlightStyle = style;
}

// 消息处理器
function handleMessage(request, sender, sendResponse) {
    console.log('📨 Content script received message:', request.action);
    
    try {
        let result;
        
        switch (request.action) {
            case 'ping':
                result = handlePing();
                break;
                
            case 'getPageStats':
                result = getPageStatistics();
                break;
                
            case 'scrollToTop':
                result = scrollToTop();
                break;
                
            case 'highlightLinks':
                result = toggleLinkHighlight();
                break;
                
            case 'getImageInfo':
                result = getImageInformation();
                break;
                
            case 'showSidebar':
                result = toggleSidebar();
                break;
                
            default:
                console.warn('⚠️ Unknown action:', request.action);
                result = { error: `未知操作: ${request.action}` };
        }
        
        console.log('📤 Sending response:', result);
        sendResponse(result);
        
    } catch (error) {
        console.error('❌ Message handling error:', error);
        sendResponse({ error: error.message });
    }
    
    return true; // 保持消息通道开放
}

// Ping处理
function handlePing() {
    return {
        status: 'pong',
        timestamp: Date.now(),
        url: window.location.href,
        title: document.title
    };
}

// 获取页面统计信息
function getPageStatistics() {
    try {
        console.log('📊 Gathering page statistics...');
        
        const stats = {
            images: document.querySelectorAll('img').length,
            links: document.querySelectorAll('a[href]').length,
            scripts: document.querySelectorAll('script').length,
            // 额外统计信息
            forms: document.querySelectorAll('form').length,
            inputs: document.querySelectorAll('input').length,
            buttons: document.querySelectorAll('button').length
        };
        
        console.log('✅ Statistics gathered:', stats);
        return stats;
        
    } catch (error) {
        console.error('❌ Error gathering statistics:', error);
        return { error: error.message };
    }
}

// 滚动到页面顶部
function scrollToTop() {
    try {
        console.log('⬆️ Scrolling to top...');
        
        // 使用现代API，带备用方案
        if ('scrollTo' in window) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        } else {
            // 备用方案
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }
        
        console.log('✅ Scrolled to top successfully');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Scroll to top error:', error);
        return { error: error.message };
    }
}

// 切换链接高亮
function toggleLinkHighlight() {
    try {
        const state = window.webToolboxContentScript.state;
        const links = document.querySelectorAll('a[href]');
        
        console.log(`🔗 Toggling highlight for ${links.length} links...`);
        
        if (state.linksHighlighted) {
            // 移除高亮
            links.forEach(link => {
                link.classList.remove('webtoolbox-highlighted-link');
            });
            
            state.linksHighlighted = false;
            console.log('✅ Link highlight removed');
            
            return {
                success: true,
                action: 'removed',
                count: links.length
            };
            
        } else {
            // 添加高亮
            links.forEach(link => {
                link.classList.add('webtoolbox-highlighted-link');
            });
            
            state.linksHighlighted = true;
            console.log('✅ Links highlighted');
            
            return {
                success: true,
                action: 'added',
                count: links.length
            };
        }
        
    } catch (error) {
        console.error('❌ Link highlight error:', error);
        return { error: error.message };
    }
}

// 获取图片信息
function getImageInformation() {
    try {
        console.log('🖼️ Gathering image information...');
        
        const images = document.querySelectorAll('img');
        const imageInfo = [];
        
        // 限制处理的图片数量以避免性能问题
        const maxImages = 20;
        const processCount = Math.min(images.length, maxImages);
        
        for (let i = 0; i < processCount; i++) {
            const img = images[i];
            
            // 安全地获取图片信息
            const info = {
                src: img.src || '',
                alt: img.alt || '',
                width: img.naturalWidth || img.width || 0,
                height: img.naturalHeight || img.height || 0,
                loading: img.loading || 'eager',
                complete: img.complete || false
            };
            
            // 只添加有效的图片信息
            if (info.src) {
                imageInfo.push(info);
            }
        }
        
        console.log(`✅ Found ${imageInfo.length} valid images out of ${images.length} total`);
        
        return {
            images: imageInfo,
            total: images.length,
            processed: processCount
        };
        
    } catch (error) {
        console.error('❌ Error gathering image information:', error);
        return { error: error.message };
    }
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    console.log('🧹 Cleaning up content script...');
    
    // 移除高亮样式
    const style = window.webToolboxContentScript?.state?.highlightStyle;
    if (style && style.parentNode) {
        style.remove();
    }
    
    // 移除所有高亮类
    const highlightedElements = document.querySelectorAll('.webtoolbox-highlighted-link');
    highlightedElements.forEach(el => {
        el.classList.remove('webtoolbox-highlighted-link');
    });
});

// 错误处理
window.addEventListener('error', (event) => {
    console.error('🚨 Content script error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Content script unhandled rejection:', event.reason);
});

// 侧边栏功能
function toggleSidebar() {
    try {
        const sidebarId = 'webtoolbox-sidebar';
        let sidebar = document.getElementById(sidebarId);
        
        if (sidebar) {
            // 如果侧边栏已存在，切换显示/隐藏
            if (sidebar.style.display === 'none') {
                sidebar.style.display = 'block';
                console.log('✅ Sidebar shown');
                return { success: true, action: 'shown' };
            } else {
                sidebar.style.display = 'none';
                console.log('✅ Sidebar hidden');
                return { success: true, action: 'hidden' };
            }
        } else {
            // 创建新的侧边栏
            sidebar = createSidebar();
            document.body.appendChild(sidebar);
            console.log('✅ Sidebar created and shown');
            return { success: true, action: 'created' };
        }
        
    } catch (error) {
        console.error('❌ Sidebar toggle error:', error);
        return { error: error.message };
    }
}

function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'webtoolbox-sidebar';
    sidebar.innerHTML = `
        <div class="webtoolbox-sidebar-header">
            <h3>🛠️ 网页工具箱</h3>
            <button class="webtoolbox-sidebar-close" onclick="document.getElementById('webtoolbox-sidebar').style.display='none'">×</button>
        </div>
        <div class="webtoolbox-sidebar-content">
            <div class="webtoolbox-sidebar-section">
                <h4>📄 页面信息</h4>
                <p><strong>标题:</strong> ${document.title}</p>
                <p><strong>URL:</strong> ${window.location.href}</p>
                <p><strong>域名:</strong> ${window.location.hostname}</p>
            </div>
            
            <div class="webtoolbox-sidebar-section">
                <h4>📊 页面统计</h4>
                <p>图片: ${document.querySelectorAll('img').length} 个</p>
                <p>链接: ${document.querySelectorAll('a[href]').length} 个</p>
                <p>脚本: ${document.querySelectorAll('script').length} 个</p>
            </div>
            
            <div class="webtoolbox-sidebar-section">
                <h4>🔧 快捷工具</h4>
                <button class="webtoolbox-sidebar-btn" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">回到顶部</button>
                <button class="webtoolbox-sidebar-btn" onclick="navigator.clipboard.writeText(window.location.href).then(() => alert('URL已复制!'))">复制URL</button>
                <button class="webtoolbox-sidebar-btn" onclick="window.print()">打印页面</button>
            </div>
        </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        #webtoolbox-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            width: 320px;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            z-index: 999999;
            overflow-y: auto;
            box-shadow: -5px 0 15px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .webtoolbox-sidebar-header {
            background: rgba(0,0,0,0.2);
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        
        .webtoolbox-sidebar-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }
        
        .webtoolbox-sidebar-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
        }
        
        .webtoolbox-sidebar-close:hover {
            background: rgba(255,255,255,0.2);
        }
        
        .webtoolbox-sidebar-content {
            padding: 20px;
        }
        
        .webtoolbox-sidebar-section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .webtoolbox-sidebar-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .webtoolbox-sidebar-section h4 {
            margin: 0 0 12px 0;
            font-size: 14px;
            font-weight: 600;
            opacity: 0.9;
        }
        
        .webtoolbox-sidebar-section p {
            margin: 8px 0;
            font-size: 13px;
            opacity: 0.8;
            word-break: break-all;
        }
        
        .webtoolbox-sidebar-btn {
            display: block;
            width: 100%;
            padding: 10px 15px;
            margin: 8px 0;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .webtoolbox-sidebar-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-1px);
        }
        
        .webtoolbox-sidebar-btn:active {
            transform: translateY(0);
        }
    `;
    
    // 将样式添加到head
    if (!document.getElementById('webtoolbox-sidebar-styles')) {
        style.id = 'webtoolbox-sidebar-styles';
        document.head.appendChild(style);
    }
    
    return sidebar;
}

console.log('🎉 [网页工具箱] Content script ready and waiting for messages');