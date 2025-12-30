// 直接绑定触摸事件，绕过所有其他事件处理
document.addEventListener('DOMContentLoaded', function() {
    console.log('直接触摸事件处理脚本已加载');
    
    // 等待页面完全加载
    window.addEventListener('load', function() {
        console.log('页面完全加载，开始绑定直接触摸事件');
        
        // 确保Swiper已初始化
        setTimeout(function() {
            // 获取所有按钮
            const nextButtons = document.querySelectorAll('.next-btn');
            const restartButton = document.querySelector('.restart-btn');
            
            // 为下一页按钮添加直接触摸事件
            nextButtons.forEach(function(button) {
                // 移除现有事件
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // 添加新的直接触摸事件
                newButton.addEventListener('touchstart', function(e) {
                    console.log('下一页按钮触摸开始');
                    this.style.backgroundColor = '#06a050';
                    this.style.transform = 'scale(0.98)';
                }, { passive: true });
                
                newButton.addEventListener('touchend', function(e) {
                    console.log('下一页按钮触摸结束，执行slideNext');
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 恢复按钮样式
                    this.style.backgroundColor = '';
                    this.style.transform = '';
                    
                    // 直接调用Swiper的slideNext方法
                    if (typeof window.swiper !== 'undefined' && window.swiper) {
                        window.swiper.slideNext();
                        console.log('已执行slideNext');
                    } else {
                        console.error('Swiper未初始化或不可用');
                    }
                    
                    return false;
                }, { passive: false });
            });
            
            // 为重新开始按钮添加直接触摸事件
            if (restartButton) {
                const newRestartButton = restartButton.cloneNode(true);
                restartButton.parentNode.replaceChild(newRestartButton, restartButton);
                
                newRestartButton.addEventListener('touchstart', function(e) {
                    console.log('重新开始按钮触摸开始');
                    this.style.backgroundColor = '#06a050';
                    this.style.transform = 'scale(0.98)';
                }, { passive: true });
                
                newRestartButton.addEventListener('touchend', function(e) {
                    console.log('重新开始按钮触摸结束，执行slideTo(0)');
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 恢复按钮样式
                    this.style.backgroundColor = '';
                    this.style.transform = '';
                    
                    // 直接调用Swiper的slideTo方法
                    if (typeof window.swiper !== 'undefined' && window.swiper) {
                        window.swiper.slideTo(0);
                        console.log('已执行slideTo(0)');
                    } else {
                        console.error('Swiper未初始化或不可用');
                    }
                    
                    return false;
                }, { passive: false });
            }
            
            console.log('直接触摸事件绑定完成');
        }, 1000); // 等待1秒确保Swiper已初始化
    });
});
