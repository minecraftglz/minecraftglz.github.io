// 1. 禁用 F12、Ctrl+Shift+I、Ctrl+Shift+J
document.addEventListener('keydown', function(e) {
    if (
        e.key === 'F12' || 
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.shiftKey && e.key === 'J')
    ) {
        e.preventDefault();
        alert("不要扒我啦！");
        return false;
    }
});

// 2. 禁用右键菜单
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert("不许用右键！");
    return false;
});
