 var windowWidth = window.innerWidth,
     windowHeight = window.innerHeight;
 var camera, renderer, scene;
 var meshArray = [];
 var omega1 = 1.032;
 var omega2 = -3.729;

 head.ready(function() {
     Init();
     animate();
 });

 function Init() {
     scene = new THREE.Scene();

     //setup camera
     camera = new LeiaCamera({
         cameraPosition: new THREE.Vector3(_camPosition.x, _camPosition.y, _camPosition.z),
         targetPosition: new THREE.Vector3(_tarPosition.x, _tarPosition.y, _tarPosition.z)
     });
     scene.add(camera);

     //setup rendering parameter
     renderer = new LeiaWebGLRenderer({
         antialias: true,
         renderMode: _renderMode,
         shaderMode: _nShaderMode,
         colorMode: _colorMode,
         compFac: _depthCompressionFactor,
         devicePixelRatio: 1
     });
     renderer.Leia_setSize({
         width: windowWidth,
         height: windowHeight,
         autoFit: true
     });
     renderer.shadowMapEnabled = true;
     renderer.shadowMapSoft = true;
     document.body.appendChild(renderer.domElement);

     //add object to Scene
     addObjectsToScene();

     //add Light
     addLights();

     //add Gyro Monitor
     //addGyroMonitor();
 }

 function animate() {
     requestAnimationFrame(animate);

     //set mesh animation
     for (var i = 0; i < meshArray.length; i++) {
         var curMeshGroup = meshArray[i].meshGroup;
         switch (meshArray[i].name) {
             case "LEIA1":
                 curMeshGroup.position.set(0, 0, 0);
                 curMeshGroup.rotation.y = 2.0 * (omega1 * LEIA.time);
                 curMeshGroup.rotation.z = -Math.sin(omega1 * LEIA.time) * 0.8;
                 break;
             default:
                 break;
         }
     }

     renderer.Leia_render({
         scene: scene,
         camera: camera,
         holoScreenSize: _holoScreenSize,
         holoCamFov: _camFov,
         upclip: _up,
         downclip: _down,
         filterA: _filterA,
         filterB: _filterB,
         filterC: _filterC,
         messageFlag: _messageFlag
     });
 }

 function addObjectsToScene() {
     //Add your objects here
     //add STL Object
     addSTLModel({
         path: 'resource/LEIA1.stl',
         meshGroupName: 'LEIA1',
         meshSizeX: 60,
         meshSizeY: 60,
         meshSizeZ: 60,
         translateX: 0,
         translateY: 0,
         translateZ: 0,
     });

     //Add Text
     /* addTextMenu({
        text: "Hello",
        name: "helloworld",
        size: 15,
        positionX: -20,
        positionY: -5,
        positionZ: 3,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0
      });*/

     //add background texture
     var backgroundPlane = LEIA_createTexturePlane({
         filename: 'resource/world-map-background2.jpg',
         width: 100,
         height: 75
     });
     backgroundPlane.position.z = -6;
     backgroundPlane.castShadow = false;
     backgroundPlane.receiveShadow = true;
     scene.add(backgroundPlane);

     var centerPlane = LEIA_createTexturePlane({
         filename: 'resource/crack001.png',
         width: 100,
         height: 75,
         transparent: true
     });
     scene.add(centerPlane);

     //LEIA_setBackgroundPlane('resource/world-map-background2.jpg');
     //LEIA_setCenterPlane('resource/crack001.png');
     // LEIA_setBackgroundPlane('resource/brickwall_900x600_small.jpg');
 }

 function addTextMenu(parameters) {
     parameters = parameters || {};

     var strText = parameters.text;
     var posX = parameters.positionX;
     var posY = parameters.positionY;
     var posZ = parameters.positionZ;
     var rotateX = parameters.rotateX;
     var rotateY = parameters.rotateY;
     var rotateZ = parameters.rotateZ;
     var name = parameters.name;
     var size = parameters.size;
     if (posX === undefined || posY === undefined || posZ === undefined) {
         posX = 0;
         posY = 0;
         posZ = 0;
     }
     if (rotateX === undefined || rotateY === undefined || rotateZ === undefined) {
         rotateX = 0;
         rotateY = 0;
         rotateZ = 0;
     }
     var menuGeometry = new THREE.TextGeometry(
         strText, {
             size: size,
             height: 2,
             curveSegments: 4,
             font: "helvetiker",
             weight: "normal",
             style: "normal",
             bevelThickness: 0.6,
             bevelSize: 0.25,
             bevelEnabled: true,
             material: 0,
             extrudeMaterial: 1
         }
     );
     var menuMaterial = new THREE.MeshFaceMaterial(
         [
             new THREE.MeshPhongMaterial({
                 color: 0xffffff,
                 shading: THREE.FlatShading
             }), // front
             new THREE.MeshPhongMaterial({
                 color: 0xffffff,
                 shading: THREE.SmoothShading
             }) // side
         ]
     );
     var menuMesh = new THREE.Mesh(menuGeometry, menuMaterial);
     menuMesh.position.set(posX, posY, posZ);
     menuMesh.rotation.set(rotateX, rotateY, rotateZ);
     menuMesh.castShadow = true;
     menuMesh.receiveShadow = true;
     var group = new THREE.Object3D();
     group.add(menuMesh);
     scene.add(group);
     meshArray.push({
         meshGroup: group,
         name: name
     });

 }

 function addLights() {
     //Add Lights Here
     var xl = new THREE.DirectionalLight(0xffffff);
     xl.position.set(1, 0, 2);
     scene.add(xl);

     var pl = new THREE.PointLight(0x555555);
     pl.position.set(-20, 10, 20);
     scene.add(pl);
 }

 function addSTLModel(parameters) { //(filename, meshName, meshSize) {
     parameters = parameters || {};
     var path = parameters.path;
     var meshSizeX = parameters.meshSizeX;
     var meshSizeY = parameters.meshSizeY;
     var meshSizeZ = parameters.meshSizeZ;
     var tx = parameters.translateX;
     var ty = parameters.translateY;
     var tz = parameters.translateZ;
     var meshName = parameters.meshGroupName;
     if (parameters.meshSizeX === undefined || parameters.meshSizeY === undefined || parameters.meshSizeZ === undefined) {
         meshSizeX = 1;
         meshSizeY = 1;
         meshSizeZ = 1;
     }
     var xhr1 = new XMLHttpRequest();
     xhr1.onreadystatechange = function() {
         if (xhr1.readyState == 4) {
             if (xhr1.status == 200 || xhr1.status === 0) {
                 var rep = xhr1.response;
                 var mesh1;
                 mesh1 = parseStlBinary(rep, 0xffffff);
                 mesh1.material.side = THREE.DoubleSide;
                 mesh1.castShadow = true;
                 mesh1.receiveShadow = true;
                 mesh1.material.metal = true;
                 mesh1.scale.set(meshSizeX, meshSizeY, meshSizeZ);
                 mesh1.position.set(tx, ty, tz);
                 var group = new THREE.Object3D();
                 group.add(mesh1);
                 scene.add(group);
                 meshArray.push({
                     meshGroup: group,
                     name: meshName
                 });
                 // newMeshReady = true;
             }
         }
     };
     xhr1.onerror = function(e) {
         console.log(e);
     };
     xhr1.open("GET", path, true);
     xhr1.responseType = "arraybuffer";
     xhr1.send(null);
 }