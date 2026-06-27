/* ============================================
   PARTICLES.JS — Canvas Particle Background
   Animated dots with connecting lines
   ============================================ */

(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let mouse = { x: null, y: null };
  let animationId;
  let isVisible = true;

  const CONFIG = {
    particleCount: 80,
    particleCountMobile: 40,
    maxDistance: 120,
    particleSize: { min: 1, max: 2.5 },
    speed: 0.3,
    mouseRadius: 150,
    lineOpacity: 0.12,
    particleOpacity: 0.25,
    colors: ['rgba(96,165,250,', 'rgba(139,92,246,', 'rgba(59,130,246,'],
  };

  function isMobile() {
    return window.innerWidth < 768;
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = CONFIG.particleSize.min + Math.random() * (CONFIG.particleSize.max - CONFIG.particleSize.min);
      this.speedX = (Math.random() - 0.5) * CONFIG.speed;
      this.speedY = (Math.random() - 0.5) * CONFIG.speed;
      this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.opacity = 0.1 + Math.random() * CONFIG.particleOpacity;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse interaction — gentle attraction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
          this.x += dx * force * 0.01;
          this.y += dy * force * 0.01;
        }
      }

      // Wrap around edges
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.opacity + ')';
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    const count = isMobile() ? CONFIG.particleCountMobile : CONFIG.particleCount;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.maxDistance) {
          const opacity = CONFIG.lineOpacity * (1 - dist / CONFIG.maxDistance);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawLines();
    animationId = requestAnimationFrame(animate);
  }

  // Event listeners
  window.addEventListener('resize', () => {
    resize();
    init();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Performance: pause when tab not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isVisible = false;
      cancelAnimationFrame(animationId);
    } else {
      isVisible = true;
      animate();
    }
  });

  // Init
  resize();
  init();
  animate();
})();
