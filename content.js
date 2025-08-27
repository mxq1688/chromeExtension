// content.js - 简化版内容脚本

console.log('🛠️ [网页工具箱] Content script loaded on:', window.location.href);

// 防止重复加载
if (window.webToolboxLoaded) {
    console.log('Content script already loaded');
} else {
    window.webToolboxLoaded = true;
    
    // 初始化
    let linksHighlighted = false;
    
    // 监听消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Content script received:', request.action);
        
        try {
            switch (request.action) {
                case 'ping':
                    sendResponse({ status: 'pong', timestamp: Date.now() });
                    break;
                    
                case 'getPageStats':
                    const stats = getPageStats();
                    console.log('Page stats:', stats);
                    sendResponse(stats);
                    break;
                    
                case 'scrollToTop':
                    scrollToTop();
                    sendResponse({ success: true });
                    break;
                    
                case 'highlightLinks':
                    linksHighlighted = toggleHighlightLinks(linksHighlighted);
                    sendResponse({ success: true, highlighted: linksHighlighted });
                    break;
                    
                case 'getImageInfo':
                    const images = getImageInfo();
                    sendResponse({ images: images });
                    break;
                    
                default:
                    console.warn('Unknown action:', request.action);
                    sendResponse({ error: 'Unknown action: ' + request.action });
            }
        } catch (error) {
            console.error('Content script error:', error);
            sendResponse({ error: error.message });
        }
        
        return true; // 异步响应
    });
    
    console.log('✅ Content script initialized');
}

// 获取页面统计信息
function getPageStats() {
    try {
        return {
            images: document.querySelectorAll('img').length,
            links: document.querySelectorAll('a[href]').length,
            scripts: document.querySelectorAll('script').length
        };
    } catch (error) {
        console.error('Get stats error:', error);
        return { error: error.message };
    }
}

// 滚动到顶部
function scrollToTop() {
    try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('Scrolled to top');
    } catch (error) {
        console.error('Scroll error:', error);
        window.scrollTo(0, 0); // 备用方案
    }
}

// 切换链接高亮
function toggleHighlightLinks(currentState) {
    try {
        const links = document.querySelectorAll('a[href]');
        
        if (currentState) {
            // 移除高亮
            links.forEach(link => {
                link.style.backgroundColor = '';
                link.style.border = '';
                link.style.boxShadow = '';
                link.removeAttribute('data-highlighted');
            });
            console.log('Links highlight removed');
            return false;
        } else {
            // 添加高亮
            links.forEach(link => {
                link.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                link.style.border = '2px solid #ffdd00';
                link.style.boxShadow = '0 0 5px rgba(255, 221, 0, 0.5)';
                link.setAttribute('data-highlighted', 'true');
            });
            console.log(`Highlighted ${links.length} links`);
            return true;
        }
    } catch (error) {
        console.error('Highlight error:', error);
        return currentState;
    }
}

// 获取图片信息
function getImageInfo() {
    try {
        const images = document.querySelectorAll('img');
        const imageInfo = [];
        
        images.forEach((img, index) => {
            if (index < 10) { // 限制数量
                imageInfo.push({
                    src: img.src || '',
                    alt: img.alt || '',
                    width: img.naturalWidth || img.width || 0,
                    height: img.naturalHeight || img.height || 0
                });
            }
        });
        
        console.log(`Found ${images.length} images`);
        return imageInfo;
    } catch (error) {
        console.error('Get images error:', error);
        return [];
    }
}

console.log('🎉 Content script ready');