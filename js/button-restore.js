// 恢复按钮显示
document.addEventListener('DOMContentLoaded', function() {
    console.log('按钮恢复脚本已加载');
    
    // 检查并恢复按钮
    function restoreButtons() {
        console.log('开始恢复按钮');
        
        // 获取所有页面
        const pages = document.querySelectorAll('.swiper-slide');
        
        // 检查每个页面是否有按钮
        pages.forEach(function(page, index) {
            const content = page.querySelector('.content');
            if (!content) return;
            
            // 检查是否有下一页按钮
            let nextBtn = content.querySelector('.next-btn');
            if (!nextBtn && index < pages.length - 1) {
                console.log(`第${index + 1}页缺少下一页按钮，添加一个`);
                
                // 创建下一页按钮
                nextBtn = document.createElement('button');
                nextBtn.className = 'next-btn animate__animated animate__pulse animate__infinite';
                nextBtn.textContent = '下一页';
                nextBtn.setAttribute('data-text', '下一页');
                
                // 添加到内容区域
                content.appendChild(nextBtn);
                
                // 添加点击事件
                nextBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (typeof window.swiper !== 'undefined' && window.swiper) {
                        window.swiper.slideNext();
                    }
                });
                
                // 添加触摸事件
                nextBtn.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    if (typeof window.swiper !== 'undefined' && window.swiper) {
                        window.swiper.slideNext();
                    }
                });
            }
            
            // 检查最后一页是否有重新开始按钮
            if (index === pages.length - 1) {
                let restartBtn = content.querySelector('.restart-btn');
                if (!restartBtn) {
                    console.log('最后一页缺少重新开始按钮，添加一个');
                    
                    // 创建重新开始按钮
                    restartBtn = document.createElement('button');
                    restartBtn.className = 'restart-btn animate__animated animate__pulse animate__infinite';
                    restartBtn.textContent = '重新浏览';
                    restartBtn.setAttribute('data-text', '重新浏览');
                    
                    // 添加到内容区域
                    content.appendChild(restartBtn);
                    
                    // 添加点击事件
                    restartBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (typeof window.swiper !== 'undefined' && window.swiper) {
                            window.swiper.slideTo(0);
                        }
                    });
                    
                    // 添加触摸事件
                    restartBtn.addEventListener('touchend', function(e) {
                        e.preventDefault();
                        if (typeof window.swiper !== 'undefined' && window.swiper) {
                            window.swiper.slideTo(0);
                        }
                    });
                }
            }
        });
        
        // 确保所有按钮可见
        const allButtons = document.querySelectorAll('.next-btn, .restart-btn');
        allButtons.forEach(function(button) {
            button.style.display = 'block';
            button.style.visibility = 'visible';
            button.style.opacity = '1';
            
            // 添加内联样式确保按钮可见
            button.style.backgroundColor = '#07C160';
            button.style.color = 'white';
            button.style.padding = '15px 40px';
            button.style.borderRadius = '30px';
            button.style.margin = '30px auto';
            button.style.fontSize = '20px';
            button.style.fontWeight = 'bold';
            button.style.zIndex = '9999';
            
            // 添加数据属性，用于调试
            button.setAttribute('data-restored', 'true');
            
            console.log(`恢复按钮: ${button.textContent}`);
        });
        
        console.log('按钮恢复完成');
    }
    
    // 在页面加载完成后恢复按钮
    window.addEventListener('load', function() {
        setTimeout(restoreButtons, 1000);
        
        // 每隔3秒检查一次按钮是否可见
        setInterval(function() {
            const allButtons = document.querySelectorAll('.next-btn, .restart-btn');
            let anyInvisible = false;
            
            allButtons.forEach(function(button) {
                const style = window.getComputedStyle(button);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                    anyInvisible = true;
                    console.log(`发现不可见按钮: ${button.textContent}`);
                }
            });
            
            if (anyInvisible) {
                console.log('检测到不可见按钮，重新恢复');
                restoreButtons();
            }
        }, 3000);
    });
    
    // 监听Swiper幻灯片变化，确保当前页面的按钮可见
    if (typeof window.swiper !== 'undefined' && window.swiper) {
        window.swiper.on('slideChangeTransitionEnd', function() {
            setTimeout(restoreButtons, 500);
        });
    }
});
