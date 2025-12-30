// 专门解决移动设备上按钮点击失灵问题
document.addEventListener('DOMContentLoaded', function() {
    console.log('触摸修复脚本已加载');
    
    // 直接绑定触摸事件到所有按钮
    const allButtons = document.querySelectorAll('.next-btn, .restart-btn');
    
    allButtons.forEach(function(button) {
        // 移除现有的事件监听器
        const buttonClone = button.cloneNode(true);
        button.parentNode.replaceChild(buttonClone, button);
        
        // 添加新的事件监听器
        buttonClone.addEventListener('touchstart', function(e) {
            console.log('按钮触摸开始');
            this.classList.add('touch-active');
        }, { passive: true });
        
        buttonClone.addEventListener('touchend', function(e) {
            console.log('按钮触摸结束');
            e.preventDefault(); // 阻止默认行为
            this.classList.remove('touch-active');
            
            // 获取按钮类型并执行相应操作
            if (this.classList.contains('next-btn')) {
                console.log('执行下一页操作');
                if (typeof swiper !== 'undefined' && swiper) {
                    swiper.slideNext();
                    if (typeof resetAutoSlideTimer === 'function') {
                        resetAutoSlideTimer();
                    }
                }
            } else if (this.classList.contains('restart-btn')) {
                console.log('执行重新开始操作');
                if (typeof swiper !== 'undefined' && swiper) {
                    swiper.slideTo(0);
                    if (typeof resetAutoSlideTimer === 'function') {
                        resetAutoSlideTimer();
                    }
                }
            }
        });
        
        // 防止点击事件被触发两次
        buttonClone.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('阻止点击事件重复触发');
        });
    });
    
    // 监听DOM变化，为新添加的按钮绑定事件
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // 元素节点
                        const newButtons = node.querySelectorAll('.next-btn, .restart-btn');
                        if (newButtons.length) {
                            console.log('检测到新按钮，添加触摸事件');
                            newButtons.forEach(function(button) {
                                button.addEventListener('touchend', function(e) {
                                    e.preventDefault();
                                    if (this.classList.contains('next-btn')) {
                                        if (typeof swiper !== 'undefined' && swiper) {
                                            swiper.slideNext();
                                        }
                                    } else if (this.classList.contains('restart-btn')) {
                                        if (typeof swiper !== 'undefined' && swiper) {
                                            swiper.slideTo(0);
                                        }
                                    }
                                });
                            });
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('触摸修复脚本初始化完成');
});
