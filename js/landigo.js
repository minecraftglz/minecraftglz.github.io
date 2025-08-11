document.addEventListener('DOMContentLoaded', function() {
    const box = document.createElement('div');
    box.className = 'box';
    box.style.position = 'fixed';
    box.style.top = '30%';
    box.style.left = '50%';
    box.style.transform = 'translate(-50%, -50%)';
    box.style.display = 'flex';
    box.style.gap = '1px';
    document.getElementById('section2').appendChild(box);
    
    const content = [
        { class: 'chars', text: 'L' },
        { class: 'chars', text: 'A' },
        { class: 'chars', text: 'N' },
        { class: 'chars', text: 'D' },
        { class: 'chars', text: 'I' },
        { class: 'chars', text: 'G' },
        { class: 'chars', text: 'O' },
        { class: 'll a', text: '' },
        { class: 'll n', text: '' },
        { class: 'll i', text: '' },
        { class: 'll p', text: '' },
        { class: 'll l', text: '' },
        { class: 'll e', text: '' },
        { class: 'll x', text: '' },
        { class: 'pcov', text: '' }
    ];
    
    let isTriggered = false;
    
    // 创建观察器监听section2的class变化
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList.contains('active') && !isTriggered) {
                // 添加所有内容元素
                content.forEach((item, index) => {
                    const element = document.createElement('div');
                    element.className = item.class;
                    element.textContent = item.text;
                    
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(20px)';
                    element.style.transition = `all 0.5s ease ${index * 0.1}s`;
                    
                    box.appendChild(element);
                    
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, 50);
                });
                
                isTriggered = true;
                observer.disconnect(); // 动画触发后断开观察
            }
        });
    });
    
    // 开始观察section2
    observer.observe(document.getElementById('section2'), {
        attributes: true,
        attributeFilter: ['class']
    });
});