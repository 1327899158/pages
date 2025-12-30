// 添加滚动指示器，帮助用户知道页面可以滚动
document.addEventListener('DOMContentLoaded', function() {
    console.log('滚动指示器脚本已加载');
    
    // 检测是否是移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('检测到移动设备，添加滚动指示器');
        
        // 为每个页面添加滚动指示器
        function addScrollIndicators() {
            const pages = document.querySelectorAll('.swiper-slide');
            
            pages.forEach(function(page) {
                // 检查页面内容高度是否超过视口高度
                const content = page.querySelector('.content');
                if (!content) return;
                
                // 创建滚动指示器
                const indicator = document.createElement('div');
                indicator.className = 'scroll-indicator';
                indicator.style.display = 'none'; // 默认隐藏
                
                // 添加到页面
                page.appendChild(indicator);
                
                // 检查是否需要显示滚动指示器
                function checkScrollNeeded() {
                    if (content.scrollHeight > window.innerHeight) {
                        indicator.style.display = 'flex';
                    } else {
                        indicator.style.display = 'none';
                    }
                }
                
                // 初始检查
                setTimeout(checkScrollNeeded, 500);
                
                // 监听窗口大小变化
                window.addEventListener('resize', checkScrollNeeded);
                
                // 监听页面滚动
                content.addEventListener('scroll', function() {
                    // 如果已经滚动到底部附近，隐藏指示器
                    if (content.scrollTop + content.clientHeight >= content.scrollHeight - 100) {
                        indicator.style.display = 'none';
                    } else if (content.scrollHeight > window.innerHeight) {
                        indicator.style.display = 'flex';
                    }
                });
            });
        }
        
        // 在页面加载完成后添加滚动指示器
        window.addEventListener('load', function() {
            setTimeout(addScrollIndicators, 1000);
        });
        
        // 监听Swiper幻灯片变化，检查当前页面是否需要滚动指示器
        if (typeof window.swiper !== 'undefined' && window.swiper) {
            window.swiper.on('slideChangeTransitionEnd', function() {
                const currentIndex = this.activeIndex;
                const currentPage = document.querySelectorAll('.swiper-slide')[currentIndex];
                if (!currentPage) return;
                
                const content = currentPage.querySelector('.content');
                const indicator = currentPage.querySelector('.scroll-indicator');
                
                if (content && indicator) {
                    if (content.scrollHeight > window.innerHeight) {
                        indicator.style.display = 'flex';
                    } else {
                        indicator.style.display = 'none';
                    }
                }
            });
        }
    }
});
