// content.js - 内容脚本，运行在网页环境中

console.log('🛠️ [网页工具箱] Content script loaded on:', window.location.href);

// 防止重复加载
if (window.webToolboxLoaded) {
    console.log('Content script already loaded, skipping...');
} else {
    window.webToolboxLoaded = true;
    initializeContentScript();
}

// 全局状态
let linksHighlighted = false;

// 初始化内容脚本
function initializeContentScript() {
    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Content script received message:', request);
        
        try {
            handleMessage(request, sendResponse);
        } catch (error) {
            console.error('Content script error:', error);
            sendResponse({ error: error.message });
        }
        
        // 返回true表示异步响应
        return true;
    });
    
    console.log('✅ Content script initialized');
}

// 处理消息
function handleMessage(request, sendResponse) {
    switch (request.action) {
        case 'getPageStats':
            sendResponse(getPageStats());
            break;
            
        case 'scrollToTop':
            scrollToTop();
            sendResponse({ success: true });
            break;
            
        case 'highlightLinks':
            const result = toggleHighlightLinks();
            sendResponse({ success: true, highlighted: result });
            break;
            
        case 'getImageInfo':
            sendResponse({ images: getImageInfo() });
            break;
            
        default:
            sendResponse({ error: 'Unknown action: ' + request.action });
    }
}

// 获取页面统计信息
function getPageStats() {
    try {
        const stats = {
            images: document.querySelectorAll('img').length,
            links: document.querySelectorAll('a[href]').length,
            scripts: document.querySelectorAll('script').length,
            title: document.title,
            url: window.location.href,
            domain: window.location.hostname
        };
        
        console.log('Page stats:', stats);
        return stats;
    } catch (error) {
        console.error('Get page stats error:', error);
        return { error: error.message };
    }
}

// 滚动到页面顶部
function scrollToTop() {
    try {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        console.log('Scrolled to top');
    } catch (error) {
        console.error('Scroll to top error:', error);
        // 备用方案
        window.scrollTo(0, 0);
    }
}

// 切换链接高亮
function toggleHighlightLinks() {
    try {
        const links = document.querySelectorAll('a[href]');
        
        if (linksHighlighted) {
            // 移除高亮
            links.forEach(link => {
                link.style.backgroundColor = '';
                link.style.border = '';
                link.style.boxShadow = '';
                link.removeAttribute('data-webtoolbox-highlighted');
            });
            linksHighlighted = false;
            console.log('Links highlight removed');
        } else {
            // 添加高亮
            links.forEach(link => {
                link.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                link.style.border = '2px solid #ffdd00';
                link.style.boxShadow = '0 0 5px rgba(255, 221, 0, 0.5)';
                link.setAttribute('data-webtoolbox-highlighted', 'true');
            });
            linksHighlighted = true;
            console.log(`Highlighted ${links.length} links`);
        }
        
        return linksHighlighted;
    } catch (error) {
        console.error('Toggle highlight links error:', error);
        return false;
    }
}

// 获取图片信息
function getImageInfo() {
    try {
        const images = document.querySelectorAll('img');
        const imageInfo = [];
        
        images.forEach((img, index) => {
            // 限制最多返回20张图片信息
            if (index < 20) {
                imageInfo.push({
                    src: img.src || '',
                    alt: img.alt || '',
                    width: img.naturalWidth || img.width || 0,
                    height: img.naturalHeight || img.height || 0
                });
            }
        });
        
        console.log(`Found ${images.length} images, returning ${imageInfo.length}`);
        return imageInfo;
    } catch (error) {
        console.error('Get image info error:', error);
        return [];
    }
}

// 清理函数（页面卸载时调用）
function cleanup() {
    try {
        // 移除链接高亮
        if (linksHighlighted) {
            const links = document.querySelectorAll('a[data-webtoolbox-highlighted]');
            links.forEach(link => {
                link.style.backgroundColor = '';
                link.style.border = '';
                link.style.boxShadow = '';
                link.removeAttribute('data-webtoolbox-highlighted');
            });
        }
        console.log('Content script cleanup completed');
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

// 页面卸载时清理
window.addEventListener('beforeunload', cleanup);

// 导出到全局供调试使用
window.webToolboxContent = {
    getStats: getPageStats,
    scrollTop: scrollToTop,
    highlightLinks: toggleHighlightLinks,
    getImages: getImageInfo,
    cleanup: cleanup
};

console.log('🎉 [网页工具箱] Content script ready');