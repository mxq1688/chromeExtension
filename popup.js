// popup.js - 重写优化版本

console.log('🛠️ Popup script loading...');

// 全局状态
const state = {
    currentTab: null,
    isLoading: false,
    initialized: false
};

// DOM元素引用
const elements = {};

// 等待DOM加载
document.addEventListener('DOMContentLoaded', initializeExtension);

// 主初始化函数
async function initializeExtension() {
    console.log('🚀 Starting extension initialization...');
    
    // 获取DOM元素引用
    cacheElements();
    
    // 显示加载状态
    showLoading('正在加载页面信息...');
    
    try {
        // 获取当前标签页
        await getCurrentTab();
        
        // 检查是否为有效页面
        if (!isValidUrl(state.currentTab.url)) {
            showError('当前页面不支持该功能\n仅支持 http:// 和 https:// 网站');
            return;
        }
        
        // 显示基本页面信息
        displayPageInfo();
        
        // 注入并执行内容脚本
        await injectAndExecuteContentScript();
        
        // 获取页面统计信息
        await loadPageStatistics();
        
        // 设置按钮事件监听
        setupEventListeners();
        
        // 显示所有内容
        showContent();
        
        state.initialized = true;
        console.log('✅ Extension initialized successfully!');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showError(`初始化失败: ${error.message}`);
    }
}

// 缓存DOM元素
function cacheElements() {
    elements.loading = document.getElementById('loading');
    elements.pageInfo = document.getElementById('page-info');
    elements.pageStats = document.getElementById('page-stats');
    elements.tools = document.getElementById('tools');
    elements.status = document.getElementById('status');
    
    // 页面信息元素
    elements.pageTitle = document.getElementById('page-title');
    elements.pageUrl = document.getElementById('page-url');
    elements.pageDomain = document.getElementById('page-domain');
    
    // 统计信息元素
    elements.imageCount = document.getElementById('image-count');
    elements.linkCount = document.getElementById('link-count');
    elements.scriptCount = document.getElementById('script-count');
    
    // 按钮元素
    elements.scrollTopBtn = document.getElementById('scroll-top');
    elements.highlightLinksBtn = document.getElementById('highlight-links');
    elements.copyUrlBtn = document.getElementById('copy-url');
    elements.showImagesBtn = document.getElementById('show-images');
    elements.showSidebarBtn = document.getElementById('show-sidebar');
}

// 获取当前标签页
async function getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tabs || !tabs[0]) {
        throw new Error('无法获取当前标签页');
    }
    
    state.currentTab = tabs[0];
    console.log('📄 Current tab:', state.currentTab.url);
}

// 检查URL是否有效
function isValidUrl(url) {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
}

// 显示页面基本信息
function displayPageInfo() {
    const tab = state.currentTab;
    
    elements.pageTitle.textContent = tab.title || '无标题';
    elements.pageUrl.textContent = tab.url;
    
    try {
        const urlObj = new URL(tab.url);
        elements.pageDomain.textContent = urlObj.hostname;
    } catch (error) {
        elements.pageDomain.textContent = '无法解析域名';
    }
}

// 注入并执行内容脚本
async function injectAndExecuteContentScript() {
    try {
        // 尝试ping现有的content script
        const pingResult = await sendMessageToTab({ action: 'ping' });
        console.log('📡 Content script ping result:', pingResult);
        
    } catch (error) {
        console.log('⚠️ Content script not ready, injecting...');
        
        // 注入content script
        await chrome.scripting.executeScript({
            target: { tabId: state.currentTab.id },
            files: ['content.js']
        });
        
        console.log('✅ Content script injected');
        
        // 等待一下让脚本初始化
        await sleep(500);
    }
}

// 加载页面统计信息
async function loadPageStatistics() {
    try {
        console.log('📊 Loading page statistics...');
        const stats = await sendMessageToTab({ action: 'getPageStats' });
        
        if (stats && !stats.error) {
            elements.imageCount.textContent = stats.images || '0';
            elements.linkCount.textContent = stats.links || '0';
            elements.scriptCount.textContent = stats.scripts || '0';
            console.log('✅ Statistics loaded:', stats);
        } else {
            throw new Error(stats?.error || '统计数据获取失败');
        }
    } catch (error) {
        console.warn('⚠️ Statistics loading failed:', error);
        elements.imageCount.textContent = '获取失败';
        elements.linkCount.textContent = '获取失败';
        elements.scriptCount.textContent = '获取失败';
    }
}

// 设置事件监听器
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // 回到顶部
    elements.scrollTopBtn?.addEventListener('click', async () => {
        await executeAction('scrollToTop', '已回到页面顶部');
    });
    
    // 高亮链接
    elements.highlightLinksBtn?.addEventListener('click', async () => {
        await executeAction('highlightLinks', '链接高亮已切换');
    });
    
    // 复制URL
    elements.copyUrlBtn?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(state.currentTab.url);
            showStatus('✅ URL已复制到剪贴板', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            showStatus('❌ 复制失败: ' + error.message, 'error');
        }
    });
    
    // 显示图片信息
    elements.showImagesBtn?.addEventListener('click', async () => {
        try {
            const result = await sendMessageToTab({ action: 'getImageInfo' });
            if (result && result.images) {
                showImageInfo(result.images);
            } else {
                showStatus('⚠️ 未找到图片信息', 'error');
            }
        } catch (error) {
            console.error('获取图片信息失败:', error);
            showStatus('❌ 获取图片信息失败: ' + error.message, 'error');
        }
    });
    
    // 显示侧边栏
    elements.showSidebarBtn?.addEventListener('click', async () => {
        try {
            const result = await sendMessageToTab({ action: 'showSidebar' });
            if (result && result.success) {
                showStatus('📱 侧边栏已显示', 'success');
            } else {
                showStatus('❌ 显示侧边栏失败', 'error');
            }
        } catch (error) {
            console.error('显示侧边栏失败:', error);
            showStatus('❌ 显示侧边栏失败: ' + error.message, 'error');
        }
    });
    
    console.log('✅ Event listeners ready');
}

// 执行动作
async function executeAction(action, successMessage) {
    try {
        showStatus('⏳ 正在执行...', 'info');
        
        const result = await sendMessageToTab({ action });
        
        if (result && result.success !== false) {
            showStatus(`✅ ${successMessage}`, 'success');
        } else {
            throw new Error(result?.error || '操作失败');
        }
    } catch (error) {
        console.error(`Action ${action} failed:`, error);
        showStatus(`❌ 操作失败: ${error.message}`, 'error');
    }
}

// 发送消息到标签页
async function sendMessageToTab(message, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`📤 Attempt ${i + 1}: Sending message:`, message);
            
            const response = await chrome.tabs.sendMessage(state.currentTab.id, message);
            
            console.log(`📥 Attempt ${i + 1}: Response:`, response);
            return response;
            
        } catch (error) {
            console.warn(`⚠️ Attempt ${i + 1} failed:`, error.message);
            
            if (i === maxRetries - 1) {
                throw new Error(`通信失败 (${maxRetries} 次尝试): ${error.message}`);
            }
            
            // 等待后重试
            await sleep(200 * (i + 1));
        }
    }
}

// 显示图片信息
function showImageInfo(images) {
    if (!images || images.length === 0) {
        showStatus('⚠️ 页面中未找到图片', 'error');
        return;
    }
    
    let info = `📷 页面共有 ${images.length} 张图片:\n\n`;
    
    const displayCount = Math.min(images.length, 5);
    for (let i = 0; i < displayCount; i++) {
        const img = images[i];
        const src = img.src || '无源地址';
        const displaySrc = src.length > 50 ? src.substring(0, 50) + '...' : src;
        
        info += `${i + 1}. ${displaySrc}\n`;
        
        if (img.width && img.height) {
            info += `   📐 尺寸: ${img.width} × ${img.height}px\n`;
        }
        
        if (img.alt) {
            info += `   📝 描述: ${img.alt}\n`;
        }
        
        info += '\n';
    }
    
    if (images.length > 5) {
        info += `... 还有 ${images.length - 5} 张图片`;
    }
    
    alert(info);
}

// UI状态管理函数
function showLoading(message = '正在加载...') {
    elements.loading.style.display = 'block';
    
    // 更新loading消息 - 修复：直接设置HTML内容
    elements.loading.innerHTML = `
        <div class="spinner"></div>
        ${message}
    `;
    
    elements.pageInfo.style.display = 'none';
    elements.pageStats.style.display = 'none';
    elements.tools.style.display = 'none';
    elements.status.style.display = 'none';
}

function showContent() {
    elements.loading.style.display = 'none';
    elements.pageInfo.style.display = 'block';
    elements.pageStats.style.display = 'block';
    elements.tools.style.display = 'block';
}

function showError(message) {
    elements.loading.style.display = 'none';
    elements.pageInfo.style.display = 'none';
    elements.pageStats.style.display = 'none';
    elements.tools.style.display = 'none';
    
    showStatus(message, 'error', false);
}

function showStatus(message, type = 'info', autoHide = true) {
    elements.status.textContent = message;
    elements.status.className = `status ${type}`;
    elements.status.style.display = 'block';
    
    if (autoHide && type === 'success') {
        setTimeout(() => {
            if (elements.status.style.display !== 'none') {
                elements.status.style.display = 'none';
            }
        }, 3000);
    }
}

// 工具函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('🎉 Popup script loaded and ready');