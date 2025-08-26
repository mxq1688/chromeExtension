// popup.js - Chrome插件弹窗功能脚本

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🛠️ [网页工具箱] Popup loaded');
    
    // 获取当前活动标签页
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && tab.url) {
            // 显示页面基本信息
            displayPageInfo(tab);
            
            // 获取页面统计信息
            await getPageStats(tab.id);
            
            // 隐藏加载动画，显示内容
            document.getElementById('loading').style.display = 'none';
            document.getElementById('page-info').style.display = 'block';
            document.getElementById('page-stats').style.display = 'block';
        } else {
            throw new Error('无法获取当前标签页信息');
        }
    } catch (error) {
        console.error('Error getting tab info:', error);
        showError('无法获取页面信息，请刷新后重试');
    }
    
    // 绑定工具按钮事件（即使出错也要绑定）
    try {
        bindToolEvents();
    } catch (error) {
        console.error('Error binding tool events:', error);
    }
});

// 显示页面基本信息
function displayPageInfo(tab) {
    try {
        document.getElementById('page-title').textContent = tab.title || '无标题';
        document.getElementById('page-url').textContent = tab.url || '未知';
        
        // 安全地解析URL
        if (tab.url) {
            try {
                const url = new URL(tab.url);
                document.getElementById('page-domain').textContent = url.hostname || '未知';
                document.getElementById('page-protocol').textContent = url.protocol.replace(':', '') || '未知';
            } catch (urlError) {
                console.warn('URL parsing failed:', urlError);
                // 处理特殊页面（chrome://、extension://等）
                if (tab.url.startsWith('chrome://')) {
                    document.getElementById('page-domain').textContent = 'chrome内部页面';
                    document.getElementById('page-protocol').textContent = 'chrome';
                } else if (tab.url.startsWith('chrome-extension://')) {
                    document.getElementById('page-domain').textContent = '扩展页面';
                    document.getElementById('page-protocol').textContent = 'extension';
                } else {
                    document.getElementById('page-domain').textContent = '未知';
                    document.getElementById('page-protocol').textContent = '未知';
                }
            }
        } else {
            document.getElementById('page-domain').textContent = '未知';
            document.getElementById('page-protocol').textContent = '未知';
        }
    } catch (error) {
        console.error('Error displaying page info:', error);
        // 设置默认值
        document.getElementById('page-title').textContent = '获取失败';
        document.getElementById('page-url').textContent = '获取失败';
        document.getElementById('page-domain').textContent = '获取失败';
        document.getElementById('page-protocol').textContent = '获取失败';
    }
}

// 获取页面统计信息
async function getPageStats(tabId) {
    try {
        // 获取当前标签页信息以检查是否可以注入脚本
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !isScriptableTab(tab.url)) {
            // 对于不可注入脚本的页面，显示特殊信息
            document.getElementById('image-count').textContent = '不支持';
            document.getElementById('link-count').textContent = '不支持';
            document.getElementById('script-count').textContent = '不支持';
            return;
        }
        
        // 向content script发送消息获取页面统计
        const response = await chrome.tabs.sendMessage(tabId, { action: 'getPageStats' });
        
        if (response && !response.error) {
            document.getElementById('image-count').textContent = response.imageCount || 0;
            document.getElementById('link-count').textContent = response.linkCount || 0;
            document.getElementById('script-count').textContent = response.scriptCount || 0;
        } else {
            throw new Error(response?.error || 'No response from content script');
        }
    } catch (error) {
        console.error('Error getting page stats:', error);
        // 如果无法获取统计信息，显示默认值
        document.getElementById('image-count').textContent = '无法获取';
        document.getElementById('link-count').textContent = '无法获取';
        document.getElementById('script-count').textContent = '无法获取';
    }
}

// 检查标签页是否可以注入脚本
function isScriptableTab(url) {
    if (!url) return false;
    
    // Chrome内部页面和扩展页面不能注入content script
    const nonScriptableUrls = [
        'chrome://',
        'chrome-extension://',
        'chrome-search://',
        'chrome-devtools://',
        'moz-extension://',
        'edge-extension://',
        'about:',
        'file://'
    ];
    
    return !nonScriptableUrls.some(prefix => url.startsWith(prefix));
}

// 绑定工具按钮事件
function bindToolEvents() {
    // 回到顶部
    document.getElementById('scroll-to-top').addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!isScriptableTab(tab.url)) {
                showNotification('此页面不支持该功能');
                return;
            }
            
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'scrollToTop' });
            if (response && response.success) {
                showNotification('已回到顶部');
            } else {
                showNotification('操作失败，请刷新页面后重试');
            }
        } catch (error) {
            console.error('Scroll to top failed:', error);
            showNotification('操作失败，请检查页面是否支持此功能');
        }
    });
    
    // 高亮所有链接
    document.getElementById('highlight-links').addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!isScriptableTab(tab.url)) {
                showNotification('此页面不支持该功能');
                return;
            }
            
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'highlightLinks' });
            if (response && response.success) {
                showNotification('已高亮所有链接');
            } else {
                showNotification('高亮失败，请刷新页面后重试');
            }
        } catch (error) {
            console.error('Highlight links failed:', error);
            showNotification('操作失败，请检查页面是否支持此功能');
        }
    });
    
    // 显示所有图片信息
    document.getElementById('show-images').addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!isScriptableTab(tab.url)) {
                showNotification('此页面不支持该功能');
                return;
            }
            
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'showImageInfo' });
            if (response && response.images) {
                showImageDialog(response.images);
            } else {
                showNotification('无法获取图片信息');
            }
        } catch (error) {
            console.error('Show images failed:', error);
            showNotification('操作失败，请检查页面是否支持此功能');
        }
    });
    
    // 复制当前URL
    document.getElementById('copy-url').addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await navigator.clipboard.writeText(tab.url);
            showNotification('URL已复制到剪贴板');
        } catch (error) {
            console.error('Failed to copy URL:', error);
            // 降级方案
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                const textArea = document.createElement('textarea');
                textArea.value = tab.url;
                textArea.style.position = 'absolute';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('URL已复制到剪贴板');
            } catch (fallbackError) {
                showNotification('复制失败，请手动复制URL');
            }
        }
    });
}

// 显示通知
function showNotification(message) {
    // 创建临时通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `;
    notification.textContent = message;
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateY(-10px); }
            20%, 80% { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // 2秒后移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 2000);
}

// 显示图片信息对话框
function showImageDialog(images) {
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        color: black;
        padding: 20px;
        border-radius: 8px;
        max-width: 300px;
        max-height: 300px;
        overflow-y: auto;
    `;
    
    // 安全地创建内容
    const header = document.createElement('h3');
    header.textContent = '页面图片信息';
    content.appendChild(header);
    
    if (images.length === 0) {
        const noImages = document.createElement('p');
        noImages.textContent = '页面中没有找到图片';
        content.appendChild(noImages);
    } else {
        const summary = document.createElement('p');
        summary.textContent = `共找到 ${images.length} 张图片：`;
        content.appendChild(summary);
        
        const list = document.createElement('ul');
        images.forEach((img, index) => {
            const listItem = document.createElement('li');
            listItem.style.cssText = 'margin: 5px 0; font-size: 12px;';
            
            const description = document.createElement('div');
            description.textContent = `${index + 1}. ${img.alt || '无描述'}`;
            listItem.appendChild(description);
            
            const url = document.createElement('small');
            url.style.color = '#666';
            url.textContent = img.src.substring(0, 50) + '...';
            listItem.appendChild(url);
            
            list.appendChild(listItem);
        });
        content.appendChild(list);
    }
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.style.cssText = 'margin-top: 10px; padding: 5px 10px;';
    closeButton.addEventListener('click', () => dialog.remove());
    content.appendChild(closeButton);
    
    dialog.appendChild(content);
    document.body.appendChild(dialog);
    
    // 点击背景关闭
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.remove();
        }
    });
    
    // ESC键关闭
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            dialog.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// 显示错误信息
function showError(message) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        // 安全地设置错误信息
        loadingElement.innerHTML = '';
        
        const errorDiv = document.createElement('div');
        errorDiv.style.color = '#ff6b6b';
        errorDiv.textContent = `❌ ${message}`;
        
        loadingElement.appendChild(errorDiv);
    }
}
