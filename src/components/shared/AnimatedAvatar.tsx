import { useEffect, useRef } from 'react';

interface AnimatedAvatarProps {
  initials: string;
  size?: number;
  colors?: string[];
  imageUrl?: string;
  // Si quieres mostrar la muñeca animada en lugar de las iniciales
  showWavingCharacter?: boolean; 
}

export function AnimatedAvatar({ 
  initials, 
  size = 60, 
  colors = ['#1877F2', '#42A5F5', '#9B5BFF', '#F35369'],
  imageUrl,
  showWavingCharacter = true // Por defecto muestra la muñeca si no hay foto
}: AnimatedAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    let img: HTMLImageElement | null = null;
    let imageLoaded = false;

    if (imageUrl) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { imageLoaded = true; };
      img.src = imageUrl;
    }

    let animationId: number;
    let angle = 0;
    let blinkTimer = 0;

    const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    };

    // Función para dibujar la muñeca que saluda
    const drawWavingCharacter = (centerX: number, centerY: number, scale: number) => {
      const skinColor = '#FFDFC4';
      const hairColor = '#1E2245';
      const shirtColor = '#E85A1A';
      
      // 1. Cuerpo (Camisa)
      ctx.fillStyle = shirtColor;
      ctx.beginPath();
      ctx.roundRect(centerX - 18 * scale, centerY + 10 * scale, 36 * scale, 30 * scale, 8 * scale);
      ctx.fill();

      // 2. Cuello
      ctx.fillStyle = skinColor;
      ctx.fillRect(centerX - 6 * scale, centerY + 5 * scale, 12 * scale, 10 * scale);

      // 3. Cabeza
      ctx.beginPath();
      ctx.arc(centerX, centerY - 5 * scale, 16 * scale, 0, Math.PI * 2);
      ctx.fillStyle = skinColor;
      ctx.fill();

      // 4. Pelo (Estilo Bob)
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 5 * scale, 16 * scale, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(centerX - 16 * scale, centerY - 5 * scale, 8 * scale, 15 * scale);
      ctx.fillRect(centerX + 8 * scale, centerY - 5 * scale, 8 * scale, 15 * scale);

      // 5. Ojos (Parpadeo)
      const isBlinking = blinkTimer > 0;
      ctx.fillStyle = hairColor;
      if (isBlinking) {
        ctx.fillRect(centerX - 8 * scale, centerY - 5 * scale, 4 * scale, 1 * scale);
        ctx.fillRect(centerX + 4 * scale, centerY - 5 * scale, 4 * scale, 1 * scale);
      } else {
        ctx.beginPath();
        ctx.arc(centerX - 6 * scale, centerY - 5 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.arc(centerX + 6 * scale, centerY - 5 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Sonrisa
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5 * scale, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.strokeStyle = '#C03510';
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();

      // 7. Brazo que saluda
      const waveAngle = Math.sin(angle * 8) * 0.6 - 0.8; // Movimiento de vaivén
      ctx.save();
      ctx.translate(centerX + 15 * scale, centerY + 15 * scale); // Hombro
      ctx.rotate(waveAngle);
      
      // Brazo superior (camisa)
      ctx.fillStyle = shirtColor;
      ctx.fillRect(-4 * scale, 0, 8 * scale, 15 * scale);
      
      // Antebrazo y mano (piel)
      ctx.translate(0, 15 * scale);
      ctx.rotate(Math.sin(angle * 8) * 0.3); // Codo flexible
      ctx.fillStyle = skinColor;
      ctx.fillRect(-3 * scale, 0, 6 * scale, 12 * scale);
      ctx.beginPath();
      ctx.arc(0, 14 * scale, 5 * scale, 0, Math.PI * 2); // Mano
      ctx.fill();
      
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      
      const centerX = size / 2;
      const centerY = size / 2;
      const ringRadius = size / 2 - 4;

      // 1. Anillo Animado
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      const numColors = colors.length;
      for (let i = 0; i < numColors; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, (i * 2 * Math.PI) / numColors, ((i + 1) * 2 * Math.PI) / numColors);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.restore();

      // 2. Destellos
      const sparkleRadius = size / 2 - 2;
      const sparklePulse = (Math.sin(angle * 4) + 1) / 2;
      for (let i = 0; i < 3; i++) {
        const sparkleAngle = angle * 0.5 + (i * 2 * Math.PI) / 3;
        const sx = centerX + Math.cos(sparkleAngle) * sparkleRadius;
        const sy = centerY + Math.sin(sparkleAngle) * sparkleRadius;
        const sSize = 3 + sparklePulse * 3;
        ctx.save();
        ctx.shadowColor = colors[i % colors.length];
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#FFFFFF';
        drawStar(ctx, sx, sy, 4, sSize, sSize / 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Interior
      ctx.save();
      const floatY = Math.sin(angle * 2) * 1.5;
      ctx.translate(0, floatY);
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius - 4, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (img && imageLoaded) {
        ctx.drawImage(img, 8, 8, size - 16, size - 16);
      } else if (showWavingCharacter) {
        // Dibujar fondo blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        // Dibujar muñeca que saluda
        drawWavingCharacter(centerX, centerY, size / 100);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#1E2245';
        ctx.font = `bold ${size * 0.35}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, centerX, centerY + 2);
      }
      
      ctx.restore();

      // Borde interno
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius - 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Lógica de parpadeo
      blinkTimer--;
      if (blinkTimer < -50 && Math.random() < 0.1) {
        blinkTimer = 8; // Duración del parpadeo
      }

      angle += 0.02;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => { cancelAnimationFrame(animationId); };
  }, [size, colors, initials, imageUrl, showWavingCharacter]);

  return <canvas ref={canvasRef} className="rounded-full" />;
}