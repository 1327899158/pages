// 第五页滚动修复脚本
document.addEventListener('DOMContentLoaded', function() {
    // 等待页面完全加载
    window.addEventListener('load', function() {
        // 获取第五页元素
        const page5 = document.querySelector('.page-5');
        const page5Content = document.querySelector('.page5-content');
        
        if (page5 && page5Content) {
            console.log('找到第五页，应用滚动修复');
            
            // 确保第五页内容可滚动
            page5Content.style.height = 'auto';
            page5Content.style.maxHeight = '100%';
            page5Content.style.overflowY = 'auto';
            page5Content.style.WebkitOverflowScrolling = 'touch';
            
            // 监听页面切换事件
            document.addEventListener('slideChange', function(e) {
                if (e.detail && e.detail.index === 4) { // 第五页索引为4
                    console.log('切换到第五页，确保内容可见');
                    
                    // 确保第五页的第二个特殊时刻可见
                    const secondSpecialMoment = page5.querySelector('.special-moment:nth-child(4)');
                    if (secondSpecialMoment) {
                        // 滚动到第二个特殊时刻的位置
                        setTimeout(function() {
                            secondSpecialMoment.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 500);
                    }
                }
            });
        }
    });
});
