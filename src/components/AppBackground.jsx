/**
 * VoxelXLauncher — Minecraft Launcher
 * Created by FoxStudio. AI-assisted development.
 *
 * Source code : https://github.com/foxstudio-201/VoxelXLauncher
 * Website     : https://voxxelxclient.vercel.app
 *
 * NOTICE:
 *   - This software is provided as-is without warranty of any kind.
 *   - Do not redistribute or resell without explicit permission from FoxStudio.
 *   - If you use or reference this code, please credit FoxStudio.
 *   - Minecraft is a trademark of Mojang Studios / Microsoft. This project is not affiliated with Mojang.
 */

 /**
 * VoxelXLauncher — Minecraft Launcher
 * Created by FoxStudio. AI-assisted development.
 *
 * Source code : https://github.com/foxstudio-201/VoxelXLauncher
 * Website     : https://voxxelxclient.vercel.app
 *
 * NOTICE:
 *   - Dành cho mấy cháu cứ thích phỉ báng.
 *   - Launcher sử dụng ai đi kèm trong việc tạo, bản thân người tạo không tự nhận là code toàn bộ do có sự hỗ trợ của ai.
 *   - Giỏi giang thì tự code bằng năng lực của mình đang video làm toàn bộ từ đầu đến cuối, còn không làm được đừng có kích đểu ảnh hưởng đến người sử dụng.
 *   - Bạn chẳng phải là anh hùng mặc áo choàng đỏ mặc quần xịt như thằng trẻ trâu rồi lên mạng ra vẻ ta đây là người tốt, là anh hùng, là người bảo vệ công lý gì đâu :).
 *   - Vậy nên bớt ảo tưởng đi.
 *   - Nếu có sử dụng hoặc tham khảo code này, hãy ghi công cho FoxStudio.
 *   - Minecraft là một thương hiệu của Mojang Studios / Microsoft. Dự án này không liên kết với Mojang.
 */

import { useEffect, useState } from 'react'

export const BG_THEMES = [

  {
    id: 'dark',
    label: 'Dark',
    category: 'Tối giản',
    preview: 'linear-gradient(135deg,#0a0a0a,#111)',
    baseColor: '#0a0a0a',
  },
  {
    id: 'darker',
    label: 'Abyss',
    category: 'Tối giản',
    preview: 'linear-gradient(135deg,#050505,#0a0a0a)',
    baseColor: '#050505',
  },
  {
    id: 'charcoal',
    label: 'Charcoal',
    category: 'Tối giản',
    preview: 'linear-gradient(135deg,#0f0f0f,#1a1a1a)',
    baseColor: '#0f0f0f',
  },

  {
    id: 'forest',
    label: 'Forest',
    category: 'Thiên nhiên',
    preview: 'linear-gradient(135deg,#0b0f12,#090d11)',
    baseColor: '#0b0f12',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    category: 'Thiên nhiên',
    preview: 'linear-gradient(135deg,#0a0f1a,#0d1b2b)',
    baseColor: '#0a0f1a',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    category: 'Thiên nhiên',
    preview: 'linear-gradient(135deg,#071a14,#0a1a1f,#0d1a2b)',
    baseColor: '#071a14',
  },

  {
    id: 'sunset',
    label: 'Sunset',
    category: 'Màu sắc',
    preview: 'linear-gradient(135deg,#1a0a0a,#2b0d0d)',
    baseColor: '#1a0a0a',
  },
  {
    id: 'purple',
    label: 'Nebula',
    category: 'Màu sắc',
    preview: 'linear-gradient(135deg,#0f0a1a,#1a0d2b)',
    baseColor: '#0f0a1a',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    category: 'Màu sắc',
    preview: 'linear-gradient(135deg,#080818,#0d0d28)',
    baseColor: '#080818',
  },

  {
    id: 'anim-pulse',
    label: 'Pulse',
    category: 'Hiệu ứng',
    preview: 'linear-gradient(135deg,#0b0f12,#090d11)',
    baseColor: '#080f08',
    animated: true,
  },
  {
    id: 'anim-aurora',
    label: 'Aurora Borealis',
    category: 'Hiệu ứng',
    preview: 'linear-gradient(135deg,#071a14,#0a0f1a,#0d1a2b)',
    baseColor: '#060d10',
    animated: true,
  },
  {
    id: 'anim-stars',
    label: 'Starfield',
    category: 'Hiệu ứng',
    preview: 'linear-gradient(135deg,#050510,#0a0a1a)',
    baseColor: '#050510',
    animated: true,
  },
  {
    id: 'anim-matrix',
    label: 'Matrix',
    category: 'Hiệu ứng',
    preview: 'linear-gradient(135deg,#000a00,#001400)',
    baseColor: '#000a00',
    animated: true,
  },
  {
    id: 'anim-ember',
    label: 'Ember',
    category: 'Hiệu ứng',
    preview: 'linear-gradient(135deg,#1a0500,#2b0a00)',
    baseColor: '#100300',
    animated: true,
  },
]

function PulseBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: '#080f08' }} />
      {}
      <div
        className="absolute rounded-full"
        style={{
          width: '60vw', height: '60vw',
          top: '-20vw', left: '-10vw',
          background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)',
          animation: 'bg-pulse-1 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '50vw', height: '50vw',
          bottom: '-15vw', right: '-10vw',
          background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
          animation: 'bg-pulse-2 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '30vw', height: '30vw',
          top: '40%', left: '40%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
          animation: 'bg-pulse-3 6s ease-in-out infinite',
        }}
      />
      {}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(74,222,128,1) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,1) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  )
}

function AuroraBorealisBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: '#060d10' }} />
      {}
      <div
        className="absolute"
        style={{
          top: '-10%', left: '-20%', right: '-20%', height: '60%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,255,150,0.04) 30%, rgba(0,180,255,0.06) 60%, transparent 100%)',
          borderRadius: '50%',
          animation: 'aurora-wave-1 12s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '5%', left: '-30%', right: '-30%', height: '50%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(100,0,255,0.03) 40%, rgba(0,200,200,0.05) 70%, transparent 100%)',
          borderRadius: '50%',
          animation: 'aurora-wave-2 15s ease-in-out infinite',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '10%', left: '-10%', right: '-10%', height: '40%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,255,200,0.03) 50%, transparent 100%)',
          borderRadius: '50%',
          animation: 'aurora-wave-3 9s ease-in-out infinite',
          filter: 'blur(30px)',
        }}
      />
      {}
      <div className="absolute inset-0" style={{ opacity: 0.4 }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() > 0.8 ? 2 : 1,
              height: Math.random() > 0.8 ? 2 : 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
              animation: `star-twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function StarfieldBackground() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() > 0.9 ? 2 : 1,
    opacity: 0.15 + Math.random() * 0.6,
    duration: 2 + Math.random() * 5,
    delay: Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#050510 0%,#0a0a1a 100%)' }} />
      {}
      <div
        className="absolute"
        style={{
          top: '20%', left: '-20%', right: '-20%', height: '60%',
          background: 'linear-gradient(135deg, transparent 0%, rgba(150,100,255,0.03) 40%, rgba(100,150,255,0.04) 60%, transparent 100%)',
          filter: 'blur(60px)',
          transform: 'rotate(-15deg)',
        }}
      />
      {}
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            width: s.size, height: s.size,
            top: `${s.y}%`, left: `${s.x}%`,
            opacity: s.opacity,
            animation: `star-twinkle ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {}
      <div
        className="absolute"
        style={{
          top: '15%', left: '10%',
          width: 80, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
          animation: 'shooting-star 6s linear infinite',
          animationDelay: '2s',
        }}
      />
    </div>
  )
}

function MatrixBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: '#000a00' }} />
      {}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.015) 2px, rgba(0,255,0,0.015) 4px)',
        }}
      />
      {}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0"
          style={{
            left: `${(i / 8) * 100 + 6}%`,
            width: 1,
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,255,70,0.08) 30%, rgba(0,255,70,0.15) 50%, rgba(0,255,70,0.08) 70%, transparent 100%)',
            animation: `matrix-col ${3 + i * 0.7}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
      {}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,70,0.04) 0%, transparent 60%)',
          animation: 'bg-pulse-1 6s ease-in-out infinite',
        }}
      />
    </div>
  )
}

function EmberBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#100300 0%,#1a0500 100%)' }} />
      {}
      <div
        className="absolute rounded-full"
        style={{
          width: '70vw', height: '40vw',
          bottom: '-20vw', left: '50%', transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(255,80,0,0.08) 0%, rgba(255,40,0,0.04) 40%, transparent 70%)',
          animation: 'ember-glow 5s ease-in-out infinite',
          filter: 'blur(20px)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '40vw', height: '30vw',
          top: '20%', left: '10%',
          background: 'radial-gradient(ellipse, rgba(255,120,0,0.05) 0%, transparent 70%)',
          animation: 'ember-glow 7s ease-in-out infinite',
          animationDelay: '2s',
          filter: 'blur(30px)',
        }}
      />
      {}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 2,
            height: 2 + Math.random() * 2,
            left: `${10 + Math.random() * 80}%`,
            bottom: `${Math.random() * 30}%`,
            background: `rgba(255,${80 + Math.floor(Math.random() * 100)},0,0.7)`,
            boxShadow: '0 0 4px rgba(255,100,0,0.5)',
            animation: `ember-float ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  )
}

const ANIMATED_RENDERERS = {
  'anim-pulse':  PulseBackground,
  'anim-aurora': AuroraBorealisBackground,
  'anim-stars':  StarfieldBackground,
  'anim-matrix': MatrixBackground,
  'anim-ember':  EmberBackground,
}

export default function AppBackground({ bgId }) {
  const theme = BG_THEMES.find(t => t.id === bgId) ?? BG_THEMES[0]
  const Renderer = ANIMATED_RENDERERS[bgId]

  if (Renderer) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Renderer />
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: theme.preview }}
    />
  )
}

