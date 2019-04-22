// Not my concept simply modify a start-up animation to fit for spacely.
// orgianl creator for the start uup animations was from code pen https://codepen.io/Jack-undo/pen/rQGzMw


const tools = {
  drawPath(ctx, fn) {
    ctx.save()
    ctx.beginPath()
    fn()
    ctx.closePath()
    ctx.restore()
  },
  random(min, max, int) {
    let result = (min + Math.random() * ((max + (int ? 1 : 0)) - min))
    return int ? parseInt(result) : result
  },
  getVectorLength(p1, p2){
    return Math.sqrt(Math.pow(p1[0]-p2[0], 2) + Math.pow(p1[1]-p2[1], 2))
  },
  easing(t, b, c, d, s) {
    return c*((t=t/d-1)*t*t + 1)
  },
  cellEasing(t, b, c, d, s) {
    return c*(t/=d)*t*t*t + b;
  }
}
const doc = {
  height: 0,
  width: 0
}
const plane = {
  xCell: 0,
  yCell: 0,
  cells: []
}
const context = {
  plane: null,
  main: null
}
const none = {
}
const cfg = {
  cell: 30,
  sectionWidth: 1,
  sectionHeight: 1,
  numberOffset: 5,
  shadowBlur: true,
  bgColor: '#181818'
}
const ui = {
  plane: '#plane-canvas',
  main: '#main-canvas',
}
class App{
  constructor() {
    this.state = {
      area: 0,
      time: Date.now(),
      lt: 0,
      planeProgress: 0,
      markupOffset: 0,
      tabIsActive: true,
      planeIsDrawn: false,
      dlt: performance.now(), }
    this.bindNodes()
    this.getDimensions()
    none.x = doc.width / 2
    none.y = doc.height / 2
    this.start()
  };
  start(){
    this.initEvents()
    this.canvasInit()
    this.loop()
  }
  getDimensions() {
    doc.height = document.documentElement.clientHeight
    doc.width = document.documentElement.clientWidth
  }
  updatePlane(){
    const { width: w, height: h } = doc
    const cell = Math.round(w / cfg.cell)
    const xPreSize = w / cell
    plane.xCell = (w / xPreSize) % 2 !== 0 ? w / ((w / xPreSize) + 1) : xPreSize
    const yPreSize = h / Math.round(cell * (h / w))
    plane.yCell = (h / yPreSize) % 2 !== 0 ? h / ((h / yPreSize) + 1) : yPreSize
    plane.cells = [Math.round(w / plane.xCell), Math.round(h / plane.yCell)]
    plane.xCenter = Math.round((plane.cells[1]) / 2)
    plane.yCenter = Math.round((plane.cells[0]) / 2)
    plane.centerCoords = [plane.yCenter * plane.xCell, plane.xCenter * plane.yCell]
  }
  bindNodes() {
    for (const selector in ui) {
      ui[selector] = document.querySelectorAll(ui[selector])
      if(ui[selector].length === 1) ui[selector] = ui[selector][0]
    }
  }
  canvasInit(){
    const font = '10px Montserrat'
    const lineCapAndJoin = 'round'
    const color = `rgba(255,255,255,0.1)`
    context.plane = ui.plane.getContext('2d')
    context.plane.lineCap = lineCapAndJoin
    context.plane.lineJoin = lineCapAndJoin
    context.plane.font = font
    context.plane.fillStyle = color
    context.plane.strokeStyle = color
    context.main = ui.main.getContext('2d')
    context.main.lineCap = lineCapAndJoin
    context.main.lineJoin = lineCapAndJoin
    context.main.font = font
    context.main.fillStyle = color
    context.main.strokeStyle = color
  }
  initEvents() {

    window.addEventListener('resize', (e) => {
      this.getDimensions()
      this.resizeHandler(e)
    })

    this.resizeHandler()

  }
  resizeHandler(e){
    const state = this.state
    state.area = (doc.width * doc.height) / 1000000
    ui.main.height = doc.height
    ui.main.width = doc.width
    ui.plane.height = doc.height
    ui.plane.width = doc.width
    this.updatePlane()
    this.updateTextConfig()
    if (state.planeIsDrawn)
    state.needRedraw = true
  }
  updateTextConfig(){
    const state = this.state
    state.text = {
    }
  }

  loop(){
    const loop = () => {
      const ctx = context.main
      const state = this.state
      state.time = Date.now()
      ctx.clearRect(0, 0, doc.width, doc.height)
      this.updateState()
      this.draw()
      if (state.needRedraw) state.needRedraw = false
      this.raf = requestAnimationFrame(loop)
    }
    loop()
  }
  updateState(){
    const state = this.state
    const now = performance.now()
    state.delta = now - state.dlt
    state.dlt = now
    const dt = state.delta
    const mp = tools.cellEasing(state.mousePower, 0, 1, 1)
    state.planeProgress += 0.00035 * dt
    if(state.planeProgress >= 1) state.planeProgress = 1

    if (state.planeIsDrawn) {
    }
  }
  draw(){
    const ctx = context.main
    const state = this.state
    const {
      xCell,
      yCell,
      xCenter,
      yCenter,
      cells
    } = plane
    const cp = state.planeProgress
    if (this.state.planeProgress >= 1 && !state.planeIsDrawn) {
      state.planeIsDrawn = true
    }
    if (!state.planeIsDrawn || state.dotsProgress < 1 || state.planeIsDrawn && state.needRedraw) {
      this.drawPlane()
    }
    for (let i = 0; i < cells[0]; i++) {
      for (let i2 = 0; i2 < cells[1]; i2++) {
        const x = i * xCell
        const y = i2 * yCell
        if (state.planeIsDrawn) {   
          if (i2 === xCenter && i !== yCenter) {
            this.drawMarkupYAnimation({i, i2, x, y, cp}) }
          if (i2 !== xCenter && i === yCenter) {
            this.drawMarkupXAnimation({i, i2, x, y, cp})
          }
        }
      }
    }
  }
 
  drawPlaneCenterLines(props){
    const { p } = props
    const ctx = context.plane
    const {
      centerCoords
    } = plane
    tools.drawPath(ctx, () => {
      ctx.fillStyle = `rgba(255,255,255,${ 0.2 + ((1-p)*1) })`
      ctx.fillRect(centerCoords[0], 0 + ((doc.height / 2) * (1-p)), 1, doc.height * p)
      ctx.fillRect(0 + ((doc.width / 2) * (1-p)), centerCoords[1], doc.width * p, 1)
    })
  }
  drawYLines(props){
    const { i, cp, p, x } = props
    const ctx = context.plane
    const {
      yCenter
    } = plane
    const percent = 1 / yCenter
    const pos = Math.abs(i - yCenter)
    const point = percent * pos
    let f = cp * (cp / point)
    if (f >= 1) f = 1
    const ef = tools.cellEasing(f, 0, 1, 1)
    if (i) {
      tools.drawPath(ctx, () => {
        ctx.fillStyle = `rgba(255,255,255,${ 0.05 + ((1-p)*0.35) })`
        ctx.fillRect(x, 0 + ((doc.height / 2) * (1-ef)), 1, doc.height * ef)
      })
    }
  }
  drawYMarkup(props) {
    const ctx = context.plane
    const state = this.state
    let { i, p, cp, x, y } = props
    const {
      yCenter
    } = plane
    const percent = 1 / yCenter
    const pos = Math.abs(i - yCenter)
    const point = percent * pos
    const conds = [p >= point, p <= point + percent]
    let f = cp * (cp / point)
    if (f >= 1) f = 1
    const f2 = conds[0] && conds[1] ? (p - point) / percent : conds[0] ? 1 : 0
    const text = (i - yCenter) + ''
    ctx.fillStyle = `rgba(255,255,255,${ 0.1 + ((1-f)*0.75) })`
    const textCoords = [x - (ctx.measureText(text).width / 2), y + (cfg.sectionWidth / 2) + cfg.numberOffset]
    tools.drawPath(ctx, () => {
      const o = ((1-f2) * 50)
      ctx.globalAlpha = f2
      ctx.fillRect(x, y - cfg.sectionWidth / 2 + (o), cfg.sectionHeight, cfg.sectionWidth)
    })
    tools.drawPath(ctx, () => {
      ctx.globalAlpha = f2
      ctx.textBaseline = 'top'
      ctx.fillText(
        text,
        textCoords[0],
        textCoords[1] + ((1-f2) * (-20))
      )
    })
  }
  drawXLines(props) {
    const ctx = context.plane
    const { i2, cp, p, y } = props
    const {
      xCenter
    } = plane
    const percent = 1 / (xCenter)
    const pos = (Math.abs(i2 - xCenter))
    const point = percent * pos
    let f = cp * (cp / point)
    if (f >= 1) f = 1
    const ef = tools.cellEasing(f, 0, 1, 1)
    if (i2) {
      tools.drawPath(ctx, () => {
        ctx.fillStyle = `rgba(255,255,255,${ 0.05 + ((1-p)*0.35) })`
        ctx.fillRect(0 + ((doc.width / 2) * (1-ef)), y, doc.width * ef, 1)
      })
    }
  }
  drawXMarkup(props){
    const ctx = context.plane
    const state = this.state
    let { i2, p, cp, x, y } = props
    const {
      xCenter
    } = plane
    const percent = 1 / xCenter
    const pos = Math.abs(i2 - xCenter)
    const point = percent * pos
    const conds = [p >= point, p <= point + percent]
    let f = cp * (cp / point)
    if (f >= 1) f = 1
    let f2 = conds[0] && conds[1] ? (p - point) / percent : conds[0] ? 1 : 0
    ctx.fillStyle = `rgba(255,255,255,${ 0.1 + ((1-f)*0.75) })`
    tools.drawPath(ctx, () => {
      const o = ((1-f2) * 50)
      ctx.globalAlpha = f2
      ctx.fillRect(x - cfg.sectionWidth / 2 + o, y, cfg.sectionWidth, cfg.sectionHeight)
    })
    tools.drawPath(ctx, () => {
      ctx.globalAlpha = f2
      ctx.textBaseline = 'middle'
      const textCoords = [x + (cfg.sectionWidth / 2) + cfg.numberOffset, y + cfg.sectionHeight / 2]
      ctx.fillText(
        (xCenter - i2) + '',
        textCoords[0] + ((1-f2) * (-20)),
        textCoords[1]
      )
    })
  }
  drawPlane(){
    const state = this.state
    const ctx = context.plane
    ctx.clearRect(0, 0, doc.width, doc.height)
    const {
      xCell,
      yCell,
      xCenter,
      yCenter,
      cells
    } = plane
    const p = tools.easing(state.planeProgress, 0, 1, 1)
    const cp = state.planeProgress
    const dp = state.dotsProgress
    this.drawPlaneCenterLines({p})
    for (let i = 0; i < cells[0]; i++) {
      for (let i2 = 0; i2 < cells[1]; i2++) {
        const x = i * xCell
        const y = i2 * yCell
        
        if (i2 === xCenter && i !== yCenter) {
          this.drawYLines({i, i2, p, cp, x, y})
          this.drawYMarkup({i, p, cp, x, y})
        }
        if (i2 !== xCenter && i === yCenter) {
          this.drawXLines({i, i2, p, cp, x, y})
          this.drawXMarkup({i2, p, cp, x, y})
        }
      }
    }
  }
  drawMarkupYAnimation(props){

    const ctx = context.main
    const {  yCenter  } = plane
    const { i, x, y } = props
    const state = this.state
    const spSin = Math.sin(state.markupOffset)
    const sp = spSin >= 0 ? tools.cellEasing(Math.abs(spSin), 0, 1, 1) : 0
    const percent = 1 / yCenter
    const pos = Math.abs(i - yCenter)
    const point = percent * pos
    const f = sp >= point && sp <= point + percent ? (sp - point) / percent : 0
    if (!f) return
    const text = (i - yCenter) + ''
    ctx.fillStyle = `rgba(255,255,255,${ 0.1 + ((1-f)*0.75) })`
    const textCoords = [x - (ctx.measureText(text).width / 2), y + (cfg.sectionWidth / 2) + cfg.numberOffset]
    tools.drawPath(ctx, () => {
      ctx.fillStyle = `rgba(255,255,255,${ f * 0.5 })`
      ctx.fillRect(x, y - cfg.sectionWidth / 2, cfg.sectionHeight, cfg.sectionWidth)
    })
    tools.drawPath(ctx, () => {
      if (cfg.shadowBlur) {
        ctx.shadowBlur = 5
        ctx.shadowColor = 'white' }
      ctx.fillStyle = `rgba(255,255,255,${ f * 0.35 })`
      ctx.textBaseline = 'top'
      ctx.fillText(
        text,
        textCoords[0],
        textCoords[1]
      )
    })
  }

  drawMarkupXAnimation(props){

    const ctx = context.main
    const state = this.state
    let { i2, x, y } = props
    const spSin = Math.sin(state.markupOffset)
    const sp = spSin <= 0 ? tools.cellEasing(Math.abs(spSin), 0, 1, 1) : 0
    const { xCenter } = plane
    const percent = 1 / xCenter
    const pos = Math.abs(i2 - xCenter)
    const point = percent * pos
    const f = sp >= point && sp <= point + percent ? (sp - point) / percent : 0
    if (!f) return
    tools.drawPath(ctx, () => {
      ctx.fillStyle = `rgba(255,255,255,${ f * 0.5 })`
      ctx.fillRect(x - cfg.sectionWidth / 2, y, cfg.sectionWidth, cfg.sectionHeight)
    })
    tools.drawPath(ctx, () => {
      if (cfg.shadowBlur) {
        ctx.shadowBlur = 5
        ctx.shadowColor = 'white'
      }
      ctx.fillStyle = `rgba(255,255,255,${ f * 0.3 })`
      ctx.textBaseline = 'middle'
      const textCoords = [x + (cfg.sectionWidth / 2) + cfg.numberOffset, y + cfg.sectionHeight / 2]
      ctx.fillText(
        (xCenter - i2) + '',
        textCoords[0],
        textCoords[1]
      )
    })
  }
}
window.addEventListener('load', () => {
  window.app = new App()
})

