(function(){
  // Simple performance-oriented renderer with OffscreenCanvas worker fallback
  const Perf = {
    start, stop, isRunning: false
  };
  let canvas, ctx, worker, offscreen, rafId, frames = 0, lastTs = 0;

  function createCanvas(){
    const root = document.getElementById('perf-root');
    if(!root) return null;
    canvas = document.createElement('canvas');
    canvas.className = 'hw-accelerate';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    root.insertBefore(canvas, root.firstChild);
    resize();
    window.addEventListener('resize', resize);
    return canvas;
  }

  function resize(){
    if(!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const root = document.getElementById('perf-root');
    const w = Math.max(1, Math.floor(root.clientWidth * dpr));
    const h = Math.max(1, Math.floor(root.clientHeight * dpr));
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = root.clientWidth + 'px';
    canvas.style.height = root.clientHeight + 'px';
    if(worker) worker.postMessage({type:'resize', width: w, height: h, dpr});
  }

  function updateFps(v){
    const el = document.getElementById('perf-fps');
    if(el) el.textContent = v + ' FPS';
  }

  function start(){
    if(Perf.isRunning) return;
    createCanvas();
    if(!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    // Prefer OffscreenCanvas + Worker when available
    if(canvas.transferControlToOffscreen && typeof Worker !== 'undefined'){
      try{
        offscreen = canvas.transferControlToOffscreen();
        worker = new Worker('perf/worker.js');
        worker.postMessage({type:'init', canvas: offscreen, width: canvas.width, height: canvas.height, dpr}, [offscreen]);
        worker.onmessage = (e)=>{ if(e.data.type === 'fps') updateFps(e.data.fps); };
        Perf.isRunning = true;
        document.body.classList.add('perf-enabled');
        return;
      }catch(err){
        console.warn('OffscreenCanvas worker failed, falling back to main thread renderer', err);
      }
    }

    // Main-thread fallback renderer (optimized 2D)
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    frames = 0; lastTs = performance.now();
    function loop(ts){
      frames++;
      const w = canvas.width, h = canvas.height;
      // fast clear
      ctx.fillStyle = '#000';
      ctx.fillRect(0,0,w,h);
      // cheap animation: rotating bars
      ctx.save();
      ctx.translate(w/2, h/2);
      ctx.rotate(ts/1000);
      ctx.fillStyle = '#00ff41';
      for(let i=0;i<60;i++){
        const x = (i - 30) * 4;
        ctx.fillRect(x, Math.sin((ts/1000) + i) * 6, 2, 2);
      }
      ctx.restore();
      if(ts - lastTs >= 1000){
        updateFps(frames);
        frames = 0; lastTs = ts;
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    Perf.isRunning = true;
    document.body.classList.add('perf-enabled');
  }

  function stop(){
    if(worker){
      try{ worker.postMessage({type:'stop'}); worker.terminate(); }catch(e){}
      worker = null;
    }
    if(rafId) cancelAnimationFrame(rafId);
    const root = document.getElementById('perf-root');
    if(root && root.firstChild) root.removeChild(root.firstChild);
    window.removeEventListener('resize', resize);
    Perf.isRunning = false;
    document.body.classList.remove('perf-enabled');
    updateFps('--');
  }

  window.Perf = Perf;
})();