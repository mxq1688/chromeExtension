// background.js - Chrome插件后台服务脚本

console.log('🛠️ [网页工具箱] Background script loaded');

// 插件安装时的处理
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details);
    
    if (details.reason === 'install') {
        // 首次安装
        console.log('First time installation');
        
        // 设置默认配置
        chrome.storage.sync.set({
            extensionEnabled: true,
            highlightColor: '#ffff00',
            showNotifications: true,
            installDate: new Date().toISOString()
        });
        
        // 可以打开欢迎页面
        // chrome.tabs.create({ url: 'welcome.html' });
    } else if (details.reason === 'update') {
        // 更新时
        console.log('Extension updated from version:', details.previousVersion);
    }
    
    // 创建右键菜单项
    try {
        chrome.contextMenus.create({
            id: 'webToolbox',
            title: '网页工具箱',
            contexts: ['page', 'selection', 'link', 'image']
        });
        
        chrome.contextMenus.create({
            id: 'copyPageInfo',
            parentId: 'webToolbox',
            title: '复制页面信息',
            contexts: ['page']
        });
        
        chrome.contextMenus.create({
            id: 'highlightText',
            parentId: 'webToolbox',
            title: '高亮选中文本',
            contexts: ['selection']
        });
    } catch (error) {
        console.error('Failed to create context menus:', error);
    }
});

// 插件启动时的处理
chrome.runtime.onStartup.addListener(() => {
    console.log('Extension startup');
});

// 监听来自content script或popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request, 'from:', sender);
    
    switch (request.action) {
        case 'getExtensionInfo':
            sendResponse({
                version: chrome.runtime.getManifest().version,
                name: chrome.runtime.getManifest().name
            });
            break;
            
        case 'saveSettings':
            chrome.storage.sync.set(request.settings, () => {
                sendResponse({ success: true });
            });
            break;
            
        case 'getSettings':
            chrome.storage.sync.get(null, (settings) => {
                sendResponse(settings);
            });
            break;
            
        case 'logActivity':
            logActivity(request.activity);
            sendResponse({ success: true });
            break;
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
    
    return true; // 保持消息通道开放
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        console.log('Tab updated:', tab.url);
        
        // 可以在这里添加页面加载完成后的逻辑
        // 例如：检查页面类型、注入特定脚本等
        
        // 记录访问的网站（仅记录非敏感页面）
        if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
            logActivity({
                type: 'page_visit',
                url: tab.url,
                title: tab.title,
                timestamp: new Date().toISOString()
            });
        }
    }
});

// 监听标签页激活
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab && tab.url) {
            console.log('Tab activated:', tab.url);
        }
    });
});

// 右键菜单在上面的onInstalled监听器中已经创建，移除重复的监听器

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log('Context menu clicked:', info.menuItemId);
    
    switch (info.menuItemId) {
        case 'copyPageInfo':
            copyPageInfo(tab);
            break;
            
        case 'highlightText':
            highlightSelectedText(tab, info.selectionText);
            break;
    }
});

// 复制页面信息到剪贴板
async function copyPageInfo(tab) {
    const pageInfo = `页面标题: ${tab.title}\nURL: ${tab.url}\n访问时间: ${new Date().toLocaleString()}`;
    
    try {
        // 通过content script复制到剪贴板
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'copyToClipboard',
            text: pageInfo
        });
        
        if (response && response.success) {
            // 显示通知
            showNotification('页面信息已复制到剪贴板');
        } else {
            throw new Error('Content script failed to copy');
        }
    } catch (error) {
        console.error('Failed to copy page info:', error);
        showNotification('复制失败，请稍后重试');
    }
}

// 高亮选中的文本
async function highlightSelectedText(tab, text) {
    try {
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'highlightSelectedText',
            text: text
        });
        
        if (response && response.success) {
            showNotification('文本已高亮');
        } else {
            throw new Error('Content script failed to highlight text');
        }
    } catch (error) {
        console.error('Failed to highlight text:', error);
        showNotification('高亮失败，请稍后重试');
    }
}

// 显示通知
function showNotification(message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '网页工具箱',
        message: message
    });
}

// 记录活动日志
function logActivity(activity) {
    // 获取现有日志
    chrome.storage.local.get(['activityLog'], (result) => {
        const log = result.activityLog || [];
        
        // 添加新活动
        log.push(activity);
        
        // 保持最近100条记录
        if (log.length > 100) {
            log.splice(0, log.length - 100);
        }
        
        // 保存日志
        chrome.storage.local.set({ activityLog: log });
    });
}

// 定期清理存储（可选）
chrome.alarms.create('cleanupStorage', { periodInMinutes: 60 * 24 }); // 每天执行一次

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanupStorage') {
        cleanupStorage();
    }
});

function cleanupStorage() {
    chrome.storage.local.get(['activityLog'], (result) => {
        const log = result.activityLog || [];
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        // 删除一周前的记录
        const filteredLog = log.filter(activity => {
            return new Date(activity.timestamp) > oneWeekAgo;
        });
        
        chrome.storage.local.set({ activityLog: filteredLog });
        console.log('Storage cleanup completed');
    });
}
