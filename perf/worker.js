let ctx, width = 0, height = 0, running = true;
self.onmessage = function(e){
  const d = e.data;
  if(d.type === 'init'){
    running = true;
    const canvas = d.canvas; width = d.width; height = d.height;
    canvas.width = width; canvas.height = height;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    let frames = 0; let last = Date.now();
    function loop(){
      if(!running) return;
      const now = Date.now();
      // very cheap drawing
      ctx.fillStyle = '#000';
      ctx.fillRect(0,0,width,height);
      ctx.save();
      ctx.translate(width/2, height/2);
      const t = now / 1000;
      ctx.fillStyle = '#00ff41';
      for(let i=0;i<120;i++){
        ctx.fillRect(Math.sin(t + i) * (i % 20), (i - 60) * 2, 1, 1);
      }
      ctx.restore();
      frames++;
      if(now - last >= 1000){
        self.postMessage({type:'fps', fps: frames});
        frames = 0; last = now;
      }
      // aim ~60fps
      setTimeout(loop, 1000/60);
    }
    loop();
  }else if(d.type === 'resize'){
    width = d.width; height = d.height; if(ctx && d.width && d.height){ ctx.canvas.width = width; ctx.canvas.height = height; }
  }else if(d.type === 'stop'){
    running = false;
  }
};