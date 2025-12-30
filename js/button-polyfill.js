// 按钮兼容性修复脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('按钮兼容性修复脚本已加载');
    
    // 创建一个隐藏的按钮层，用于捕获触摸事件
    function createButtonOverlays() {
        console.log('创建按钮覆盖层');
        
        // 获取所有按钮
        const buttons = document.querySelectorAll('.next-btn, .restart-btn');
        
        buttons.forEach(function(button, index) {
            // 获取按钮位置
            const rect = button.getBoundingClientRect();
            
            // 创建覆盖层
            const overlay = document.createElement('div');
            overlay.className = 'button-overlay';
            overlay.id = `button-overlay-${index}`;
            overlay.dataset.buttonType = button.classList.contains('next-btn') ? 'next' : 'restart';
            
            // 设置样式
            overlay.style.cssText = `
                position: absolute;
                top: ${rect.top}px;
                left: ${rect.left}px;
                width: ${rect.width + 40}px;
                height: ${rect.height + 40}px;
                background-color: transparent;
                z-index: 1000;
                transform: translate(-20px, -20px);
            `;
            
            // 添加到DOM
            document.body.appendChild(overlay);
            
            // 添加触摸事件
            overlay.addEventListener('touchstart', function(e) {
                console.log(`覆盖层 ${this.id} 触摸开始`);
                button.classList.add('touch-active');
                e.preventDefault();
            }, { passive: false });
            
            overlay.addEventListener('touchend', function(e) {
                console.log(`覆盖层 ${this.id} 触摸结束`);
                button.classList.remove('touch-active');
                e.preventDefault();
                
                // 执行按钮操作
                const buttonType = this.dataset.buttonType;
                if (buttonType === 'next') {
                    console.log('执行下一页操作');
                    if (typeof window.swiper !== 'undefined' && window.swiper) {
                        window.swiper.slideNext();
                    }
                } else if (buttonType === 'restart') {
                    console.log('执行重新开始操作');
                    if (typeof window.swiper !== 'undefined' && window.swiper) {
                        window.swiper.slideTo(0);
                    }
                }
            }, { passive: false });
        });
        
        console.log('按钮覆盖层创建完成');
    }
    
    // 在页面加载完成后创建覆盖层
    window.addEventListener('load', function() {
        setTimeout(createButtonOverlays, 1000);
        
        // 监听窗口大小变化，重新创建覆盖层
        window.addEventListener('resize', function() {
            // 移除现有覆盖层
            document.querySelectorAll('.button-overlay').forEach(function(overlay) {
                overlay.parentNode.removeChild(overlay);
            });
            
            // 重新创建覆盖层
            setTimeout(createButtonOverlays, 500);
        });
        
        // 监听Swiper幻灯片变化，重新创建覆盖层
        if (typeof window.swiper !== 'undefined' && window.swiper) {
            window.swiper.on('slideChangeTransitionEnd', function() {
                // 移除现有覆盖层
                document.querySelectorAll('.button-overlay').forEach(function(overlay) {
                    overlay.parentNode.removeChild(overlay);
                });
                
                // 重新创建覆盖层
                setTimeout(createButtonOverlays, 500);
            });
        }
    });
});
