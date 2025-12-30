// 检测内容溢出并自动启用滚动
document.addEventListener('DOMContentLoaded', function() {
    console.log('内容溢出检测脚本已加载');
    
    // 等待页面加载完成
    window.addEventListener('load', function() {
        console.log('页面加载完成，开始检测内容溢出');
        
        // 检测是否是移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // 获取所有页面内容
            const contents = document.querySelectorAll('.content');
            
            // 检查每个内容是否溢出
            contents.forEach(function(content, index) {
                setTimeout(function() {
                    const isOverflowing = content.scrollHeight > window.innerHeight;
                    
                    if (isOverflowing) {
                        console.log(`第${index + 1}页内容溢出，启用滚动`);
                        
                        // 确保内容可滚动
                        content.style.overflowY = 'auto';
                        content.style.webkitOverflowScrolling = 'touch';
                        
                        // 添加滚动提示
                        if (!content.querySelector('.scroll-hint')) {
                            const hint = document.createElement('div');
                            hint.className = 'scroll-hint';
                            hint.textContent = '向上滑动查看更多';
                            hint.style.cssText = `
                                position: absolute;
                                bottom: 70px;
                                left: 50%;
                                transform: translateX(-50%);
                                background-color: rgba(0, 0, 0, 0.5);
                                color: white;
                                padding: 5px 10px;
                                border-radius: 15px;
                                font-size: 12px;
                                opacity: 0.8;
                                z-index: 100;
                            `;
                            
                            content.appendChild(hint);
                            
                            // 3秒后隐藏提示
                            setTimeout(function() {
                                hint.style.opacity = '0';
                                hint.style.transition = 'opacity 1s';
                                
                                // 完全移除
                                setTimeout(function() {
                                    if (hint.parentNode) {
                                        hint.parentNode.removeChild(hint);
                                    }
                                }, 1000);
                            }, 3000);
                        }
                    }
                }, 1000); // 延迟1秒检查，确保内容已渲染
            });
            
            // 监听Swiper幻灯片变化，检查当前页面内容是否溢出
            if (typeof window.swiper !== 'undefined' && window.swiper) {
                window.swiper.on('slideChangeTransitionEnd', function() {
                    const currentIndex = this.activeIndex;
                    const currentContent = document.querySelectorAll('.content')[currentIndex];
                    
                    if (currentContent) {
                        const isOverflowing = currentContent.scrollHeight > window.innerHeight;
                        
                        if (isOverflowing) {
                            console.log(`当前页面（第${currentIndex + 1}页）内容溢出，启用滚动`);
                            
                            // 确保内容可滚动
                            currentContent.style.overflowY = 'auto';
                            currentContent.style.webkitOverflowScrolling = 'touch';
                            
                            // 添加滚动提示
                            if (!currentContent.querySelector('.scroll-hint')) {
                                const hint = document.createElement('div');
                                hint.className = 'scroll-hint';
                                hint.textContent = '向上滑动查看更多';
                                hint.style.cssText = `
                                    position: absolute;
                                    bottom: 70px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    background-color: rgba(0, 0, 0, 0.5);
                                    color: white;
                                    padding: 5px 10px;
                                    border-radius: 15px;
                                    font-size: 12px;
                                    opacity: 0.8;
                                    z-index: 100;
                                `;
                                
                                currentContent.appendChild(hint);
                                
                                // 3秒后隐藏提示
                                setTimeout(function() {
                                    hint.style.opacity = '0';
                                    hint.style.transition = 'opacity 1s';
                                    
                                    // 完全移除
                                    setTimeout(function() {
                                        if (hint.parentNode) {
                                            hint.parentNode.removeChild(hint);
                                        }
                                    }, 1000);
                                }, 3000);
                            }
                            
                            // 滚动到顶部
                            currentContent.scrollTop = 0;
                        }
                    }
                });
            }
        }
    });
});
