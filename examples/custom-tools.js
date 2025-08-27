// custom-tools.js - 自定义工具示例
// 这个文件展示如何为网页工具箱添加自定义功能

/**
 * 示例1：添加新的页面分析工具
 * 分析页面的SEO相关信息
 */
function analyzeSEO() {
    const seoInfo = {
        title: document.title,
        titleLength: document.title.length,
        description: getMetaDescription(),
        headings: getHeadingStructure(),
        images: getImageSEOInfo(),
        links: getLinkAnalysis()
    };
    
    console.log('SEO分析结果:', seoInfo);
    return seoInfo;
}

function getMetaDescription() {
    const metaDesc = document.querySelector('meta[name="description"]');
    return metaDesc ? metaDesc.content : '未找到描述';
}

function getHeadingStructure() {
    const headings = [];
    for (let i = 1; i <= 6; i++) {
        const elements = document.querySelectorAll(`h${i}`);
        if (elements.length > 0) {
            headings.push({
                level: i,
                count: elements.length,
                texts: Array.from(elements).map(el => el.textContent.trim()).slice(0, 3)
            });
        }
    }
    return headings;
}

function getImageSEOInfo() {
    const images = document.querySelectorAll('img');
    let withAlt = 0;
    let withoutAlt = 0;
    
    images.forEach(img => {
        if (img.alt && img.alt.trim()) {
            withAlt++;
        } else {
            withoutAlt++;
        }
    });
    
    return {
        total: images.length,
        withAlt,
        withoutAlt,
        altCoverage: images.length ? ((withAlt / images.length) * 100).toFixed(1) + '%' : '0%'
    };
}

function getLinkAnalysis() {
    const links = document.querySelectorAll('a[href]');
    let internal = 0;
    let external = 0;
    const currentDomain = window.location.hostname;
    
    links.forEach(link => {
        const url = new URL(link.href, window.location.href);
        if (url.hostname === currentDomain) {
            internal++;
        } else {
            external++;
        }
    });
    
    return {
        total: links.length,
        internal,
        external
    };
}

/**
 * 示例2：页面性能分析工具
 */
function analyzePerformance() {
    const performance = window.performance;
    if (!performance || !performance.timing) {
        return { error: '浏览器不支持Performance API' };
    }
    
    const timing = performance.timing;
    const navigation = performance.navigation;
    
    return {
        // 页面加载时间
        pageLoadTime: timing.loadEventEnd - timing.navigationStart,
        
        // DOM解析时间
        domParseTime: timing.domContentLoadedEventEnd - timing.domLoading,
        
        // 资源加载时间
        resourceLoadTime: timing.loadEventEnd - timing.domContentLoadedEventEnd,
        
        // 网络延迟
        networkLatency: timing.responseStart - timing.fetchStart,
        
        // 导航类型
        navigationType: getNavigationType(navigation.type),
        
        // 重定向次数
        redirectCount: navigation.redirectCount,
        
        // 资源统计
        resources: getResourceStats()
    };
}

function getNavigationType(type) {
    const types = {
        0: '点击链接、地址栏输入、表单提交、脚本操作等',
        1: '点击刷新页面按钮或者调用location.reload()',
        2: '页面通过历史记录和前进后退访问时'
    };
    return types[type] || '未知';
}

function getResourceStats() {
    if (!window.performance.getEntriesByType) {
        return { error: '浏览器不支持Resource Timing API' };
    }
    
    const resources = performance.getEntriesByType('resource');
    const stats = {
        total: resources.length,
        byType: {},
        slowest: null,
        largest: null
    };
    
    let maxDuration = 0;
    let maxSize = 0;
    
    resources.forEach(resource => {
        // 按类型分类
        const type = getResourceType(resource.name);
        stats.byType[type] = (stats.byType[type] || 0) + 1;
        
        // 找出最慢的资源
        if (resource.duration > maxDuration) {
            maxDuration = resource.duration;
            stats.slowest = {
                name: resource.name,
                duration: resource.duration.toFixed(2) + 'ms'
            };
        }
        
        // 找出最大的资源
        if (resource.transferSize > maxSize) {
            maxSize = resource.transferSize;
            stats.largest = {
                name: resource.name,
                size: formatBytes(resource.transferSize)
            };
        }
    });
    
    return stats;
}

function getResourceType(url) {
    const extension = url.split('.').pop().toLowerCase();
    const typeMap = {
        'js': 'JavaScript',
        'css': 'CSS',
        'png': '图片',
        'jpg': '图片',
        'jpeg': '图片',
        'gif': '图片',
        'svg': '图片',
        'woff': '字体',
        'woff2': '字体',
        'ttf': '字体',
        'eot': '字体'
    };
    return typeMap[extension] || '其他';
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 示例3：页面无障碍性检查
 */
function checkAccessibility() {
    const issues = [];
    
    // 检查图片alt属性
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
        issues.push({
            type: '图片无障碍',
            severity: '中等',
            count: imagesWithoutAlt.length,
            message: `发现${imagesWithoutAlt.length}张图片缺少alt属性`
        });
    }
    
    // 检查空链接
    const emptyLinks = document.querySelectorAll('a:not([href]), a[href=""], a[href="#"]');
    if (emptyLinks.length > 0) {
        issues.push({
            type: '链接无障碍',
            severity: '低',
            count: emptyLinks.length,
            message: `发现${emptyLinks.length}个空链接或无效链接`
        });
    }
    
    // 检查表单标签
    const inputsWithoutLabels = document.querySelectorAll('input:not([id]):not([aria-label]):not([aria-labelledby])');
    if (inputsWithoutLabels.length > 0) {
        issues.push({
            type: '表单无障碍',
            severity: '高',
            count: inputsWithoutLabels.length,
            message: `发现${inputsWithoutLabels.length}个输入框缺少标签`
        });
    }
    
    // 检查标题结构
    const headingIssues = checkHeadingStructure();
    if (headingIssues.length > 0) {
        issues.push(...headingIssues);
    }
    
    return {
        total: issues.length,
        issues: issues,
        score: calculateAccessibilityScore(issues)
    };
}

function checkHeadingStructure() {
    const issues = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length === 0) {
        issues.push({
            type: '标题结构',
            severity: '高',
            message: '页面没有标题结构'
        });
        return issues;
    }
    
    let prevLevel = 0;
    let h1Count = 0;
    
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        
        if (heading.tagName === 'H1') {
            h1Count++;
        }
        
        // 检查标题跳级
        if (prevLevel > 0 && level > prevLevel + 1) {
            issues.push({
                type: '标题结构',
                severity: '中等',
                message: `标题级别跳跃：从H${prevLevel}直接到H${level}`
            });
        }
        
        prevLevel = level;
    });
    
    // 检查H1数量
    if (h1Count === 0) {
        issues.push({
            type: '标题结构',
            severity: '高',
            message: '页面缺少H1标题'
        });
    } else if (h1Count > 1) {
        issues.push({
            type: '标题结构',
            severity: '中等',
            message: `页面有${h1Count}个H1标题，建议只有一个`
        });
    }
    
    return issues;
}

function calculateAccessibilityScore(issues) {
    let score = 100;
    
    issues.forEach(issue => {
        switch (issue.severity) {
            case '高':
                score -= 15;
                break;
            case '中等':
                score -= 10;
                break;
            case '低':
                score -= 5;
                break;
        }
    });
    
    return Math.max(0, score);
}

/**
 * 示例4：颜色分析工具
 */
function analyzeColors() {
    const elements = document.querySelectorAll('*');
    const colors = {
        background: new Set(),
        text: new Set(),
        border: new Set()
    };
    
    elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        
        // 收集背景色
        const bgColor = styles.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            colors.background.add(bgColor);
        }
        
        // 收集文字颜色
        const textColor = styles.color;
        if (textColor) {
            colors.text.add(textColor);
        }
        
        // 收集边框颜色
        const borderColor = styles.borderColor;
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
            colors.border.add(borderColor);
        }
    });
    
    return {
        backgroundColors: Array.from(colors.background),
        textColors: Array.from(colors.text),
        borderColors: Array.from(colors.border),
        totalUniqueColors: colors.background.size + colors.text.size + colors.border.size
    };
}

/**
 * 将这些工具集成到侧边栏的示例代码
 */
function addCustomToolsToSidebar() {
    // 这个函数展示如何将自定义工具添加到现有的侧边栏中
    
    const toolsSection = document.querySelector('.webtoolbox-section:last-child .webtoolbox-content');
    if (!toolsSection) return;
    
    // 添加SEO分析按钮
    const seoButton = document.createElement('button');
    seoButton.className = 'webtoolbox-button';
    seoButton.textContent = 'SEO分析';
    seoButton.addEventListener('click', () => {
        const result = analyzeSEO();
        console.log('SEO分析结果:', result);
        alert(`SEO分析完成！\n标题长度: ${result.titleLength}\n图片Alt覆盖率: ${result.images.altCoverage}`);
    });
    
    // 添加性能分析按钮
    const perfButton = document.createElement('button');
    perfButton.className = 'webtoolbox-button';
    perfButton.textContent = '性能分析';
    perfButton.addEventListener('click', () => {
        const result = analyzePerformance();
        console.log('性能分析结果:', result);
        alert(`性能分析完成！\n页面加载时间: ${result.pageLoadTime}ms\nDOM解析时间: ${result.domParseTime}ms`);
    });
    
    // 添加无障碍检查按钮
    const a11yButton = document.createElement('button');
    a11yButton.className = 'webtoolbox-button';
    a11yButton.textContent = '无障碍检查';
    a11yButton.addEventListener('click', () => {
        const result = checkAccessibility();
        console.log('无障碍检查结果:', result);
        alert(`无障碍检查完成！\n发现问题: ${result.total}个\n无障碍评分: ${result.score}分`);
    });
    
    // 将按钮添加到工具栏
    toolsSection.appendChild(seoButton);
    toolsSection.appendChild(perfButton);
    toolsSection.appendChild(a11yButton);
}

// 导出函数供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        analyzeSEO,
        analyzePerformance,
        checkAccessibility,
        analyzeColors,
        addCustomToolsToSidebar
    };
}

// 在页面加载完成后自动添加自定义工具（可选）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addCustomToolsToSidebar, 2000); // 延迟2秒确保侧边栏已加载
    });
} else {
    setTimeout(addCustomToolsToSidebar, 2000);
}