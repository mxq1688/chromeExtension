// background.js - Service Worker (Manifest V3)

console.log('🛠️ [网页工具箱] Service worker started');

// 安装事件
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details.reason);
    
    if (details.reason === 'install') {
        console.log('First time installation');
    } else if (details.reason === 'update') {
        console.log('Extension updated');
    }
});

// 启动事件
chrome.runtime.onStartup.addListener(() => {
    console.log('Extension startup');
});

// 扩展程序图标点击事件（如果需要的话）
chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked on:', tab.url);
    // 默认会打开popup，这里可以添加额外逻辑
});

// 消息处理（从content script或popup发来的消息）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    try {
        switch (request.action) {
            case 'ping':
                sendResponse({ status: 'pong' });
                break;
                
            case 'getExtensionInfo':
                sendResponse({
                    version: chrome.runtime.getManifest().version,
                    name: chrome.runtime.getManifest().name
                });
                break;
                
            default:
                console.log('Unknown action in background:', request.action);
                sendResponse({ error: 'Unknown action' });
        }
    } catch (error) {
        console.error('Background message error:', error);
        sendResponse({ error: error.message });
    }
    
    return true; // 保持消息通道开放
});

// 标签页更新监听
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('Tab updated:', tab.url);
        // 可以在这里做一些初始化工作
    }
});

// 标签页激活监听
chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log('Tab activated:', activeInfo.tabId);
});

// 窗口焦点变化监听
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
        console.log('Window focused:', windowId);
    }
});

// 存储数据的辅助函数
async function setStorage(key, value) {
    try {
        await chrome.storage.local.set({ [key]: value });
        console.log(`Storage set: ${key}`);
    } catch (error) {
        console.error('Storage set error:', error);
    }
}

// 获取存储数据的辅助函数
async function getStorage(key) {
    try {
        const result = await chrome.storage.local.get(key);
        return result[key];
    } catch (error) {
        console.error('Storage get error:', error);
        return null;
    }
}

// 清理存储的辅助函数
async function clearStorage() {
    try {
        await chrome.storage.local.clear();
        console.log('Storage cleared');
    } catch (error) {
        console.error('Storage clear error:', error);
    }
}

// 导出函数供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setStorage,
        getStorage,
        clearStorage
    };
}

// 错误处理
self.addEventListener('error', (error) => {
    console.error('Service worker error:', error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service worker unhandled rejection:', event.reason);
});

console.log('🎉 [网页工具箱] Service worker ready');