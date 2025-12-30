// 修复Swiper在移动设备上的问题
document.addEventListener('DOMContentLoaded', function() {
    console.log('Swiper修复脚本已加载');
    
    // 确保Swiper全局可用
    window.addEventListener('load', function() {
        console.log('页面完全加载，开始修复Swiper');
        
        // 确保swiper变量在全局范围内可用
        setTimeout(function() {
            if (typeof window.swiper === 'undefined' || !window.swiper) {
                console.log('Swiper未在全局范围内定义，尝试重新初始化');
                
                try {
                    // 重新初始化Swiper
                    window.swiper = new Swiper('.swiper-container', {
                        direction: 'vertical',
                        slidesPerView: 1,
                        spaceBetween: 0,
                        speed: 500,
                        effect: 'fade',
                        fadeEffect: {
                            crossFade: true
                        },
                        allowTouchMove: false,
                        on: {
                            init: function() {
                                console.log('Swiper重新初始化成功');
                                if (typeof animateSlide === 'function') {
                                    animateSlide(0);
                                }
                            }
                        }
                    });
                    
                    console.log('Swiper重新初始化完成');
                } catch (error) {
                    console.error('Swiper重新初始化失败:', error);
                }
            } else {
                console.log('Swiper已在全局范围内定义');
            }
            
            // 添加全局函数，以便在控制台中手动触发翻页
            window.nextPage = function() {
                if (typeof window.swiper !== 'undefined' && window.swiper) {
                    window.swiper.slideNext();
                    return '已执行下一页操作';
                } else {
                    return 'Swiper未初始化或不可用';
                }
            };
            
            window.prevPage = function() {
                if (typeof window.swiper !== 'undefined' && window.swiper) {
                    window.swiper.slidePrev();
                    return '已执行上一页操作';
                } else {
                    return 'Swiper未初始化或不可用';
                }
            };
            
            window.gotoPage = function(index) {
                if (typeof window.swiper !== 'undefined' && window.swiper) {
                    window.swiper.slideTo(index);
                    return `已跳转到第${index + 1}页`;
                } else {
                    return 'Swiper未初始化或不可用';
                }
            };
            
            console.log('Swiper修复完成，已添加全局控制函数');
        }, 1500);
    });
});
