// 添加浮动按钮
document.addEventListener('DOMContentLoaded', function() {
    console.log('浮动按钮脚本已加载');
    
    // 创建浮动按钮容器
    function createFloatingButtons() {
        console.log('创建浮动按钮');
        
        // 检查是否已存在浮动按钮
        if (document.querySelector('.floating-buttons')) {
            console.log('浮动按钮已存在，不重复创建');
            return;
        }
        
        // 创建浮动按钮容器
        const floatingButtons = document.createElement('div');
        floatingButtons.className = 'floating-buttons';
        
        // 创建下一页按钮
        const nextBtn = document.createElement('button');
        nextBtn.className = 'floating-next-btn';
        nextBtn.textContent = '下一页';
        nextBtn.id = 'floating-next-btn';
        
        // 创建重新开始按钮
        const restartBtn = document.createElement('button');
        restartBtn.className = 'floating-restart-btn';
        restartBtn.textContent = '重新开始';
        restartBtn.id = 'floating-restart-btn';
        restartBtn.style.display = 'none'; // 默认隐藏
        
        // 添加按钮到容器
        floatingButtons.appendChild(nextBtn);
        floatingButtons.appendChild(restartBtn);
        
        // 添加容器到页面
        document.body.appendChild(floatingButtons);
        
        // 添加事件处理
        nextBtn.addEventListener('click', function() {
            console.log('点击浮动下一页按钮');
            if (typeof window.swiper !== 'undefined' && window.swiper) {
                window.swiper.slideNext();
            }
        });
        
        restartBtn.addEventListener('click', function() {
            console.log('点击浮动重新开始按钮');
            if (typeof window.swiper !== 'undefined' && window.swiper) {
                window.swiper.slideTo(0);
            }
        });
        
        // 监听Swiper幻灯片变化
        if (typeof window.swiper !== 'undefined' && window.swiper) {
            window.swiper.on('slideChange', function() {
                updateFloatingButtons(this.activeIndex, this.slides.length);
            });
            
            // 初始化按钮状态
            updateFloatingButtons(window.swiper.activeIndex, window.swiper.slides.length);
        }
        
        console.log('浮动按钮创建完成');
    }
    
    // 更新浮动按钮状态
    function updateFloatingButtons(currentIndex, totalSlides) {
        const nextBtn = document.getElementById('floating-next-btn');
        const restartBtn = document.getElementById('floating-restart-btn');
        
        if (!nextBtn || !restartBtn) return;
        
        // 在最后一页显示重新开始按钮，隐藏下一页按钮
        if (currentIndex === totalSlides - 1) {
            nextBtn.style.display = 'none';
            restartBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            restartBtn.style.display = 'none';
        }
    }
    
    // 在页面加载完成后创建浮动按钮
    window.addEventListener('load', function() {
        setTimeout(createFloatingButtons, 1500);
    });
});
