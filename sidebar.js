// sidebar.js - 侧边栏功能脚本

console.log('🛠️ [网页工具箱] Sidebar script loaded');

// 侧边栏状态管理
let sidebarVisible = false;
let pageData = null;

// DOM元素
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarContainer = document.getElementById('sidebarContainer');
const closeSidebar = document.getElementById('closeSidebar');
const loading = document.getElementById('loading');

// 页面信息元素
const pageInfo = document.getElementById('page-info');
const pageStats = document.getElementById('page-stats');
const pageTitle = document.getElementById('page-title');
const pageUrl = document.getElementById('page-url');
const pageDomain = document.getElementById('page-domain');
const pageProtocol = document.getElementById('page-protocol');
const imageCount = document.getElementById('image-count');
const linkCount = document.getElementById('link-count');
const scriptCount = document.getElementById('script-count');

// 工具按钮
const scrollToTopBtn = document.getElementById('scroll-to-top');
const highlightLinksBtn = document.getElementById('highlight-links');
const showImagesBtn = document.getElementById('show-images');
const copyUrlBtn = document.getElementById('copy-url');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sidebar DOM loaded');
    initializeEventListeners();
    loadPageData();
});

// 事件监听器
function initializeEventListeners() {
    // 切换侧边栏
    sidebarToggle.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', hideSidebar);
    
    // 工具按钮事件
    scrollToTopBtn.addEventListener('click', scrollToTop);
    highlightLinksBtn.addEventListener('click', highlightAllLinks);
    showImagesBtn.addEventListener('click', showImageInfo);
    copyUrlBtn.addEventListener('click', copyCurrentUrl);
    
    // 点击侧边栏外部关闭
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

// 切换侧边栏显示/隐藏
function toggleSidebar() {
    if (sidebarVisible) {
        hideSidebar();
    } else {
        showSidebar();
    }
}

// 显示侧边栏
function showSidebar() {
    sidebarContainer.classList.add('active');
    sidebarVisible = true;
    sidebarToggle.style.right = '360px';
    
    // 加载最新页面数据
    loadPageData();
}

// 隐藏侧边栏
function hideSidebar() {
    sidebarContainer.classList.remove('active');
    sidebarVisible = false;
    sidebarToggle.style.right = '10px';
}

// 加载页面数据
function loadPageData() {
    // 显示加载状态
    loading.style.display = 'block';
    pageInfo.style.display = 'none';
    pageStats.style.display = 'none';
    
    // 模拟数据加载（实际项目中会从content script获取）
    setTimeout(() => {
        pageData = {
            title: document.title || '未知标题',
            url: window.location.href,
            domain: window.location.hostname,
            protocol: window.location.protocol,
            imageCount: document.querySelectorAll('img').length,
            linkCount: document.querySelectorAll('a').length,
            scriptCount: document.querySelectorAll('script').length
        };
        
        updatePageInfo();
        
        // 隐藏加载，显示内容
        loading.style.display = 'none';
        pageInfo.style.display = 'block';
        pageStats.style.display = 'block';
    }, 1000);
}

// 更新页面信息显示
function updatePageInfo() {
    if (!pageData) return;
    
    pageTitle.textContent = pageData.title;
    pageUrl.textContent = pageData.url;
    pageDomain.textContent = pageData.domain;
    pageProtocol.textContent = pageData.protocol;
    imageCount.textContent = pageData.imageCount;
    linkCount.textContent = pageData.linkCount;
    scriptCount.textContent = pageData.scriptCount;
}

// 工具函数
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    showNotification('已回到页面顶部');
}

function highlightAllLinks() {
    const links = document.querySelectorAll('a');
    const isHighlighted = document.querySelector('a[data-toolbox-highlighted]');
    
    if (isHighlighted) {
        // 移除高亮
        links.forEach(link => {
            link.style.backgroundColor = '';
            link.style.border = '';
            link.removeAttribute('data-toolbox-highlighted');
        });
        showNotification('已取消链接高亮');
        highlightLinksBtn.textContent = '高亮所有链接';
    } else {
        // 添加高亮
        links.forEach(link => {
            link.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
            link.style.border = '2px solid #ffff00';
            link.setAttribute('data-toolbox-highlighted', 'true');
        });
        showNotification(`已高亮 ${links.length} 个链接`);
        highlightLinksBtn.textContent = '取消链接高亮';
    }
}

function showImageInfo() {
    const images = document.querySelectorAll('img');
    let info = `页面共有 ${images.length} 张图片:\n\n`;
    
    images.forEach((img, index) => {
        info += `${index + 1}. ${img.src || '无源地址'}\n`;
        info += `   尺寸: ${img.width || '未知'}x${img.height || '未知'}\n`;
        info += `   Alt: ${img.alt || '无描述'}\n\n`;
    });
    
    alert(info);
}

function copyCurrentUrl() {
    const url = window.location.href;
    
    // 使用现代的Clipboard API
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('URL已复制到剪贴板');
        }).catch(() => {
            fallbackCopyUrl(url);
        });
    } else {
        fallbackCopyUrl(url);
    }
}

function fallbackCopyUrl(url) {
    // 备用复制方法
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
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
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 2147483647;
        transform: translateX(100%);
        transition: transform 0.3s ease;
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
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 导出函数供外部调用
window.webToolboxSidebar = {
    show: showSidebar,
    hide: hideSidebar,
    toggle: toggleSidebar,
    updateData: loadPageData
};