document.addEventListener('DOMContentLoaded', function() {
    const texts = [
        "风吹哪页读哪页，哪页难懂撕哪页",
        "倩语难寻",
        "欢迎来到伤心男人俱乐部", 
        "闻理似悟，于境则迷",
        "牧羊人颤抖着，开始畏惧这场风暴",
        "亲爱的，有些人的心，是开不出花的冻土",
        "雪下的太大，总有树枝要折断的，难道它能告诉自己，再忍忍，雪一会就停了吗",
        "多和旧人做新事，少和新人做旧事",
        "自己满溢，自己降露，自己做枯焦荒野上的雨",
        "物归原始，此境初始，心有广厦，何惧平凡",
    ];
    
    const element = document.getElementById("randomtext");
    let isTyping = false;        // 控制打字过程
    let hasEverTyped = false;    // 控制是否曾经打过字
    let typingTimer = null;

    // 创建观察器监听section2的class变化
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList.contains('active')) {
                // 如果已经打过字或正在打字，直接返回
                if (hasEverTyped || isTyping) {
                    return;
                }
                
                // 清除已有计时器
                if (typingTimer) {
                    clearTimeout(typingTimer);
                }
                
                // 设置2秒后开始打字
                typingTimer = setTimeout(function() {
                    if (!hasEverTyped && !isTyping) {  // 再次检查状态
                        startTyping();
                    }
                }, 2000);
            }
        });
    });
    
    function startTyping() {
        if (isTyping || hasEverTyped) return;  // 防止重复触发
        
        isTyping = true;
        const text = texts[Math.floor(Math.random() * texts.length)];
        let i = 0;
        element.textContent = "";

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, 100);
            } else {
                isTyping = false;
                hasEverTyped = true;  // 标记已经打过字，永久生效
            }
        }
        
        type();
    }

    // 开始观察section2
    observer.observe(document.getElementById('section2'), {
        attributes: true,
        attributeFilter: ['class']
    });
});