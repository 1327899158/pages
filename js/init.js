// 初始化脚本
console.log('初始化脚本已加载');

// 确保第一页在页面加载后立即显示
window.addEventListener('load', function() {
    console.log('页面完全加载完成，初始化第一页');
    
    // 获取所有页面
    const pages = document.querySelectorAll('.swiper-slide');
    
    // 先隐藏所有页面
    pages.forEach(function(page) {
        page.style.display = 'none';
    });
    
    // 显示第一页
    if (pages.length > 0) {
        pages[0].style.display = 'flex';
        pages[0].classList.add('active');
        console.log('第一页已设置为可见');
    }
    
    // 设置全局变量
    window.currentPage = 0;
    window.totalPages = pages.length;
    
    console.log('初始化完成，总页数:', window.totalPages);
    
    // 确保所有按钮可点击
    document.querySelectorAll('.next-btn, .restart-btn').forEach(function(button, index) {
        console.log('初始化按钮:', index, button.className);
        
        // 添加内联样式，确保按钮可见且可点击
        button.style.position = 'relative';
        button.style.zIndex = '100';
        button.style.cursor = 'pointer';
        button.style.userSelect = 'none';
        button.style.webkitTapHighlightColor = 'transparent';
        
        // 添加点击提示
        button.setAttribute('data-action', button.classList.contains('restart-btn') ? '返回首页' : '下一页');
        
        // 添加点击事件
        button.addEventListener('click', function(e) {
            console.log('按钮被点击 (init.js):', index);
            e.preventDefault();
            e.stopPropagation();
            
            // 如果是重新开始按钮
            if (button.classList.contains('restart-btn')) {
                console.log('重新开始按钮被点击 (init.js)');
                window.currentPage = 0;
                showActivePage(0);
            } else {
                console.log('下一页按钮被点击 (init.js), 当前页:', window.currentPage);
                if (window.currentPage < window.totalPages - 1) {
                    showActivePage(window.currentPage + 1);
                }
            }
            return false;
        });
    });
});

// 显示指定页面
function showActivePage(index) {
    console.log('showActivePage被调用:', index);
    
    // 获取所有页面
    const pages = document.querySelectorAll('.swiper-slide');
    
    // 隐藏所有页面
    pages.forEach(function(page) {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    
    // 显示当前页面
    if (pages[index]) {
        pages[index].style.display = 'flex';
        pages[index].classList.add('active');
        console.log('页面', index, '已设置为可见');
        
        // 触发动画
        if (typeof window.animateSlide === 'function') {
            window.animateSlide(index);
        }
    }
    
    // 更新当前页码
    window.currentPage = index;
}
