// 移动设备重定向脚本
(function() {
    // 检测是否是移动设备
    function isMobileDevice() {
        return (
            typeof window.orientation !== 'undefined' ||
            navigator.userAgent.indexOf('IEMobile') !== -1 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        );
    }
    
    // 检测是否支持Swiper
    function isSwiperSupported() {
        // 检查是否有Swiper构造函数
        if (typeof Swiper === 'undefined') {
            return false;
        }
        
        // 检查是否支持CSS3转换
        var div = document.createElement('div');
        var supportTransform = false;
        var transforms = {
            'webkitTransform': '-webkit-transform',
            'MozTransform': '-moz-transform',
            'msTransform': '-ms-transform',
            'OTransform': '-o-transform',
            'transform': 'transform'
        };
        
        for (var t in transforms) {
            if (div.style[t] !== undefined) {
                supportTransform = true;
                break;
            }
        }
        
        return supportTransform;
    }
    
    // 检测页面是否正常加载
    function checkPageLoaded() {
        // 如果已经从简化版重定向而来，不再检查
        if (window.location.search.includes('redirect=true')) {
            return;
        }
        
        // 等待页面加载完成
        window.addEventListener('load', function() {
            // 延迟检查，给Swiper足够的时间初始化
            setTimeout(function() {
                // 检查是否有可见的幻灯片
                var slides = document.querySelectorAll('.swiper-slide');
                var anySlideVisible = false;
                
                slides.forEach(function(slide) {
                    if (window.getComputedStyle(slide).display !== 'none') {
                        anySlideVisible = true;
                    }
                });
                
                // 如果是移动设备且没有可见的幻灯片，重定向到简化版
                if (isMobileDevice() && !anySlideVisible) {
                    console.log('检测到移动设备且页面未正确加载，重定向到简化版');
                    window.location.href = 'simple.html';
                }
                
                // 如果不支持Swiper，也重定向到简化版
                if (!isSwiperSupported()) {
                    console.log('检测到不支持Swiper，重定向到简化版');
                    window.location.href = 'simple.html';
                }
            }, 5000); // 等待5秒
        });
    }
    
    // 执行检查
    checkPageLoaded();
})();
