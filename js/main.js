// 自动翻页定时器
let autoSlideTimer = null;
let countdownTimer = null;
let autoSlideEnabled = true;
const autoSlideInterval = 15000; // 15秒
let timeLeft = autoSlideInterval / 1000; // 剩余时间（秒）
let swiper = null; // 全局Swiper实例

// 页面加载完成后立即执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，准备启动自动翻页');
    // 初始化倒计时器显示
    updateTimerDisplay();
    
    // 确保在页面加载后立即启动自动翻页
    // 等待所有内容加载完成
    window.addEventListener('load', function() {
        console.log('页面完全加载完成，启动自动翻页');
        // 等待一小段时间再启动，确保所有内容都已经渲染完成
        setTimeout(function() {
            startAutoSlide();
        }, 2000);
    });
    // 初始化Swiper - 使用更简单的配置以提高兼容性
    try {
        console.log('开始初始化Swiper');
        swiper = new Swiper('.swiper-container', {
            direction: 'vertical',
            slidesPerView: 1,
            spaceBetween: 0,
            speed: 500,
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            allowTouchMove: false, // 禁止滑动，只能通过按钮翻页
            autoHeight: false, // 禁用自动高度，可能导致问题
            observer: true, // 监视元素变化
            observeParents: true, // 监视父元素变化
            watchOverflow: true, // 监视溢出
        on: {
            init: function() {
                // 初始化时触发动画
                animateSlide(0);
                // 启动自动翻页
                startAutoSlide();
                // 更新页面计数器 - 使用安全的方式获取幻灯片数量
                const slidesCount = document.querySelectorAll('.swiper-slide').length;
                updatePageCounter(1, slidesCount);
            },
            slideChange: function() {
                // 当页面切换时，触发动画
                const currentIndex = this.activeIndex;
                animateSlide(currentIndex);
                // 重置自动翻页定时器
                resetAutoSlideTimer();
                // 更新页面计数器 - 使用安全的方式获取幻灯片数量
                const slidesCount = document.querySelectorAll('.swiper-slide').length;
                updatePageCounter(currentIndex + 1, slidesCount);
            }
        }
    });
    
    // 绑定按钮事件 - 同时支持点击和触摸事件
    document.querySelectorAll('.next-btn').forEach(function(btn, index) {
        // 点击事件
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            swiper.slideNext();
            // 重置自动翻页定时器
            resetAutoSlideTimer();
        });
        
        // 触摸事件
        btn.addEventListener('touchend', function(e) {
            e.preventDefault();
            swiper.slideNext();
            // 重置自动翻页定时器
            resetAutoSlideTimer();
        });
    });
    
    // 重新开始按钮
    const restartBtn = document.querySelector('.restart-btn');
    if (restartBtn) {
        // 点击事件
        restartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            swiper.slideTo(0);
            // 重置自动翻页定时器
            resetAutoSlideTimer();
        });
        
        // 触摸事件
        restartBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            swiper.slideTo(0);
            // 重置自动翻页定时器
            resetAutoSlideTimer();
        });
    }
    
    // 自动翻页功能 - 完全重写
    function startAutoSlide() {
        // 先清除现有定时器
        stopAutoSlide();
        
        if (!autoSlideEnabled) {
            console.log('自动翻页已禁用');
            return;
        }
        
        console.log('启动自动翻页');
        
        // 重置倒计时
        timeLeft = autoSlideInterval / 1000;
        updateTimerDisplay();
        
        // 启动倒计时更新
        countdownTimer = setInterval(function() {
            timeLeft -= 1;
            updateTimerDisplay();
            
            // 当倒计时到零时自动翻页
            if (timeLeft <= 0) {
                // 安全地获取当前页面索引
                const slides = document.querySelectorAll('.swiper-slide');
                const currentIndex = getCurrentSlideIndex();
                const totalSlides = slides.length;
                
                if (currentIndex >= totalSlides - 1) {
                    // 如果是最后一页，返回第一页
                    if (swiper && typeof swiper.slideTo === 'function') {
                        swiper.slideTo(0);
                    } else {
                        // 备用方案：手动切换页面
                        manualSlideChange(0);
                    }
                } else {
                    // 切换到下一页
                    if (swiper && typeof swiper.slideNext === 'function') {
                        swiper.slideNext();
                    } else {
                        // 备用方案：手动切换页面
                        manualSlideChange(currentIndex + 1);
                    }
                }
                
                // 重置倒计时
                timeLeft = autoSlideInterval / 1000;
                updateTimerDisplay();
            }
        }, 1000);
    }
    
    // 获取当前幻灯片索引
    function getCurrentSlideIndex() {
        const slides = document.querySelectorAll('.swiper-slide');
        for (let i = 0; i < slides.length; i++) {
            // 检查哪个幻灯片是可见的
            const style = window.getComputedStyle(slides[i]);
            if (style.display !== 'none' && style.opacity !== '0') {
                return i;
            }
        }
        return 0; // 默认返回第一页
    }
    
    // 手动切换页面（当swiper不可用时的备用方案）
    function manualSlideChange(targetIndex) {
        const slides = document.querySelectorAll('.swiper-slide');
        if (!slides || targetIndex >= slides.length) return;
        
        // 隐藏所有幻灯片
        slides.forEach(slide => slide.style.display = 'none');
        
        // 显示目标幻灯片
        slides[targetIndex].style.display = 'flex';
        
        // 触发动画
        animateSlide(targetIndex);
        
        // 更新页面计数器
        updatePageCounter(targetIndex + 1, slides.length);
    }
    
    // 页面显示函数
    function showPage(index) {
        const slides = document.querySelectorAll('.swiper-slide');
        if (!slides || index >= slides.length) return;
        
        // 隐藏所有幻灯片
        slides.forEach(slide => slide.style.display = 'none');
        
        // 显示目标幻灯片
        slides[index].style.display = 'flex';
        
        // 触发动画
        animateSlide(index);
        
        // 更新页面计数器
        updatePageCounter(index + 1, slides.length);
        
        // 触发自定义页面切换事件
        const slideChangeEvent = new CustomEvent('slideChange', {
            detail: { index: index }
        });
        document.dispatchEvent(slideChangeEvent);
    }
    
    // 停止自动翻页
    function stopAutoSlide() {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }
        
        if (autoSlideTimer) {
            clearTimeout(autoSlideTimer);
            autoSlideTimer = null;
        }
    }
    
    // 更新倒计时器显示
    function updateTimerDisplay() {
        const timerText = document.getElementById('timer-text');
        const timerProgress = document.getElementById('timer-progress');
        
        if (timerText && timerProgress) {
            // 更新文本
            timerText.textContent = timeLeft;
            
            // 更新进度条
            const progressPercent = (timeLeft / (autoSlideInterval / 1000)) * 100;
            timerProgress.style.width = progressPercent + '%';
        }
    }
    
    // 重置自动翻页定时器
    function resetAutoSlideTimer() {
        // 重新启动自动翻页
        startAutoSlide();
    }
    
    // 页面计数器更新函数
    function updatePageCounter(currentPage, totalPages) {
        const currentPageElement = document.getElementById('current-page');
        const totalPagesElement = document.getElementById('total-pages');
        
        if (currentPageElement && totalPagesElement) {
            currentPageElement.textContent = currentPage;
            totalPagesElement.textContent = totalPages;
        }
    }
    
    // 自动翻页控制按钮
    const toggleAutoSlideBtn = document.getElementById('toggle-auto-slide');
    if (toggleAutoSlideBtn) {
        toggleAutoSlideBtn.addEventListener('click', function() {
            autoSlideEnabled = !autoSlideEnabled;
            
            if (autoSlideEnabled) {
                // 恢复自动翻页
                this.textContent = '暂停自动播放';
                this.classList.remove('paused');
                startAutoSlide();
                
                // 显示倒计时器
                document.querySelector('.countdown-timer').style.display = 'flex';
            } else {
                // 暂停自动翻页
                this.textContent = '继续自动播放';
                this.classList.add('paused');
                
                // 清除定时器
                if (autoSlideTimer) {
                    clearTimeout(autoSlideTimer);
                }
                
                if (countdownTimer) {
                    clearInterval(countdownTimer);
                }
                
                // 隐藏倒计时器
                document.querySelector('.countdown-timer').style.display = 'none';
            }
        });
    }
    
    // 创建消息对比图表
    createMessageComparisonChart();
});

// 页面动画函数
function animateSlide(index) {
    // 获取当前页面的所有需要动画的元素
    const slides = document.querySelectorAll('.swiper-slide');
    if (!slides || index >= slides.length) {
        console.error('无法找到幻灯片或索引超出范围:', index);
        return;
    }
    
    const currentSlide = slides[index];
    if (!currentSlide) {
        console.error('无法获取当前幻灯片:', index);
        return;
    }
    
    const animatedElements = currentSlide.querySelectorAll('.animate__animated:not(.animate__infinite)');
    
    // 重置所有元素的动画
    animatedElements.forEach(function(el) {
        el.classList.remove('animate__fadeIn', 'animate__fadeInUp', 'animate__fadeInDown', 'animate__fadeInLeft', 'animate__fadeInRight');
        el.style.opacity = '0';
        
        // 强制重绘
        void el.offsetWidth;
    });
    
    // 根据页面索引设置不同的动画效果
    let animationName = 'animate__fadeIn';
    switch(index) {
        case 0: // 第一页
            animationName = 'animate__fadeIn';
            break;
        case 1: // 第二页
            animationName = 'animate__fadeInUp';
            break;
        case 2: // 第三页
            animationName = 'animate__fadeIn';
            break;
        case 3: // 第四页
            animationName = 'animate__fadeInLeft';
            break;
        case 4: // 第五页
            animationName = 'animate__fadeIn';
            break;
        case 5: // 第六页
            animationName = 'animate__fadeInRight';
            break;
        case 6: // 第七页
            animationName = 'animate__fadeInUp';
            break;
        case 7: // 第八页
            animationName = 'animate__fadeIn';
            break;
        default:
            animationName = 'animate__fadeIn';
    }
    
    // 应用动画，并设置延迟
    animatedElements.forEach(function(el, i) {
        setTimeout(function() {
            el.style.opacity = '1';
            el.classList.add(animationName);
        }, i * 200); // 每个元素延迟200毫秒
    });
}

// 创建消息对比图表
function createMessageComparisonChart() {
    const ctx = document.getElementById('messageComparisonChart').getContext('2d');
    
    // 准备数据
    const junJovecData = [
        chatData.junJovec.text,
        chatData.junJovec.images,
        chatData.junJovec.video,
        chatData.junJovec.emoji,
        chatData.junJovec.voice,
        chatData.junJovec.files
    ];
    
    const junLoveyData = [
        chatData.junLovey.text,
        chatData.junLovey.images,
        chatData.junLovey.video,
        chatData.junLovey.emoji,
        chatData.junLovey.voice,
        chatData.junLovey.files
    ];
    
    // 创建图表
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['文本', '图片', '视频', '表情包', '语音', '文件'],
            datasets: [
                {
                    label: 'JunJovec_',
                    data: junJovecData,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'JunLovey_',
                    data: junLoveyData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'logarithmic',  // 使用对数刻度
                    beginAtZero: false,
                    min: 1,  // 最小值为1
                    ticks: {
                        callback: function(value) {
                            if (value === 10 || value === 100 || value === 1000 || value === 10000 || value === 50000) {
                                return value;
                            }
                            return '';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y;
                            return label;
                        }
                    }
                }
            }
        }
    });
}

