// 调试脚本，用于在移动设备上显示调试信息
(function() {
    // 创建调试面板
    function createDebugPanel() {
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            font-size: 12px;
            padding: 5px;
            z-index: 9999;
            max-height: 30%;
            overflow-y: auto;
            display: none;
        `;
        
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Debug';
        toggleButton.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            z-index: 10000;
            font-size: 12px;
        `;
        
        document.body.appendChild(debugPanel);
        document.body.appendChild(toggleButton);
        
        toggleButton.addEventListener('click', function() {
            if (debugPanel.style.display === 'none') {
                debugPanel.style.display = 'block';
            } else {
                debugPanel.style.display = 'none';
            }
        });
        
        return debugPanel;
    }
    
    // 添加日志
    function log(message) {
        if (!window.debugPanel) {
            window.debugPanel = createDebugPanel();
        }
        
        const logEntry = document.createElement('div');
        logEntry.textContent = `${new Date().toISOString().substr(11, 8)}: ${message}`;
        window.debugPanel.appendChild(logEntry);
        
        // 自动滚动到底部
        window.debugPanel.scrollTop = window.debugPanel.scrollHeight;
    }
    
    // 重写console.log
    const originalConsoleLog = console.log;
    console.log = function() {
        originalConsoleLog.apply(console, arguments);
        const message = Array.from(arguments).map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
        log(message);
    };
    
    // 监听事件
    document.addEventListener('DOMContentLoaded', function() {
        log('页面加载完成');
        
        // 监听按钮点击事件
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('next-btn')) {
                log('点击了下一页按钮');
            } else if (e.target.classList.contains('restart-btn')) {
                log('点击了重新开始按钮');
            }
        }, true);
        
        // 监听触摸事件
        document.addEventListener('touchstart', function(e) {
            if (e.target.classList.contains('next-btn') || e.target.classList.contains('restart-btn')) {
                log(`触摸开始: ${e.target.className}`);
            }
        }, true);
        
        document.addEventListener('touchend', function(e) {
            if (e.target.classList.contains('next-btn') || e.target.classList.contains('restart-btn')) {
                log(`触摸结束: ${e.target.className}`);
            }
        }, true);
        
        // 监听Swiper事件
        window.addEventListener('load', function() {
            if (typeof swiper !== 'undefined' && swiper) {
                log('Swiper已初始化');
                
                swiper.on('slideChange', function() {
                    log(`幻灯片切换到: ${this.activeIndex + 1}`);
                });
            } else {
                log('Swiper未初始化');
            }
        });
    });
})();
