document.addEventListener('DOMContentLoaded', function() {
    // 初始化Swiper
    const swiper = new Swiper('.swiper-container', {
        direction: 'vertical',
        slidesPerView: 1,
        spaceBetween: 0,
        mousewheel: false,
        keyboard: false,
        allowTouchMove: false, // 禁止滑动，只能通过按钮翻页
        speed: 800,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        touchRatio: 0, // 禁用触摸滑动
        simulateTouch: false, // 禁用模拟触摸
        preventInteractionOnTransition: true, // 过渡期间防止交互
        autoHeight: true, // 自动高度
        watchOverflow: true, // 监视溢出
        on: {
            init: function() {
                // 初始化时触发动画
                animateSlide(0);
            },
            slideChange: function() {
                // 当页面切换时，触发动画
                animateSlide(swiper.activeIndex);
            }
        }
    });
    
    // 绑定按钮事件 - 同时支持点击和触摸事件
    document.querySelectorAll('.next-btn').forEach(function(btn, index) {
        // 点击事件
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            swiper.slideNext();
        });
        
        // 触摸事件
        btn.addEventListener('touchend', function(e) {
            e.preventDefault();
            swiper.slideNext();
        });
    });
    
    // 重新开始按钮
    const restartBtn = document.querySelector('.restart-btn');
    if (restartBtn) {
        // 点击事件
        restartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            swiper.slideTo(0);
        });
        
        // 触摸事件
        restartBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            swiper.slideTo(0);
        });
    }
    
    // 创建消息对比图表
    createMessageComparisonChart();
});

// 页面动画函数
function animateSlide(index) {
    // 获取当前页面的所有需要动画的元素
    const currentSlide = document.querySelectorAll('.swiper-slide')[index];
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

