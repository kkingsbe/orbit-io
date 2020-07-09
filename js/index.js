var scene, camera, renderer, controls
const width = window.innerWidth
const height = window.innerHeight
const ratio = width / height
var playerSphere;

const init = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, ratio, 1, 1000)
  camera.position.z = 7
  camera.position.y = 7
  camera.position.x = 3

  controls = new THREE.OrbitControls(camera, document.getElementById("viewport"))

  //axis
  axis = new THREE.AxisHelper(300)
  scene.add(axis)
  //sphere
  var geometry = new THREE.SphereGeometry( 5, 32, 32 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  var sphere = new THREE.Mesh( geometry, material );
  scene.add( sphere );
  //sphere initial position
  sphere.position.x = 20;
  playerSphere = sphere;

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setClearColor("#303030")
  renderer.setSize(width, height)

  document.getElementById("viewport").append(renderer.domElement)

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  const animate = () => {
    //sphere.position.y += 0.1
  }

  const render = () => {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
    controls.update()
    animate()
  }
  render()
}
  //input handling and movement
  document.addEventListener('keydown', function(event) {
      if(event.keyCode == 87) {
          console.log('Forward was pressed');
          playerSphere.position.x -= 1;
      }
      else if(event.keyCode == 65) {
          console.log('D was pressed');
          playerSphere.position.z += 1;
      }
      else if(event.keyCode == 83) {
          console.log('S was pressed');
          playerSphere.position.x += 1;
      }

      else if(event.keyCode == 68) {
          playerSphere.position.z -= 1;
      }
  });

const getPointLight = (color, intensity, distance) => {
  let light = new THREE.PointLight(color, intensity, distance)
  return light
}

init()
