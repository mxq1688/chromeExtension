// popup.js - 弹窗界面逻辑

console.log('🛠️ Popup script loaded');

// DOM元素
const elements = {
    loading: document.getElementById('loading'),
    pageInfo: document.getElementById('page-info'),
    pageStats: document.getElementById('page-stats'),
    tools: document.getElementById('tools'),
    status: document.getElementById('status'),
    
    // 页面信息元素
    pageTitle: document.getElementById('page-title'),
    pageUrl: document.getElementById('page-url'),
    pageDomain: document.getElementById('page-domain'),
    
    // 统计信息元素
    imageCount: document.getElementById('image-count'),
    linkCount: document.getElementById('link-count'),
    scriptCount: document.getElementById('script-count'),
    
    // 工具按钮
    scrollTop: document.getElementById('scroll-top'),
    highlightLinks: document.getElementById('highlight-links'),
    copyUrl: document.getElementById('copy-url'),
    showImages: document.getElementById('show-images')
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup DOM loaded');
    initializePopup();
});

// 初始化弹窗
async function initializePopup() {
    try {
        // 显示加载状态
        showLoading();
        
        // 获取当前活动标签页
        const tabs = await getCurrentTab();
        if (!tabs || !tabs[0]) {
            showError('无法获取当前标签页');
            return;
        }
        
        const currentTab = tabs[0];
        console.log('Current tab:', currentTab);
        
        // 检查是否是支持的页面
        if (!isSupportedUrl(currentTab.url)) {
            showError('当前页面不支持该功能\n(chrome:// 页面或本地文件)');
            return;
        }
        
        // 从当前标签页获取页面信息
        await loadPageData(currentTab);
        
        // 设置工具按钮事件
        setupToolEvents(currentTab.id);
        
        // 显示内容
        showContent();
        
    } catch (error) {
        console.error('Initialize error:', error);
        showError('初始化失败: ' + error.message);
    }
}

// 获取当前标签页
function getCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(tabs);
            }
        });
    });
}

// 检查URL是否支持
function isSupportedUrl(url) {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
}

// 加载页面数据
async function loadPageData(tab) {
    try {
        // 基本页面信息（从tab对象获取）
        elements.pageTitle.textContent = tab.title || '未知标题';
        elements.pageUrl.textContent = tab.url || '未知URL';
        
        // 解析域名
        try {
            const urlObj = new URL(tab.url);
            elements.pageDomain.textContent = urlObj.hostname;
        } catch (e) {
            elements.pageDomain.textContent = '解析失败';
        }
        
        // 向content script请求页面统计信息
        const stats = await sendMessageToTab(tab.id, { action: 'getPageStats' });
        
        if (stats && !stats.error) {
            elements.imageCount.textContent = stats.images || '0';
            elements.linkCount.textContent = stats.links || '0';
            elements.scriptCount.textContent = stats.scripts || '0';
        } else {
            // 如果无法获取统计信息，显示默认值
            elements.imageCount.textContent = '计算中...';
            elements.linkCount.textContent = '计算中...';
            elements.scriptCount.textContent = '计算中...';
        }
        
    } catch (error) {
        console.error('Load page data error:', error);
        // 显示基本信息，统计信息显示错误状态
        elements.imageCount.textContent = '获取失败';
        elements.linkCount.textContent = '获取失败';
        elements.scriptCount.textContent = '获取失败';
    }
}

// 向标签页发送消息
function sendMessageToTab(tabId, message) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                console.warn('Message send error:', chrome.runtime.lastError.message);
                resolve({ error: chrome.runtime.lastError.message });
            } else {
                resolve(response || { error: 'No response' });
            }
        });
    });
}

// 设置工具按钮事件
function setupToolEvents(tabId) {
    // 回到顶部
    elements.scrollTop.addEventListener('click', async () => {
        const result = await sendMessageToTab(tabId, { action: 'scrollToTop' });
        showStatus(result.error ? '操作失败' : '已回到页面顶部', !result.error);
    });
    
    // 高亮链接
    elements.highlightLinks.addEventListener('click', async () => {
        const result = await sendMessageToTab(tabId, { action: 'highlightLinks' });
        showStatus(result.error ? '操作失败' : '链接高亮已切换', !result.error);
    });
    
    // 复制URL
    elements.copyUrl.addEventListener('click', async () => {
        try {
            const tabs = await getCurrentTab();
            if (tabs && tabs[0]) {
                await navigator.clipboard.writeText(tabs[0].url);
                showStatus('URL已复制到剪贴板', true);
            }
        } catch (error) {
            console.error('Copy URL error:', error);
            showStatus('复制失败', false);
        }
    });
    
    // 显示图片信息
    elements.showImages.addEventListener('click', async () => {
        const result = await sendMessageToTab(tabId, { action: 'getImageInfo' });
        if (result.error) {
            showStatus('获取图片信息失败', false);
        } else {
            showImageInfo(result.images || []);
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
    
    // 显示前10张图片信息
    const displayCount = Math.min(images.length, 10);
    for (let i = 0; i < displayCount; i++) {
        const img = images[i];
        info += `${i + 1}. ${img.src || '无源地址'}\n`;
        if (img.width && img.height) {
            info += `   尺寸: ${img.width} x ${img.height}\n`;
        }
        info += `   Alt: ${img.alt || '无描述'}\n\n`;
    }
    
    if (images.length > 10) {
        info += `... 还有 ${images.length - 10} 张图片`;
    }
    
    alert(info);
}

// 显示加载状态
function showLoading() {
    elements.loading.style.display = 'block';
    elements.pageInfo.style.display = 'none';
    elements.pageStats.style.display = 'none';
    elements.tools.style.display = 'none';
    elements.status.style.display = 'none';
}

// 显示内容
function showContent() {
    elements.loading.style.display = 'none';
    elements.pageInfo.style.display = 'block';
    elements.pageStats.style.display = 'block';
    elements.tools.style.display = 'block';
}

// 显示错误
function showError(message) {
    elements.loading.style.display = 'none';
    elements.pageInfo.style.display = 'none';
    elements.pageStats.style.display = 'none';
    elements.tools.style.display = 'none';
    
    elements.status.textContent = message;
    elements.status.className = 'status error';
    elements.status.style.display = 'block';
}

// 显示状态消息
function showStatus(message, isSuccess) {
    elements.status.textContent = message;
    elements.status.className = `status ${isSuccess ? 'success' : 'error'}`;
    elements.status.style.display = 'block';
    
    // 3秒后隐藏
    setTimeout(() => {
        elements.status.style.display = 'none';
    }, 3000);
}

console.log('🎉 Popup script initialized');