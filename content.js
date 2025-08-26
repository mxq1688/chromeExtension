// content.js - Chrome插件内容脚本，运行在网页环境中

console.log('🛠️ [网页工具箱] Content script loaded on:', window.location.href);

// 监听来自popup和background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('🛠️ [网页工具箱] Content script received message:', request);
    
    try {
        switch (request.action) {
            case 'getPageStats':
                sendResponse(getPageStats());
                break;
                
            case 'scrollToTop':
                scrollToTop();
                sendResponse({ success: true });
                break;
                
            case 'highlightLinks':
                highlightLinks();
                sendResponse({ success: true });
                break;
                
            case 'showImageInfo':
                sendResponse({ images: getImageInfo() });
                break;
                
            case 'copyToClipboard':
                copyToClipboard(request.text).then(success => {
                    sendResponse({ success });
                }).catch(error => {
                    console.error('Copy failed:', error);
                    sendResponse({ success: false, error: error.message });
                });
                return true; // 异步响应
                
            case 'highlightSelectedText':
                const result = highlightSelectedText(request.text);
                sendResponse({ success: result });
                break;
                
            default:
                sendResponse({ error: 'Unknown action' });
        }
    } catch (error) {
        console.error('Content script error:', error);
        sendResponse({ error: error.message });
    }
    
    return true; // 保持消息通道开放
});

// 获取页面统计信息
function getPageStats() {
    const stats = {
        imageCount: document.querySelectorAll('img').length,
        linkCount: document.querySelectorAll('a').length,
        scriptCount: document.querySelectorAll('script').length,
        timestamp: new Date().toISOString()
    };
    
    console.log('🛠️ [网页工具箱] Page stats:', stats);
    return stats;
}

// 滚动到页面顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // 显示一个临时提示
    showTemporaryMessage('已回到顶部 ⬆️');
}

// 高亮所有链接
function highlightLinks() {
    const links = document.querySelectorAll('a');
    const originalStyles = new Map();
    
    // 如果已经高亮，则取消高亮
    if (document.body.dataset.linksHighlighted === 'true') {
        links.forEach(link => {
            const originalStyle = link.dataset.originalStyle;
            if (originalStyle) {
                link.style.cssText = originalStyle;
                delete link.dataset.originalStyle;
            }
        });
        document.body.dataset.linksHighlighted = 'false';
        showTemporaryMessage('已取消高亮链接');
        return;
    }
    
    // 高亮所有链接
    links.forEach(link => {
        // 保存原始样式
        link.dataset.originalStyle = link.style.cssText;
        
        // 应用高亮样式
        link.style.cssText += `
            background-color: #ffff00 !important;
            border: 2px solid #ff6b6b !important;
            border-radius: 3px !important;
            padding: 2px !important;
            box-shadow: 0 0 5px rgba(255, 107, 107, 0.5) !important;
        `;
    });
    
    document.body.dataset.linksHighlighted = 'true';
    showTemporaryMessage(`已高亮 ${links.length} 个链接 🔗`);
}

// 获取图片信息
function getImageInfo() {
    const images = document.querySelectorAll('img');
    const imageInfo = [];
    
    images.forEach((img, index) => {
        imageInfo.push({
            index: index + 1,
            src: img.src,
            alt: img.alt || '',
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
            title: img.title || ''
        });
    });
    
    console.log('Image info:', imageInfo);
    return imageInfo;
}

// 显示临时消息
function showTemporaryMessage(message) {
    // 移除已存在的消息
    const existingMessage = document.getElementById('chrome-extension-temp-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建新消息元素
    const messageDiv = document.createElement('div');
    messageDiv.id = 'chrome-extension-temp-message';
    messageDiv.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        padding: 12px 16px !important;
        border-radius: 8px !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        z-index: 999999 !important;
        animation: slideInFadeOut 3s ease-in-out !important;
        pointer-events: none !important;
        backdrop-filter: blur(10px) !important;
    `;
    
    messageDiv.textContent = message;
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInFadeOut {
            0% { 
                opacity: 0; 
                transform: translateX(100px); 
            }
            15%, 85% { 
                opacity: 1; 
                transform: translateX(0); 
            }
            100% { 
                opacity: 0; 
                transform: translateX(100px); 
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
        if (style.parentNode) {
            style.remove();
        }
    }, 3000);
}

// 页面加载完成后的初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

function initialize() {
    console.log('Content script initialized on:', window.location.href);
    
    // 可以在这里添加页面加载完成后的初始化逻辑
    // 例如：注入自定义样式、监听页面事件等
}

// 复制文本到剪贴板
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Clipboard API failed, trying fallback:', error);
        // 降级方案
        return fallbackCopyTextToClipboard(text);
    }
}

// 降级复制方案
function fallbackCopyTextToClipboard(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = `
            position: fixed;
            top: -1000px;
            left: -1000px;
            width: 1px;
            height: 1px;
            opacity: 0;
        `;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return successful;
    } catch (error) {
        console.error('Fallback copy failed:', error);
        return false;
    }
}

// 高亮选中的文本
function highlightSelectedText(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }
    
    try {
        // 创建样式
        const highlightStyle = document.createElement('style');
        highlightStyle.id = 'highlight-selected-text-style';
        highlightStyle.textContent = `
            .chrome-extension-highlight {
                background-color: #ffff00 !important;
                color: #000 !important;
                border-radius: 2px !important;
                padding: 1px 2px !important;
            }
        `;
        
        // 移除已存在的样式
        const existingStyle = document.getElementById('highlight-selected-text-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(highlightStyle);
        
        // 高亮文本
        highlightTextInDocument(text);
        
        return true;
    } catch (error) {
        console.error('Failed to highlight text:', error);
        return false;
    }
}

// 在文档中高亮指定文本
function highlightTextInDocument(searchText) {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // 跳过脚本和样式标签
                const parent = node.parentElement;
                if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        if (node.textContent.includes(searchText)) {
            textNodes.push(node);
        }
    }
    
    textNodes.forEach(textNode => {
        const parent = textNode.parentElement;
        if (parent && !parent.classList.contains('chrome-extension-highlight')) {
            const content = textNode.textContent;
            const highlightedContent = content.replace(
                new RegExp(escapeRegExp(searchText), 'gi'),
                `<span class="chrome-extension-highlight">$&</span>`
            );
            
            if (highlightedContent !== content) {
                const wrapper = document.createElement('span');
                wrapper.innerHTML = highlightedContent;
                parent.replaceChild(wrapper, textNode);
            }
        }
    });
}

// 转义正则表达式特殊字符
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 监听页面变化（对于单页应用）- 优化性能
let lastUrl = location.href;
let urlChangeTimeout;

const urlObserver = new MutationObserver(() => {
    // 使用防抖减少频繁触发
    clearTimeout(urlChangeTimeout);
    urlChangeTimeout = setTimeout(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('URL changed to:', url);
            // 页面URL变化时的处理逻辑
        }
    }, 100);
});

// 只在必要时启动观察器
if (document.body) {
    urlObserver.observe(document, { subtree: true, childList: true });
} else {
    document.addEventListener('DOMContentLoaded', () => {
        urlObserver.observe(document, { subtree: true, childList: true });
    });
}
