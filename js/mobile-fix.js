// 移动设备兼容性修复
console.log('移动设备兼容性修复脚本已加载');

document.addEventListener('DOMContentLoaded', function() {
    console.log('页面DOM已加载完成');
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
        console.log('找到按钮数量:', elements.length);
        
        Array.from(elements).forEach(function(element, index) {
            console.log('添加事件到按钮:', index, element.className);
            
            // 直接添加点击事件
            element.onclick = function(e) {
                console.log('按钮被点击:', index);
                e.preventDefault();
                // 如果是重新开始按钮
                if (element.classList.contains('restart-btn')) {
                    console.log('重新开始按钮被点击');
                    window.currentPage = 0;
                    showPage(0);
                } else {
                    console.log('下一页按钮被点击, 当前页:', window.currentPage);
                    if (window.currentPage < window.totalPages - 1) {
                        showPage(window.currentPage + 1);
                    }
                }
                return false;
            };
            
            element.addEventListener('touchstart', function() {
                console.log('按钮 touchstart:', index);
                this.classList.add('touch-active');
            }, { passive: false });
            
            element.addEventListener('touchend', function(e) {
                console.log('按钮 touchend:', index);
                this.classList.remove('touch-active');
                e.preventDefault();
                // 触发点击事件
                element.click();
            }, { passive: false });
            
            element.addEventListener('touchcancel', function() {
                console.log('按钮 touchcancel:', index);
                this.classList.remove('touch-active');
            }, { passive: true });
        });
    };
    
    // 应用于所有按钮
    addTouchFeedback(document.querySelectorAll('.next-btn, .restart-btn'));
    
    // 全局函数
    window.showPage = function(index) {
        console.log('外部调用showPage:', index);
        const pages = document.querySelectorAll('.swiper-slide');
        
        // 隐藏所有页面
        pages.forEach(function(page) {
            page.classList.remove('active');
        });
        
        // 显示当前页面
        if (pages[index]) {
            pages[index].classList.add('active');
            // 触发动画
            if (typeof window.animateSlide === 'function') {
                window.animateSlide(index);
            }
        }
        
        // 更新当前页码
        window.currentPage = index;
    };
    
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
