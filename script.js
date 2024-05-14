
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene()

// Overlay
const overlayGeometry = new THREE.PlaneGeometry(2,2,1,1);
const overlayMaterial = new THREE.ShaderMaterial({
    vertexShader:`
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader:`
        uniform float uAlpha;
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,
    uniforms: {
        uAlpha: {
            value: 1.0
        }
    },
    transparent: true
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

// Loaders
const loadingBar = document.querySelector('.loading-bar');
const body = document.querySelector('body');


const loadingManager = new THREE.LoadingManager(
()=>{
    window.setTimeout(()=>{
        gsap.to(overlayMaterial.uniforms.uAlpha, {
            duration: 3,
            value: 0,
            delay: 1
        });

        loadingBar.classList.add('ended');
        body.classList.add('loaded');
        loadingBar.style.transform = '';

    }, 500)
},
(itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded/itemsTotal
    loadingBar.style.transform = `scalex(${progressRatio})`;
},
() => {
    console.log('error');
}
);

// Object Loader
let donut = null;
//function init(){
const loader = new THREE.GLTFLoader(loadingManager)//.setPath('models/donut/');
loader.load('./assets/donut/scene.gltf', (gltf)=>{
    donut = gltf.scene;

    donut.position.x = 1.5;
    donut.rotation.x = Math.PI * 0.2;
    donut.rotation.z = Math.PI * 0.15;


    const radius = 8.5;
    donut.scale.set(radius, radius, radius);
    scene.add(donut);

})
//};
//init();

// Lights 
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1,2,0);
scene.add(directionalLight);

// Transform donut
const transformDonut = [
    {
        rotationZ: 0.45,
        positionX: 1.5
    }, {
        rotationZ: -0.45,
        positionX: - 1.5
    }, {
        rotationZ: 0.0314,
        positionX: 0
    }
];

// Scroll
let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener('scroll', ()=> {
    scrollY = window.scrollY;
    const newSection = Math.round(scrollY/sizes.height);
    console.log(newSection);

    if (newSection != currentSection){
        currentSection = newSection;

        if(!!donut){
            gsap.to(
                donut.rotation, {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    z: transformDonut[currentSection].rotationZ
                }
            );
            gsap.to(
                donut.position, {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    x: transformDonut[currentSection].positionX
                }   
            );
        }
    }
});

// On reload
window.onbeforeunload = ()=>{
    window.scrollTo(0,0);
}

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 5;
scene.add(camera)



// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);

// Clock
const clock = new THREE.Clock();
const speed = 2;
let lastElapsedTime = 0;
// Animte tick
const tick = ()=>{
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - lastElapsedTime;
    lastElapsedTime = elapsedTime;


    if(!!donut){
        donut.position.y = Math.sin(elapsedTime * 0.5) * 0.1 - 0.1;
    }

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
}

tick();