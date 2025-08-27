// popup.js - 优化版弹窗逻辑

console.log('🛠️ Popup script loaded');

// 全局变量
let currentTabId = null;
let isInitialized = false;

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
    if (isInitialized) {
        console.log('Already initialized');
        return;
    }
    
    // 显示加载状态
    showLoading();
    
    try {
        // 获取当前标签页
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tabs || !tabs[0]) {
            throw new Error('无法获取当前标签页');
        }
        
        const currentTab = tabs[0];
        currentTabId = currentTab.id;
        console.log('Current tab:', currentTab.url, 'ID:', currentTabId);
        
        // 检查URL是否支持
        if (!currentTab.url.startsWith('http')) {
            showError('当前页面不支持该功能\n(仅支持HTTP/HTTPS网站)');
            return;
        }
        
        // 显示基本页面信息
        updatePageInfo(currentTab);
        
        // 等待一下确保content script加载
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 尝试获取页面统计信息
        await updatePageStats();
        
        // 设置按钮事件
        setupButtons();
        
        // 显示内容
        showContent();
        
        isInitialized = true;
        console.log('✅ Popup initialized successfully');
        
    } catch (error) {
        console.error('Load error:', error);
        showError('加载失败: ' + error.message);
    }
}

// 更新页面基本信息
function updatePageInfo(tab) {
    try {
        document.getElementById('page-title').textContent = tab.title || '未知标题';
        document.getElementById('page-url').textContent = tab.url;
        
        // 解析域名
        try {
            const urlObj = new URL(tab.url);
            document.getElementById('page-domain').textContent = urlObj.hostname;
        } catch (e) {
            document.getElementById('page-domain').textContent = '解析失败';
        }
    } catch (error) {
        console.error('Update page info error:', error);
    }
}

// 更新页面统计信息
async function updatePageStats() {
    try {
        // 先尝试ping content script
        const pingResponse = await sendMessageWithRetry({ action: 'ping' }, 3);
        console.log('Content script ping:', pingResponse);
        
        // 获取统计信息
        const response = await sendMessageWithRetry({ action: 'getPageStats' }, 3);
        
        if (response && !response.error) {
            document.getElementById('image-count').textContent = response.images || '0';
            document.getElementById('link-count').textContent = response.links || '0';
            document.getElementById('script-count').textContent = response.scripts || '0';
            console.log('Stats updated:', response);
        } else {
            throw new Error(response?.error || '无法获取统计信息');
        }
    } catch (error) {
        console.warn('Get stats error:', error);
        document.getElementById('image-count').textContent = '获取失败';
        document.getElementById('link-count').textContent = '获取失败';
        document.getElementById('script-count').textContent = '获取失败';
    }
}

// 带重试的消息发送
async function sendMessageWithRetry(message, maxRetries = 3, delay = 200) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            if (!currentTabId) {
                throw new Error('没有有效的标签页ID');
            }
            
            console.log(`Attempt ${i + 1}: Sending message:`, message);
            const response = await chrome.tabs.sendMessage(currentTabId, message);
            console.log(`Attempt ${i + 1}: Response:`, response);
            return response;
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed:`, error.message);
            
            if (i === maxRetries - 1) {
                throw error;
            }
            
            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// 设置按钮事件
function setupButtons() {
    console.log('Setting up button events...');
    
    // 回到顶部
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', async () => {
            console.log('Scroll top button clicked');
            await handleButtonClick('scrollToTop', '已回到页面顶部');
        });
        console.log('✅ Scroll top button ready');
    }
    
    // 高亮链接
    const highlightBtn = document.getElementById('highlight-links');
    if (highlightBtn) {
        highlightBtn.addEventListener('click', async () => {
            console.log('Highlight links button clicked');
            await handleButtonClick('highlightLinks', '链接高亮已切换');
        });
        console.log('✅ Highlight button ready');
    }
    
    // 复制URL
    const copyBtn = document.getElementById('copy-url');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            console.log('Copy URL button clicked');
            try {
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tabs && tabs[0]) {
                    await navigator.clipboard.writeText(tabs[0].url);
                    showStatus('URL已复制到剪贴板', true);
                } else {
                    throw new Error('无法获取当前标签页');
                }
            } catch (error) {
                console.error('Copy URL error:', error);
                showStatus('复制失败: ' + error.message, false);
            }
        });
        console.log('✅ Copy URL button ready');
    }
    
    // 显示图片信息
    const imagesBtn = document.getElementById('show-images');
    if (imagesBtn) {
        imagesBtn.addEventListener('click', async () => {
            console.log('Show images button clicked');
            try {
                const response = await sendMessageWithRetry({ action: 'getImageInfo' }, 3);
                
                if (response && response.images) {
                    showImageInfo(response.images);
                } else {
                    showStatus('没有找到图片信息', false);
                }
            } catch (error) {
                console.error('Get images error:', error);
                showStatus('获取图片信息失败: ' + error.message, false);
            }
        });
        console.log('✅ Show images button ready');
    }
    
    console.log('✅ All buttons set up');
}

// 处理按钮点击
async function handleButtonClick(action, successMessage) {
    try {
        showStatus('正在执行...', true);
        const response = await sendMessageWithRetry({ action: action }, 3);
        
        if (response && response.success !== false) {
            showStatus(successMessage, true);
        } else {
            throw new Error(response?.error || '操作失败');
        }
    } catch (error) {
        console.error(`${action} error:`, error);
        showStatus('操作失败: ' + error.message, false);
    }
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
    
    // 3秒后隐藏（成功消息）
    if (isSuccess) {
        setTimeout(() => {
            if (statusEl.style.display !== 'none') {
                statusEl.style.display = 'none';
            }
        }, 3000);
    }
}

console.log('🎉 Popup script ready');