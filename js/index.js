var scene, camera, renderer, controls
const width = window.innerWidth
const height = window.innerHeight
const ratio = width / height

var socket;
var players = {};
var currentPlayer = {};

var playerSphere;
var wIsDown = false;
var aIsDown = false;
var sIsDown = false;
var dIsDown = false;

var username = prompt("Enter Username");
currentPlayer.username = username
const init = () => {
  //set up websocket
  socket = new WebSocket("wss://a2sfba4ufl.execute-api.us-east-1.amazonaws.com/Test")
  socket.onopen = (e) => {
    console.log("Connection established!")

  }
  socket.onmessage = (e) => {
    var data = JSON.parse(e.data);
    if (data.username == username)  {
      return;
    }
    if (typeof(players[data.username]) == "undefined")  {
      players[data.username] = data;
      let npGeometry = new THREE.SphereGeometry( 5, 32, 32 );
      let npMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
      let npSphere = new THREE.Mesh( geometry, material );
      scene.add( npSphere );
      players[data.username].sphere = npSphere;
    }
    console.log(data)
  }
  socket.onclose = (e) => {
    console.log("Connection ended")
  }
  socket.onerror = (e) => {
    console.log("Error :( ",e)
  }

  //set  up scene
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, ratio, 1, 1000)
  camera.position.z = 7
  camera.position.y = 7
  camera.position.x = 3

  controls = new THREE.OrbitControls(camera, document.getElementById("viewport"))

  //axis
  axis = new THREE.AxisHelper(300)
  //scene.add(axis)

  //sphere
  var geometry = new THREE.SphereGeometry( 5, 32, 32 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  var sphere = new THREE.Mesh( geometry, material );
  scene.add( sphere );
  playerSphere = sphere;

  //grid
  var size = 100;
  var divisions = 10;
  var gridHelper = new THREE.GridHelper( size, divisions );
  scene.add( gridHelper );

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
    var speed = 1;
    //Player Sphere Movement
    if (wIsDown)  {
      playerSphere.position.x -= speed;
    }
    if (aIsDown)  {
      playerSphere.position.z += speed;
    }
    if (sIsDown)  {
      playerSphere.position.x += speed;
    }
    if (dIsDown)  {
      playerSphere.position.z -= speed;
    }
    currentPlayer.position = playerSphere.position;

    for (let player in players) {
      players[player].sphere.position = players[player].position;
    }
  }

  const render = () => {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
    controls.update()
    animate()
  }
  render()
  setInterval(() => {
    socket.send(JSON.stringify({"action": "OnState", "state": currentPlayer}))
  }, 100)
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

function webSocketTest() {
  let socket = new WebSocket("wss://a2sfba4ufl.execute-api.us-east-1.amazonaws.com/Test")
  socket.onopen = (e) => {
    alert("Connection established!")
    let message = prompt("Enter message:")
    socket.send(JSON.stringify({"action": "OnState", "state": message}))
    //socket.send(JSON.stringify({"action": "OnState", "state": "TEST MESSAGE"}))
  }
  socket.onmessage = (e) => {
    alert(e.data)
  }
  socket.onclose = (e) => {
    alert("Connection ended")
  }
  socket.onerror = (e) => {
    alert("Error :( ",e)
  }
}
