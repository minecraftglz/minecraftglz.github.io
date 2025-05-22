     // ==================== 烟花特效部分 ====================
        const canvas = document.getElementById('fireworks-canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置画布尺寸
        function resizeCanvas() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        // 烟花和粒子集合
        const fireworks = [];
        const particles = [];
        let hue = 120;
        
        // 动画帧兼容性处理
        window.requestAnimFrame = (function() {
          return window.requestAnimationFrame ||
                 window.webkitRequestAnimationFrame ||
                 window.mozRequestAnimationFrame ||
                 function(callback) { window.setTimeout(callback, 1000/60); };
        })();
        
        // 随机数生成
        function random(min, max) {
          return Math.random() * (max - min) + min;
        }
        
        // 计算两点距离
        function calculateDistance(p1x, p1y, p2x, p2y) {
          const x = p1x - p2x;
          const y = p1y - p2y;
          return Math.sqrt(x*x + y*y);
        }
        
        // 烟花构造函数
        function Firework(sx, sy, tx, ty) {
          this.x = sx;
          this.y = sy;
          this.sx = sx;
          this.sy = sy;
          this.tx = tx;
          this.ty = ty;
          this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
          this.distanceTraveled = 0;
          this.coordinates = [];
          this.coordinateCount = 3;
          while(this.coordinateCount--) this.coordinates.push([this.x, this.y]);
          
          this.angle = Math.atan2(ty - sy, tx - sx);
          this.speed = 2;
          this.acceleration = 1.05;
          this.brightness = random(50, 70);
          this.targetRadius = 1;
        }
        
        // 更新烟花位置
        Firework.prototype.update = function(index) {
          this.coordinates.pop();
          this.coordinates.unshift([this.x, this.y]);
          
          if(this.targetRadius < 8) this.targetRadius += 0.3;
          else this.targetRadius = 1;
          
          this.speed *= this.acceleration;
          const vx = Math.cos(this.angle) * this.speed;
          const vy = Math.sin(this.angle) * this.speed;
          this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);
          
          if(this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.tx, this.ty);
            fireworks.splice(index, 1);
          } else {
            this.x += vx;
            this.y += vy;
          }
        };
        
        // 绘制烟花
        Firework.prototype.draw = function() {
          ctx.beginPath();
          ctx.moveTo(this.coordinates[this.coordinates.length-1][0], 
                    this.coordinates[this.coordinates.length-1][1]);
          ctx.lineTo(this.x, this.y);
          ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI*2);
          ctx.stroke();
        };
        
        // 粒子构造函数
        function Particle(x, y) {
          this.x = x;
          this.y = y;
          this.coordinates = [];
          this.coordinateCount = 5;
          while(this.coordinateCount--) this.coordinates.push([this.x, this.y]);
          
          this.angle = random(0, Math.PI*2);
          this.speed = random(1, 10);
          this.friction = 0.95;
          this.gravity = 1;
          this.hue = random(hue-20, hue+20);
          this.brightness = random(50, 80);
          this.alpha = 1;
          this.decay = random(0.015, 0.03);
        }
        
        // 更新粒子
        Particle.prototype.update = function(index) {
          this.coordinates.pop();
          this.coordinates.unshift([this.x, this.y]);
          this.speed *= this.friction;
          this.x += Math.cos(this.angle) * this.speed;
          this.y += Math.sin(this.angle) * this.speed + this.gravity;
          this.alpha -= this.decay;
          
          if(this.alpha <= this.decay) particles.splice(index, 1);
        };
        
        // 绘制粒子
        Particle.prototype.draw = function() {
          ctx.beginPath();
          ctx.moveTo(this.coordinates[this.coordinates.length-1][0], 
                    this.coordinates[this.coordinates.length-1][1]);
          ctx.lineTo(this.x, this.y);
          ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
          ctx.stroke();
        };
        
        // 创建粒子爆炸
        function createParticles(x, y) {
          for(let i=0; i<30; i++) particles.push(new Particle(x, y));
        }
        
        // 鼠标/触摸事件
        let mousedown = false, mx, my;
        
        function updateMousePosition(e) {
          const rect = canvas.getBoundingClientRect();
          mx = (e.clientX || e.touches[0].clientX) - rect.left;
          my = (e.clientY || e.touches[0].clientY) - rect.top;
        }
        
        // 事件监听
        canvas.addEventListener('mousemove', updateMousePosition);
        canvas.addEventListener('touchmove', (e) => {
          e.preventDefault();
          updateMousePosition(e);
        }, {passive: false});
        
        canvas.addEventListener('mousedown', (e) => {
          e.preventDefault();
          mousedown = true;
        });
        
        canvas.addEventListener('touchstart', (e) => {
          e.preventDefault();
          mousedown = true;
        }, {passive: false});
        
        canvas.addEventListener('mouseup', () => mousedown = false);
        canvas.addEventListener('touchend', () => mousedown = false);
        
        // 自动发射烟花
        let timerTick = 0, timerTotal = 80;
        let limiterTick = 0, limiterTotal = 5;
        
        // 主循环
        function loop() {
          requestAnimFrame(loop);
          
          hue += 0.5;
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'lighter';
          
          // 更新所有烟花
          for(let i=fireworks.length-1; i>=0; i--) {
            fireworks[i].draw();
            fireworks[i].update(i);
          }
          
          // 更新所有粒子
          for(let i=particles.length-1; i>=0; i--) {
            particles[i].draw();
            particles[i].update(i);
          }
          
          // 自动发射
          if(timerTick >= timerTotal && !mousedown) {
            fireworks.push(new Firework(
              canvas.width/2, canvas.height,
              random(0, canvas.width), random(0, canvas.height/2)
            ));
            timerTick = 0;
          } else timerTick++;
          
          // 点击发射
          if(limiterTick >= limiterTotal && mousedown) {
            fireworks.push(new Firework(canvas.width/2, canvas.height, mx, my));
            limiterTick = 0;
          } else limiterTick++;
        }