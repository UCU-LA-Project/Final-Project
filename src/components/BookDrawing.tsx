import { useEffect, useRef } from 'react'

type Point = [number, number]

// A drafting-style projection of an open book. Page edges and type follow the
// same curved surface, so the illustration stays crisp at every pixel density.
export default function BookDrawing() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    el.width = 530 * dpr
    el.height = 210 * dpr
    ctx.scale(dpr, dpr)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    const stroke = (points: Point[], color: string, width = 1, fill?: string) => {
      ctx.beginPath()
      points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))
      if (fill) { ctx.closePath(); ctx.fillStyle = fill; ctx.fill() }
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.stroke()
    }
    const right = '#5e80cd', left = '#7c96cf', dark = '#385eae'
    function point(side: number, u: number, v: number, depth = 0): Point {
      return [222 + 101*v + (side === 1 ? 131 : -140)*u,
        83 + 68*v + (side === 1 ? -43 : -22)*u - 16*Math.sin(Math.PI*u) + depth]
    }
    function across(side: number, v: number, depth: number, start = 0, end = 1) {
      return Array.from({length: 33}, (_, i) => point(side, start + (end-start)*i/32, v, depth))
    }
    function page(side: number, depth: number, fill: string, edge: string) {
      stroke([...across(side, 0, depth), ...across(side, 1, depth, 1, 0)], edge, .95, fill)
    }
    // Fine registration lines behind the book.
    ctx.setLineDash([3, 5])
    stroke([[60, 57], [492, 151]], '#9fb4de', .65)
    stroke([[180, 171], [416, 30]], '#a7bada', .65)
    ctx.setLineDash([])
    for (const [x,y] of [[76,88],[484,72],[202,178]]) {
      stroke([[x-4,y],[x+4,y]], '#8ea9da', .8)
      stroke([[x,y-4],[x,y+4]], '#8ea9da', .8)
    }
    for (const side of [-1, 1]) {
      page(side, 11, '#c2d3f4', dark)
      for (let d=8; d>=2; d-=2) page(side, d, '#ecf2fc', side === 1 ? right : left)
      page(side, 0, '#f1f6ff', dark)
      // Inset margin, short heading and uneven lines of manuscript.
      for (let i=0; i<14; i++) {
        const v = .15 + i*.052
        if (i === 1 || i === 7) continue
        const end = [0.74,0.89,0.83,0.86,0.78][i%5]
        const from = i===0 ? .36 : .12
        stroke(across(side,v,0,from,end), i===0 ? right : '#94acda', i===0 ? 1.6 : .75)
      }
    }
    // A fountain pen resting across the right-hand page.
    ctx.save()
    ctx.translate(365, 93)
    ctx.rotate(-.49)
    stroke([[-58,0],[-43,-4],[-35,-3],[-35,4],[-43,4]],dark,1,'#d5e3fa')
    stroke([[-57,0],[-44,0]],dark,.8)
    stroke([[-38,-3.5],[-17,-4.5],[-16,4.5],[-38,3.5]],dark,1,'#93b0e4')
    stroke([[-19,-5],[54,-5],[60,-2],[60,2],[54,5],[-19,5]],dark,1.2,'#c9daf6')
    stroke([[-16,-2.7],[53,-2.7]],'#f6f9ff',1.4)
    stroke([[15,-5],[15,5]],dark,1.7)
    stroke([[26,-6],[50,-7],[54,-5]],dark,1.4)
    ctx.restore()
  }, [])
  return <canvas aria-hidden="true" className="pointer-events-none h-auto w-24 opacity-70 sm:w-32 lg:w-40" ref={canvas} />
}
