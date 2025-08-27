// popup.js - 简化版弹窗逻辑

console.log('🛠️ Popup script loaded');

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Popup DOM loaded');
    
    try {
        await initializePopup();
    } catch (error) {
        console.error('Initialize error:', error);
        showError('初始化失败: ' + error.message);
    }
});

// 初始化弹窗
async function initializePopup() {
    // 显示加载状态
    showLoading();
    
    try {
        // 获取当前标签页
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tabs || !tabs[0]) {
            throw new Error('无法获取当前标签页');
        }
        
        const currentTab = tabs[0];
        console.log('Current tab:', currentTab.url);
        
        // 检查URL是否支持
        if (!currentTab.url.startsWith('http')) {
            showError('当前页面不支持该功能\n(chrome:// 页面或本地文件)');
            return;
        }
        
        // 显示基本页面信息
        document.getElementById('page-title').textContent = currentTab.title || '未知标题';
        document.getElementById('page-url').textContent = currentTab.url;
        
        // 解析域名
        try {
            const urlObj = new URL(currentTab.url);
            document.getElementById('page-domain').textContent = urlObj.hostname;
        } catch (e) {
            document.getElementById('page-domain').textContent = '解析失败';
        }
        
        // 尝试获取页面统计信息
        try {
            const response = await chrome.tabs.sendMessage(currentTab.id, { action: 'getPageStats' });
            
            if (response && !response.error) {
                document.getElementById('image-count').textContent = response.images || '0';
                document.getElementById('link-count').textContent = response.links || '0';
                document.getElementById('script-count').textContent = response.scripts || '0';
            } else {
                throw new Error('无法获取统计信息');
            }
        } catch (error) {
            console.warn('Get stats error:', error);
            document.getElementById('image-count').textContent = '获取失败';
            document.getElementById('link-count').textContent = '获取失败';
            document.getElementById('script-count').textContent = '获取失败';
        }
        
        // 设置按钮事件
        setupButtons(currentTab.id);
        
        // 显示内容
        showContent();
        
    } catch (error) {
        console.error('Load error:', error);
        showError('加载失败: ' + error.message);
    }
}

// 设置按钮事件
function setupButtons(tabId) {
    // 回到顶部
    document.getElementById('scroll-top').addEventListener('click', async () => {
        try {
            await chrome.tabs.sendMessage(tabId, { action: 'scrollToTop' });
            showStatus('已回到页面顶部', true);
        } catch (error) {
            console.error('Scroll error:', error);
            showStatus('操作失败', false);
        }
    });
    
    // 高亮链接
    document.getElementById('highlight-links').addEventListener('click', async () => {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'highlightLinks' });
            showStatus('链接高亮已切换', true);
        } catch (error) {
            console.error('Highlight error:', error);
            showStatus('操作失败', false);
        }
    });
    
    // 复制URL
    document.getElementById('copy-url').addEventListener('click', async () => {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs && tabs[0]) {
                await navigator.clipboard.writeText(tabs[0].url);
                showStatus('URL已复制到剪贴板', true);
            }
        } catch (error) {
            console.error('Copy error:', error);
            showStatus('复制失败', false);
        }
    });
    
    // 显示图片信息
    document.getElementById('show-images').addEventListener('click', async () => {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'getImageInfo' });
            
            if (response && response.images) {
                showImageInfo(response.images);
            } else {
                showStatus('没有找到图片信息', false);
            }
        } catch (error) {
            console.error('Get images error:', error);
            showStatus('获取图片信息失败', false);
        }
    });
}

// 显示图片信息
function showImageInfo(images) {
    if (!images || images.length === 0) {
        showStatus('页面中没有找到图片', false);
        return;
    }
    
    let info = `页面共有 ${images.length} 张图片:\n\n`;
    
    const displayCount = Math.min(images.length, 5);
    for (let i = 0; i < displayCount; i++) {
        const img = images[i];
        info += `${i + 1}. ${img.src ? img.src.substring(0, 50) + '...' : '无源地址'}\n`;
        if (img.width && img.height) {
            info += `   尺寸: ${img.width} x ${img.height}\n`;
        }
        info += `\n`;
    }
    
    if (images.length > 5) {
        info += `... 还有 ${images.length - 5} 张图片`;
    }
    
    alert(info);
}

// 显示加载状态
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('page-info').style.display = 'none';
    document.getElementById('page-stats').style.display = 'none';
    document.getElementById('tools').style.display = 'none';
    document.getElementById('status').style.display = 'none';
}

// 显示内容
function showContent() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('page-info').style.display = 'block';
    document.getElementById('page-stats').style.display = 'block';
    document.getElementById('tools').style.display = 'block';
}

// 显示错误
function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('page-info').style.display = 'none';
    document.getElementById('page-stats').style.display = 'none';
    document.getElementById('tools').style.display = 'none';
    
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = 'status error';
    statusEl.style.display = 'block';
}

// 显示状态消息
function showStatus(message, isSuccess) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${isSuccess ? 'success' : 'error'}`;
    statusEl.style.display = 'block';
    
    // 3秒后隐藏
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}

console.log('🎉 Popup script ready');