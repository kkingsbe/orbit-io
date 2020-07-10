var scene, camera, renderer, controls
const width = window.innerWidth
const height = window.innerHeight
const ratio = width / height

const dataRate = 100 //How many milliseconds between data transmissions
const rbScaleFactor = 0.3 //The scale factor when rubberbanding
const rbInterval = 5000 //How many ms before it initiates rubberbanding
const rbThreshold = 0.5 //THe threshold for rubberbanding to stop
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
    if (typeof(data.username) == "undefined" || data.username == username)  {
      return;
    }
    //new player
    if (typeof(players[data.username]) == "undefined")  {
      players[data.username] = data;
      let npGeometry = new THREE.SphereGeometry( 5, 32, 32 );
      let npMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
      let npSphere = new THREE.Mesh( geometry, material );
      scene.add( npSphere );
      players[data.username].sphere = npSphere;
      players[data.username].velocity = {
        x: 0,
        y: 0,
        z: 0
      }
    } else { // existing player
      let player = data.username
      players[player].lastTimestamp = players[player].timestamp
      players[player].timestamp = data.timestamp

      //Set the last position to now be the previous position
      players[player].previousPosition = players[data.username].position
      players[player].position = data.position;

      //Calculate the players x, y, and z velocities
      let dT = players[player].timestamp - players[player].lastTimestamp
      players[player].velocity.x = (players[player].position.x - players[player].previousPosition.x) * 1000 / dT
      players[player].velocity.y = (players[player].position.y - players[player].previousPosition.y) * 1000 / dT
      players[player].velocity.z = (players[player].position.z - players[player].previousPosition.z) * 1000 / dT
    }
    console.log(players)
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

  var clock = new THREE.Clock()
  const animate = () => {
    let dT = clock.getDelta()
    var acceleration = 1;

    //Player Sphere Movement
    if(typeof(currentPlayer.velocity) == "undefined") {
      currentPlayer.velocity = {
        x: 0,
        y: 0,
        z: 0
      }
    }
    if (wIsDown)  {
      currentPlayer.velocity.x -= acceleration
    }
    if (aIsDown)  {
      currentPlayer.velocity.z += acceleration
    }
    if (sIsDown)  {
      currentPlayer.velocity.x += acceleration
    }
    if (dIsDown)  {
      currentPlayer.velocity.z -= acceleration
    }

    playerSphere.position.x += currentPlayer.velocity.x * dT
    playerSphere.position.z += currentPlayer.velocity.z * dT
    currentPlayer.position = playerSphere.position;

    for (let player in players) {
      let dx = players[player].position.x - players[player].sphere.position.x
      let dy = players[player].position.y - players[player].sphere.position.y
      let dz = players[player].position.z - players[player].sphere.position.z

      if(typeof(players[player].rubberBanding) == "undefined") players[player].rubberBanding = false

      if(dx <= rbThreshold && dy <= rbThreshold && dz <= rbThreshold) {
        players[player].rubberBanding = false
      }

      //Rubberband
      players[player].velocity.x += dx * rbScaleFactor
      players[player].velocity.y += dy * rbScaleFactor
      players[player].velocity.z += dz * rbScaleFactor

      //Move
      players[player].sphere.position.x += players[player].velocity.x * dT
      players[player].sphere.position.y += players[player].velocity.y * dT
      players[player].sphere.position.z += players[player].velocity.z * dT
    }
  }

  const render = () => {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
    controls.update()
    animate()
  }
  render()

  //send data
  setInterval(() => {
    currentPlayer.timestamp = (new Date()).getTime()
    socket.send(JSON.stringify({"action": "OnState", "state": currentPlayer}))
  }, dataRate)

  /*
  setInterval(() => {
    for(let player in players) {
      players[player].rubberBanding = true
    }
  }, rbInterval)
  */
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