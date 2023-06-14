import * as PIXI from 'pixi.js';
import { useEffect, useRef } from 'react';
import bunnyTexture from './assets/bunny.png'
let app = null
let scaleTo = 2
let rotationSpeed = 0.05
const rotationFeatureAnimation = true
const dragFeatureAnimation = false
let dragTarget = null
const style = {
  width: '100%',
  height: '100',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}
function App() {
  const appWidth = 800
  const appHeight = 600
  const pixiRef = useRef(null)
  const createPixiApp = (props, stateProps) => {
    app = new PIXI.Application(props)
    globalThis.__PIXI_APP__ = app
    for (const key in stateProps) {
      app.stage[key] = stateProps[key]
    }
    return app
  }
  const getPixiApp = () => { return app }
  const addEventPixiApp = (eventName, event, context) => {
    const app = getPixiApp()
    app.stage.on(eventName, event, context)
  }
  const removeEventPixiApp = (eventName, event, context) => {
    const app = getPixiApp()
    app.stage.off(eventName, event, context)
  }
  const createContainer = (props) => {
    const container = new PIXI.Container()
    for (const key in props) {
      container[key] = props[key]
    }
    return container
  }
  const createBunny = (props) => {
    const texture = PIXI.Texture.from(bunnyTexture)
    const bunny = new PIXI.Sprite(texture)
    for (const key in props) {
      bunny[key] = props[key]
    }
    return bunny
  }
  const rotationClick = (bunny) => {
    bunny.scale.x *= scaleTo
    bunny.scale.y *= scaleTo
    if (bunny.scale.x === 1 && scaleTo === 0.5) {
      scaleTo = 2
      rotationSpeed *= 0.5
    } else if (bunny.scale.x === 16 && scaleTo === 2) {
      scaleTo = 0.5
      rotationSpeed *= 2
    }
  }
  function onDragMove (evt) {
    if (dragTarget) {
      dragTarget.parent.toLocal(evt.global, null, dragTarget.position)
    }
  }
  function onDragStart () {
    this.alpha = 0.5
    dragTarget = this
    addEventPixiApp('pointermove', onDragMove)
  }
  function onDragEnd () {
    dragTarget.alpha = 1
    dragTarget = null
    removeEventPixiApp('pointermove', onDragMove)
  }
  useEffect(() => {
    if (app === null) {
      app = createPixiApp(
        { 
          width: appWidth, 
          height: appHeight, 
          backgroundColor: 0x1099bb,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        }, 
        {
          interactive: true,
          hitArea: new PIXI.Rectangle(0, 0, appWidth, appHeight),
        }
      )
      pixiRef.current.appendChild(app.view)
      if (dragFeatureAnimation) { 
        for (let i = 0; i < 10; i++) {
          const bunny = createBunny(
            {
              anchor: { x: 0.5, y: 0.5 },
              cursor: 'pointer',
              interactive: true,
              x: Math.random() * appWidth,
              y: Math.random() * appHeight
            }
          );
          bunny.on('pointerdown', onDragStart)
          app.stage.addChild(bunny)
        }
        addEventPixiApp('pointerup', onDragEnd)
        addEventPixiApp('pointerupoutside', onDragEnd)
      }
      if (rotationFeatureAnimation) {
        const container = createContainer({ 
          x: app.screen.width / 2, 
          y: app.screen.height / 2 
        })
        app.stage.addChild(container)
        const bunny = createBunny({ 
          anchor: { x: 0.5, y: 0.5 }, 
          cursor: 'pointer', 
          interactive: true 
        })
        container.addChild(bunny)
        bunny.on('pointerdown', () => rotationClick(bunny))
        app.ticker.add((delta) => {
          container.rotation -= rotationSpeed * delta;
        })
      }
    }
  }, [])
  return (
    <>
      <div style={style} ref={pixiRef} className='pixi-app'/>
    </>
  )
}

export default App
