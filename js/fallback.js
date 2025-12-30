// 备用方案，确保在Swiper初始化失败时页面仍然可以正常显示和操作
document.addEventListener('DOMContentLoaded', function() {
    // 等待页面完全加载
    window.addEventListener('load', function() {
        // 检查Swiper是否正常初始化
        setTimeout(function() {
            console.log('检查页面是否正常显示');
            
            // 获取所有幻灯片
            const slides = document.querySelectorAll('.swiper-slide');
            let anySlideVisible = false;
            
            // 检查是否有任何幻灯片可见
            slides.forEach(function(slide) {
                if (window.getComputedStyle(slide).display !== 'none') {
                    anySlideVisible = true;
                }
            });
            
            // 如果没有幻灯片可见，显示第一页
            if (!anySlideVisible && slides.length > 0) {
                console.log('没有幻灯片可见，显示第一页');
                
                // 隐藏所有幻灯片
                slides.forEach(function(slide) {
                    slide.style.display = 'none';
                });
                
                // 显示第一页
                slides[0].style.display = 'flex';
                
                // 如果animateSlide函数存在，触发动画
                if (typeof window.animateSlide === 'function') {
                    window.animateSlide(0);
                }
                
                // 为所有按钮添加事件处理
                setupButtonEvents();
            }
        }, 3000); // 等待3秒，确保Swiper有足够时间初始化
    });
});

// 为所有按钮设置事件处理
function setupButtonEvents() {
    // 获取所有幻灯片和按钮
    const slides = document.querySelectorAll('.swiper-slide');
    const nextButtons = document.querySelectorAll('.next-btn');
    const restartButton = document.querySelector('.restart-btn');
    
    // 为下一页按钮添加事件处理
    nextButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取当前页面索引
            let currentIndex = -1;
            slides.forEach(function(slide, index) {
                if (window.getComputedStyle(slide).display !== 'none') {
                    currentIndex = index;
                }
            });
            
            // 如果找到当前页面，切换到下一页
            if (currentIndex >= 0 && currentIndex < slides.length - 1) {
                // 隐藏当前页面
                slides[currentIndex].style.display = 'none';
                
                // 显示下一页
                slides[currentIndex + 1].style.display = 'flex';
                
                // 触发动画
                if (typeof window.animateSlide === 'function') {
                    window.animateSlide(currentIndex + 1);
                }
                
                // 更新页面计数器
                if (typeof window.updatePageCounter === 'function') {
                    window.updatePageCounter(currentIndex + 2, slides.length);
                }
            }
        });
        
        // 添加触摸事件
        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            button.click(); // 触发点击事件
        });
    });
    
    // 为重新开始按钮添加事件处理
    if (restartButton) {
        restartButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 隐藏所有幻灯片
            slides.forEach(function(slide) {
                slide.style.display = 'none';
            });
            
            // 显示第一页
            slides[0].style.display = 'flex';
            
            // 触发动画
            if (typeof window.animateSlide === 'function') {
                window.animateSlide(0);
            }
            
            // 更新页面计数器
            if (typeof window.updatePageCounter === 'function') {
                window.updatePageCounter(1, slides.length);
            }
        });
        
        // 添加触摸事件
        restartButton.addEventListener('touchend', function(e) {
            e.preventDefault();
            restartButton.click(); // 触发点击事件
        });
    }
}
