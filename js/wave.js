class Wave {
    constructor(canvas, options = {}) {
        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get canvas context!');
            return;
        }

        // 基础配置
        this.options = Object.assign({
            height: 55,           // 波浪高度
            amplitude: 15,         // 波浪振幅
            frequency: 0.02,       // 波浪频率
            waves: [              // 多层波浪配置
                {
                    color: 'rgba(100, 174, 255, 0.3)',
                    speed: 0.02,
                    amplitude: 25,
                    offset: 0
                },
                {
                    color: 'rgba(100, 174, 255, 0.4)',
                    speed: 0.03,
                    amplitude: 20,
                    offset: 2
                },
                {
                    color: 'rgba(100, 174, 255, 0.5)',
                    speed: 0.04,
                    amplitude: 15,
                    offset: 4
                }
            ]
        }, options);

        // 动画相关
        this.rafId = null;
        this.lastTime = 0;
        this.interval = 1000 / 60;

        // 波浪参数
        this.waves = this.options.waves.map(wave => ({
            ...wave,
            points: [],
            phase: wave.offset || 0
        }));
        
        this.count = Math.floor(window.innerWidth / 10); // 每10px一个点，增加精细度
        this.mouse = {
            x: null,
            y: null,
            radius: 120,
            power: 35,
            isDown: false
        };

        this.init();
        this.bindEvents();
        this.animate(0);
    }

    init() {
        this.resizeCanvas();
        this.createPoints();
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
    }

    createPoints() {
        const spacing = this.canvas.width / (this.count - 1);
        const baseY = this.canvas.height - this.options.height;

        this.waves.forEach(wave => {
            wave.points = [];
            for (let i = 0; i < this.count; i++) {
                wave.points.push({
                    x: i * spacing,
                    y: baseY,
                    baseY: baseY,
                    speed: 0.1,
                    velocity: 0,
                    spring: 0.3,
                    friction: 0.95,
                    gravity: 0.3
                });
            }
        });
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createPoints();
        });

        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;

            if (mouseY >= rect.height - this.options.height) {
                const canvasX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
                const canvasY = mouseY * (this.canvas.height / rect.height);
                this.mouse.x = canvasX;
                this.mouse.y = canvasY;
            } else {
                this.mouse.x = null;
                this.mouse.y = null;
            }
        });

        document.addEventListener('mousedown', () => {
            this.mouse.isDown = true;
            this.mouse.power = 50;
        });

        document.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
            this.mouse.power = 35;
        });

        document.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
            this.mouse.isDown = false;
        });

        // 触摸事件支持
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const mouseY = touch.clientY - rect.top;

            if (mouseY >= rect.height - this.options.height) {
                const canvasX = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
                const canvasY = mouseY * (this.canvas.height / rect.height);
                this.mouse.x = canvasX;
                this.mouse.y = canvasY;
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    update() {
        this.waves.forEach(wave => {
            wave.phase += wave.speed;

            wave.points.forEach((point, i) => {
                // 基础波浪运动
                point.y = point.baseY + 
                    Math.sin(i * 0.2 + wave.phase) * wave.amplitude +
                    Math.sin(i * 0.3 + wave.phase * 0.8) * wave.amplitude * 0.5;

               
                // 物理更新
                const delta = point.baseY - point.y;
                point.velocity += delta * point.spring;
                point.velocity *= point.friction;
                point.y += point.velocity;
            });
        });
    }

    drawWave(wave) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        this.ctx.lineTo(wave.points[0].x, wave.points[0].y);

        for (let i = 0; i < wave.points.length - 1; i++) {
            const xc = (wave.points[i].x + wave.points[i + 1].x) / 2;
            const yc = (wave.points[i].y + wave.points[i + 1].y) / 2;
            this.ctx.quadraticCurveTo(wave.points[i].x, wave.points[i].y, xc, yc);
        }

        const lastPoint = wave.points[wave.points.length - 1];
        this.ctx.lineTo(lastPoint.x, lastPoint.y);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.closePath();

        this.ctx.fillStyle = wave.color;
        this.ctx.fill();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 从后向前绘制波浪，确保层次感
        for (let i = this.waves.length - 1; i >= 0; i--) {
            this.drawWave(this.waves[i]);
        }
    }

    animate(currentTime) {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        if (!this.lastTime) this.lastTime = currentTime;

        const deltaTime = currentTime - this.lastTime;

        if (deltaTime > this.interval) {
            this.update();
            this.draw();
            this.lastTime = currentTime;
        }

        this.rafId = requestAnimationFrame((time) => this.animate(time));
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        window.removeEventListener('resize', this.resizeCanvas);
        this.canvas.remove();
    }
}

// 初始化波浪
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('waveCanvas');
    if (canvas) {
        try {
            new Wave(canvas, {
                height: 55,
                waves: [
                    {
                        color: 'rgba(100, 174, 255, 0.3)',
                        speed: 0.02,
                        amplitude: 15,
                        offset: 0
                    },
                    {
                        color: 'rgba(100, 174, 255, 0.4)',
                        speed: 0.03,
                        amplitude: 10,
                        offset: 2
                    },
                    {
                        color: 'rgba(100, 174, 255, 0.5)',
                        speed: 0.04,
                        amplitude: 5,
                        offset: 4
                    }
                ]
            });
        } catch (error) {
            console.error('Error initializing Wave:', error);
        }
    }
});