// 移动设备兼容性修复
document.addEventListener('DOMContentLoaded', function() {
    // 修复iOS设备上的点击延迟
    if ('ontouchstart' in window) {
        // 添加FastClick以消除300ms延迟
        const attachFastClick = function() {
            if (typeof FastClick !== 'undefined') {
                FastClick.attach(document.body);
            }
        };
        
        // 如果已加载FastClick则直接使用，否则动态加载
        if (typeof FastClick === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fastclick/1.0.6/fastclick.min.js';
            script.onload = attachFastClick;
            document.head.appendChild(script);
        } else {
            attachFastClick();
        }
    }
    
    // 为所有按钮添加触摸反馈
    const addTouchFeedback = function(elements) {
        Array.from(elements).forEach(function(element) {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
            
            element.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
        });
    };
    
    // 应用于所有按钮
    addTouchFeedback(document.querySelectorAll('.next-btn, .restart-btn'));
    
    // 防止页面缩放
    document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // 修复某些Android设备上的点击问题
    const buttons = document.querySelectorAll('.next-btn, .restart-btn');
    buttons.forEach(function(button) {
        button.addEventListener('touchstart', function(e) {
            e.preventDefault();
            // 标记此元素已被触摸
            this.setAttribute('data-touched', 'true');
        });
    });
});
