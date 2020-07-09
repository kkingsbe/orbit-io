var scene, camera, renderer, controls
const width = window.innerWidth
const height = window.innerHeight
const ratio = width / height

var playerSphere;
var wIsDown = false;
var aIsDown = false;
var sIsDown = false;
var dIsDown = false;

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

    //Player Sphere Movement
    if (wIsDown)  {
      playerSphere.position.x -= .1;
    }
    if (aIsDown)  {
      playerSphere.position.z += .1;
    }
    if (sIsDown)  {
      playerSphere.position.x += .1;
    }
    if (dIsDown)  {
      playerSphere.position.z -= .1;
    }
  }

  const render = () => {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
    controls.update()
    animate()
  }
  render()
}

  //Input
  document.addEventListener('keydown', function(event) {
      if(event.keyCode == 87) {
          //console.log('Forward was pressed');
          wIsDown = true;
      }
      else if(event.keyCode == 65) {
          //console.log('A was pressed');
          aIsDown = true;
      }
      else if(event.keyCode == 83) {
          //console.log('S was pressed');
          sIsDown = true;
      }

      else if(event.keyCode == 68) {
        //console.log('D was pressed');
          dIsDown = true;
      }
  });

  document.addEventListener('keyup', function(event) {
      if(event.keyCode == 87) {
          //console.log('Forward was let go');
          wIsDown = false;
      }
      else if(event.keyCode == 65) {
          //console.log('A was let go');
          aIsDown = false;
      }
      else if(event.keyCode == 83) {
          //console.log('S was let go');
          sIsDown = false;
      }

      else if(event.keyCode == 68) {
        //  console.log('d was let go');
          dIsDown = false;
      }
  });

const getPointLight = (color, intensity, distance) => {
  let light = new THREE.PointLight(color, intensity, distance)
  return light
}

init()
