// 修改Swiper配置，允许内容滚动
document.addEventListener('DOMContentLoaded', function() {
    console.log('Swiper滚动优化脚本已加载');
    
    // 等待页面加载完成
    window.addEventListener('load', function() {
        console.log('页面加载完成，开始优化Swiper滚动');
        
        // 确保Swiper已初始化
        setTimeout(function() {
            // 检查是否是移动设备
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isMobile && typeof window.swiper !== 'undefined' && window.swiper) {
                console.log('检测到移动设备，优化Swiper滚动');
                
                // 为每个页面内容添加滚动事件处理
                const contents = document.querySelectorAll('.content');
                
                contents.forEach(function(content) {
                    // 添加触摸事件处理
                    let startY = 0;
                    let startTime = 0;
                    let isScrolling = false;
                    
                    content.addEventListener('touchstart', function(e) {
                        startY = e.touches[0].clientY;
                        startTime = Date.now();
                        isScrolling = false;
                    }, { passive: true });
                    
                    content.addEventListener('touchmove', function(e) {
                        const currentY = e.touches[0].clientY;
                        const deltaY = currentY - startY;
                        
                        // 检查内容是否可滚动
                        const canScrollUp = this.scrollTop > 0;
                        const canScrollDown = this.scrollTop < this.scrollHeight - this.clientHeight;
                        
                        // 如果内容可以在当前方向上滚动，则阻止Swiper处理触摸事件
                        if ((deltaY < 0 && canScrollDown) || (deltaY > 0 && canScrollUp)) {
                            isScrolling = true;
                            window.swiper.allowTouchMove = false;
                        } else {
                            window.swiper.allowTouchMove = true;
                        }
                    }, { passive: true });
                    
                    content.addEventListener('touchend', function(e) {
                        // 恢复Swiper的触摸滑动功能
                        setTimeout(function() {
                            window.swiper.allowTouchMove = false; // 保持禁用，使用按钮翻页
                        }, 100);
                        
                        // 如果是滚动操作，阻止触发点击事件
                        if (isScrolling) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }, { passive: false });
                });
                
                console.log('Swiper滚动优化完成');
            }
        }, 1500);
    });
});
