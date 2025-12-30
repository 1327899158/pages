// 全局变量
let currentPage = 0;
let totalPages = 8; // 总页数

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有页面和按钮
    const pages = document.querySelectorAll('.swiper-slide');
    const nextButtons = document.querySelectorAll('.next-btn');
    const restartButton = document.querySelector('.restart-btn');
    
    // 初始化显示第一页
    showPage(0);
    
    // 为每个下一页按钮添加事件
    nextButtons.forEach(function(button) {
        // 绑定多种事件以确保兼容性
        ['click', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach(function(eventType) {
            button.addEventListener(eventType, function(e) {
                e.preventDefault(); // 阻止默认行为
                nextPage(); // 调用翻到下一页的函数
                return false; // 阻止事件冒泡
            });
        });
    });
    
    // 为重新开始按钮添加事件（如果存在）
    if (restartButton) {
        ['click', 'touchstart', 'touchend', 'mousedown', 'mouseup'].forEach(function(eventType) {
            restartButton.addEventListener(eventType, function(e) {
                e.preventDefault();
                goToPage(0); // 返回第一页
                return false;
            });
        });
    }
    
    // 页面显示函数
    function showPage(index) {
        // 隐藏所有页面
        pages.forEach(function(page) {
            page.classList.remove('active');
        });
        
        // 显示当前页面
        if (pages[index]) {
            pages[index].classList.add('active');
            // 触发动画
            animateSlide(index);
        }
        
        // 更新当前页码
        currentPage = index;
        
        // 打印调试信息
        console.log('切换到页面:', index);
    }
    
    // 下一页函数
    function nextPage() {
        if (currentPage < totalPages - 1) {
            goToPage(currentPage + 1);
        }
    }
    
    // 跳转到指定页面
    function goToPage(index) {
        if (index >= 0 && index < totalPages) {
            showPage(index);
        }
    }
    
    // 添加键盘事件支持
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            nextPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            if (currentPage > 0) {
                goToPage(currentPage - 1);
            }
        }
    });
    
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

