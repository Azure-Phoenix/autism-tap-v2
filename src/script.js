import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"

import { gsap } from "gsap"

// import JSConfetti from "js-confetti"
import confetti from "canvas-confetti"

/**
 ******************************
 ****** Three.js Initial ******
 ******************************
 */

/**
 * Init
 */
// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0xe9e9e9)
const scene1 = new THREE.Scene()

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / 2 / window.innerHeight,
  0.1,
  1000
)
camera.position.set(1.6, 1, -1)
camera.lookAt(0.2, 0.1, 0)
scene.add(camera)

// const size = 1.7
// const cameraWidth = (size * window.innerWidth) / window.innerHeight / 2
// const cameraHeight = size / 2

// const camera = new THREE.OrthographicCamera(
//   -cameraWidth / 2,
//   cameraWidth / 2,
//   cameraHeight,
//   -cameraHeight,
//   1,
//   1000
// )
// camera.position.set(0, 1.5, 1.5)
// camera.lookAt(0, 0, -0.5)
// scene.add(camera)

const camera1 = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / 2 / window.innerHeight,
  0.1,
  1000
)
camera1.position.set(1.6, 1, -1)
camera1.lookAt(0.2, 0.1, 0)
scene1.add(camera1)

// const camera1 = new THREE.OrthographicCamera(
//   -cameraWidth / 2,
//   cameraWidth / 2,
//   cameraHeight,
//   -cameraHeight,
//   1,
//   1000
// )
// camera1.position.set(0, 1.5, 1.5)
// camera1.lookAt(0, 0, -0.5)
// scene1.add(camera1)

/**
 * Addition
 */
// Controls
// const orbitControls = new OrbitControls(camera, canvas)
// orbitControls.enableDamping = true
// const orbitControls1 = new OrbitControls(camera1, canvas)
// orbitControls1.enableDamping = true

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)
const ambientLight1 = new THREE.AmbientLight(0xffffff, 1)
scene1.add(ambientLight1)

// Environment Map
new RGBELoader().setPath("environment/").load("royal_esplanade_1k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping

  // scene.background = texture;
  scene.environment = texture
  scene1.environment = texture
})

// Clock
const clock = new THREE.Clock()

// Raycaster
const raycaster = new THREE.Raycaster()

// Axes
// const axes = new THREE.AxesHelper(10)
// scene.add(axes)

// Loading
const manager = new THREE.LoadingManager()

// GLTF Loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("/draco/")
const gltfLoader = new GLTFLoader(manager)
gltfLoader.setDRACOLoader(dracoLoader)

// Audio
const audioLoader = new THREE.AudioLoader()
const audioListener = new THREE.AudioListener()
const audio = new THREE.Audio(audioListener)

audioLoader.load("audios/doThis.mp3", (buffer) => {
  audio.setBuffer(buffer)
  audio.setLoop(false)
  audio.setVolume(0.5)
})

/**
 ******************************
 ************ Main ************
 ******************************
 */

/**
 * Definitions
 */
// Confetti
// const jsConfetti = new JSConfetti()

// game parameters
let step = 1

let mouse = new THREE.Vector2()
let startPosition = new THREE.Vector2()
let promptStartPosition = new THREE.Vector3()
let promptEndPosition = new THREE.Vector3()

// Main Model
let tap = []
let cursor
let animations = [{}, {}]
let mixer = []
let curAnim = []
let waterFlow = []

let promptLimit = 0
let isUserInteracted = false
let isInteractAvailable = false
let isCorrectStart = false

// Loading Progress Bar
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  document.querySelector(".progressbar").style.width =
    (itemsLoaded / itemsTotal) * 100 + "%"
  if (itemsLoaded === itemsTotal) {
    document.querySelector("#instructions").innerHTML = `
                <span class="buttonload" stu>
                    <i class="fa fa-spinner fa-spin"></i>Click to Start!
                </span>
            `
    window.addEventListener("mousedown", (e) => {
      try {
        document.querySelector(".progress").style.opacity = 1
        document.querySelector("#blocker").style.opacity = 1

        gsap.to(document.querySelector(".progress").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
        })
        gsap.to(document.querySelector("#blocker").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
          onComplete: () => {
            document.querySelector(".progress").remove()
            document.querySelector("#blocker").remove()
            setTimeout(() => {
              setTimeout(() => {
                prompt()
              }, 5000)
              try {
                audio.play()
                playAnim(0, "step1")
              } catch {}
            }, 2000)
          },
        })
      } catch {}
    })

    window.addEventListener("touchstart", (e) => {
      try {
        document.querySelector(".progress").style.opacity = 1
        document.querySelector("#blocker").style.opacity = 1

        gsap.to(document.querySelector(".progress").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
        })
        gsap.to(document.querySelector("#blocker").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
          onComplete: () => {
            document.querySelector(".progress").remove()
            document.querySelector("#blocker").remove()
            setTimeout(() => {
              setTimeout(() => {
                prompt()
              }, 5000)
              try {
                audio.play()
                playAnim(0, "step1", 0)
              } catch {}
            }, 2000)
          },
        })
      } catch {}
    })
  }
}

/**
 * Models
 */
gltfLoader.load(`/models/tap2.glb`, (gltf) => {
  tap[0] = gltf.scene
  tap[0].rotation.y = Math.PI

  tap[0].traverse((child) => {
    if (child.name.startsWith("Wall")) {
      // child.visible = false
      child.children[0].material = new THREE.MeshStandardMaterial({ color: 0xbababa }) // floor
      // child.children[1].material = new THREE.MeshStandardMaterial({ color: 0xbababa }) // wall
    }

    if (child.name === "Water_Flow") {
      waterFlow[0] = child.material
      waterFlow[0].map.wrapS = THREE.RepeatWrapping
      waterFlow[0].map.wrapT = THREE.RepeatWrapping
    }

    if (child.name.startsWith("Hidden")) {
      child.visible = false
    }
  })

  for (let i = 0; i < gltf.animations.length; i++) {
    console.log(gltf.animations[i].name, gltf.animations[i].duration)
  }

  mixer[0] = new THREE.AnimationMixer(tap[0])

  animations[0].idle = mixer[0].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Idle")
  )
  animations[0].step1 = mixer[0].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Step_1")
  )
  animations[0].step2 = mixer[0].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Step_2")
  )
  animations[0].step3 = mixer[0].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Step_3")
  )
  animations[0].change1 = mixer[0].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Hand_Change_1")
  )
  animations[0].change2 = mixer[0].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Hand_Change_2")
  )

  for (let anim in animations[0]) {
    if (anim != "idle") {
      animations[0][anim].setLoop(THREE.LoopOnce)
      animations[0][anim].clampWhenFinished = true
    }
  }

  curAnim[0] = animations[0].idle
  curAnim[0].play()

  // tap[0].position.x = -1

  scene.add(tap[0])
})

gltfLoader.load(`/models/tap2.glb`, (gltf) => {
  tap[1] = gltf.scene
  tap[1].rotation.y = Math.PI

  tap[1].traverse((child) => {
    if (child.name.startsWith("Wall")) {
      // child.visible = false
      child.children[0].material = new THREE.MeshStandardMaterial({ color: 0xbababa }) // floor
      // child.children[1].material = new THREE.MeshStandardMaterial({ color: 0xbababa }) // wall
    }

    if (child.name === "Water_Flow") {
      waterFlow[1] = child.material
      waterFlow[1].map.wrapS = THREE.RepeatWrapping
      waterFlow[1].map.wrapT = THREE.RepeatWrapping
    }

    if (child.name.startsWith("Hidden")) {
      if (child.name.endsWith("start")) promptStartPosition = child.position
      if (child.name.endsWith("end")) promptEndPosition = child.position
      child.visible = false
      // child.material.transparent = true
      // child.material.opacity = 0.5
    }
  })

  mixer[1] = new THREE.AnimationMixer(tap[1])

  animations[1].idle = mixer[1].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Idle")
  )
  animations[1].step1 = mixer[1].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Step_1")
  )
  animations[1].step2 = mixer[1].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Step_2")
  )
  animations[1].step3 = mixer[1].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Step_3")
  )
  animations[1].change1 = mixer[1].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Hand_Change_1")
  )
  animations[1].change2 = mixer[1].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Hand_Change_2")
  )

  for (let anim in animations[1]) {
    if (anim != "idle") {
      animations[1][anim].setLoop(THREE.LoopOnce)
      animations[1][anim].clampWhenFinished = true
    }
  }

  curAnim[1] = animations[1].idle
  curAnim[1].play()

  // tap[1].position.x = 1

  scene1.add(tap[1])
})

// Prompt
gltfLoader.load("/models/cursor.glb", (gltf) => {
  cursor = gltf.scene
  cursor.lookAt(camera1.position)
  cursor.scale.set(0.3, 0.3, 0.3)
  cursor.children[0].material.depthTest = false
  cursor.children[0].material.depthWrite = false
  cursor.children[0].renderOrder = 1
  cursor.children[0].material.opacity = 0
  scene1.add(cursor)
})

/**
 * Functioins
 */
// Prompt
function prompt() {
  audio.play()
  cursor.position.copy(promptStartPosition)
  isInteractAvailable = true
  isUserInteracted = false
  gsap.to(cursor.children[0].material, {
    opacity: 1,
    duration: 1,
    onComplete: () => {
      gsap.fromTo(
        cursor.position,
        {
          x: promptStartPosition.x,
          y: promptStartPosition.y,
          z: promptStartPosition.z,
        },
        {
          x: promptEndPosition.x,
          y: promptEndPosition.y,
          z: promptEndPosition.z,
          duration: 1.5,
          onComplete: () => {
            hidePrompt()
            setTimeout(() => {
              if (!isUserInteracted) {
                promptLimit++
                if (promptLimit == 3) {
                  isInteractAvailable = false
                  promptLimit = 0
                  playAnim(1, `step${step}`)
                  step++
                  setTimeout(() => {
                    console.log(step)
                    playAnim(0, `change${step - 1}`)
                    playAnim(1, `change${step - 1}`)
                    if (step == 2) {
                      setTimeout(() => {
                        audio.play()
                        playAnim(0, `step${step}`)
                        setTimeout(() => {
                          prompt()
                        }, 3000)
                      }, 2500)
                    } else if (step == 3) {
                      setTimeout(() => {
                        audio.play()
                        playAnim(0, `step${step}`)
                        setTimeout(() => {
                          prompt()
                        }, 3000)
                      }, 2500)
                    }
                  }, 3500)
                } else {
                  prompt()
                }
              }
            }, 5500)
          },
        }
      )
    },
  })
}

function hidePrompt() {
  cursor.scale.set(0.3, 0.3, 0.3)
  gsap.to(cursor.children[0].material, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      gsap.killTweensOf(cursor.children[0].material)
      gsap.killTweensOf(cursor.position)
    },
  })
}

// Animation Play
function playAnim(id, name, period = 0.5) {
  const newAction = animations[id][name]
  const oldAction = curAnim[id]

  newAction.reset()
  newAction.play()
  // oldAction.stop()

  try {
    if (newAction != oldAction) newAction.crossFadeFrom(oldAction, period)
  } catch {}

  curAnim[id] = newAction
}

function refresh() {
  location.reload()
}

function tada() {
  confetti({
    particleCount: 250,
    spread: 120,
    origin: { x: 0.2, y: 0.65 },
  })
  confetti({
    particleCount: 250,
    spread: 120,
    origin: { x: 0.7, y: 0.65 },
  })
}

/**
 * Event Listeners
 */
window.addEventListener("mousedown", (event) => {
  mouse.x = ((2 * event.clientX - window.innerWidth) / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  console.log(camera.position)
  console.log(camera.rotation)

  if (intersects.length > 0) {
    let pointedObject = intersects[0].object
    if (pointedObject.name == "Hidden_start") isCorrectStart = true
  }
})

window.addEventListener("mouseup", (event) => {
  mouse.x = ((2 * event.clientX - window.innerWidth) / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    let pointedObject = intersects[0].object
    if (pointedObject.name === "Hidden_end" && isInteractAvailable && isCorrectStart) {
      promptLimit = 0
      isUserInteracted = true
      isInteractAvailable = false
      hidePrompt()
      tada()
      playAnim(1, `step${step}`)
      step++
      if (step == 4) {
        setTimeout(() => {
          refresh()
        }, 5000)
      }
      setTimeout(() => {
        console.log(step)
        playAnim(0, `change${step - 1}`)
        playAnim(1, `change${step - 1}`)
        if (step == 2) {
          setTimeout(() => {
            audio.play()
            playAnim(0, `step${step}`)
            setTimeout(() => {
              prompt()
            }, 3000)
          }, 2000)
        } else if (step == 3) {
          setTimeout(() => {
            audio.play()
            playAnim(0, `step${step}`)
            setTimeout(() => {
              prompt()
            }, 3000)
          }, 2000)
        }
      }, 3500)
    }
  }
  isCorrectStart = false
})

window.addEventListener("touchstart", (event) => {
  mouse.x =
    ((2 * event.changedTouches[0].clientX - window.innerWidth) / window.innerWidth) * 2 -
    1
  mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    let pointedObject = intersects[0].object
    if (pointedObject.name == "Hidden_start") isCorrectStart = true
  }
})

window.addEventListener("touchend", (event) => {
  mouse.x =
    ((2 * event.changedTouches[0].clientX - window.innerWidth) / window.innerWidth) * 2 -
    1
  mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    let pointedObject = intersects[0].object
    if (pointedObject.name === "Hidden_end" && isInteractAvailable && isCorrectStart) {
      isUserInteracted = true
      isInteractAvailable = false
      hidePrompt()
      tada()
      playAnim(1, `step${step}`)
      step++
    }
  }
  isCorrectStart = false
})

// Auto Resize
window.addEventListener("resize", () => {
  // const newAspect = window.innerWidth / 2 / window.innerHeight

  // camera.left = (size * newAspect) / -2
  // camera.right = (size * newAspect) / 2

  // camera.updateProjectionMatrix()

  // camera1.left = (size * newAspect) / -2
  // camera1.right = (size * newAspect) / 2

  // camera1.updateProjectionMatrix()

  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight / 2
  camera.updateProjectionMatrix()

  camera1.aspect = window.innerWidth / window.innerHeight / 2
  camera1.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Animate
 */
const animate = () => {
  // Delta Time
  const deltaTime = clock.getDelta()

  if (mixer[0]) mixer[0].update(deltaTime)
  if (waterFlow[0]) {
    waterFlow[0].map.offset.y -= 0.02
  }

  if (mixer[1]) mixer[1].update(deltaTime)
  if (waterFlow[1]) {
    waterFlow[1].map.offset.y -= 0.02
  }

  // Update controls
  // orbitControls.update()
  // orbitControls1.update()

  // Render Scene
  renderer.autoClear = false

  // Render first scene
  renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight)
  renderer.render(scene, camera)

  // Render second scene
  renderer.setViewport(
    window.innerWidth / 2,
    0,
    window.innerWidth / 2,
    window.innerHeight
  )
  renderer.render(scene1, camera1)

  // Call animate again on the next frame
  window.requestAnimationFrame(animate)
}

animate()
