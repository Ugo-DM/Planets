document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('backgroundCanvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Simulated sun (light source)
    const sunLight = new THREE.PointLight(0xffffff, 2, 30000); // Stronger and more far-reaching light
    sunLight.position.set(0, 2000, 4000);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Set up stars background
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff
    });
    const starVertices = [];
    for (let i = 0; i < 50000; i++) { // Increased number of stars for a denser effect
        const x = THREE.MathUtils.randFloatSpread(20000); // Expanded area for stars
        const y = THREE.MathUtils.randFloatSpread(20000);
        const z = THREE.MathUtils.randFloatSpread(20000);
        starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Add planets with varied sizes and more spaced out positions
    const planetTextures = [
        new THREE.TextureLoader().load('./8k_mercury.jpg'), // Mercury
        new THREE.TextureLoader().load('./8k_venus_surface.jpg'), // Venus
        new THREE.TextureLoader().load('./8k_earth_daymap.jpg'), // Earth
        new THREE.TextureLoader().load('./8k_mars.jpg'), // Mars
        new THREE.TextureLoader().load('./8k_jupiter.jpg'), // Jupiter
    ];

    const planets = [];
    const planetSizes = [120, 180, 250, 200, 300]; // Different sizes for each planet
    for (let i = 0; i < planetTextures.length; i++) {
        const planetGeometry = new THREE.SphereGeometry(planetSizes[i], 32, 32);
        const planetMaterial = new THREE.MeshStandardMaterial({
            map: planetTextures[i]
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);

        planet.position.x = (Math.random() - 0.5) * 4000; // More spaced out positions on the X-axis
        planet.position.y = (Math.random() - 0.5) * 3000; // More spaced out positions on the Y-axis
        planet.position.z = -2000 - i * 3000; // More spaced out positions on the Z-axis

        planets.push(planet);
        scene.add(planet);
    }

    // Adding a glow effect to Venus
    const venus = planets[1]; // Assuming Venus is the second planet in the array
    const venusGlow = new THREE.PointLight(0xffdd44, 1, 1000); // Larger glow radius
    venusGlow.position.copy(venus.position);
    scene.add(venusGlow);

    // Adding a ring to Saturn (5th planet, replace Jupiter with Saturn)
    const ringedPlanet = planets[4]; // Assuming Jupiter is in the 5th position, but should be Saturn

    // Apply Saturn's texture
    const ringedPlanetTexture = new THREE.TextureLoader().load('./8k_saturn.jpg');
    ringedPlanet.material.map = ringedPlanetTexture;

    // Add a ring to Saturn
    const ringGeometry = new THREE.RingGeometry(ringedPlanet.geometry.parameters.radius + 20, ringedPlanet.geometry.parameters.radius + 150, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('./8k_saturn_ring_alpha.png'),
        side: THREE.DoubleSide,
        transparent: true,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ringedPlanet.add(ring);

    // Define a path for the camera to pass closer to each planet
    const pathPoints = [
        new THREE.Vector3(0, 0, 1000),
        planets[0].position.clone().add(new THREE.Vector3(0, 0, 500)), // Close to Mercury
        planets[1].position.clone().add(new THREE.Vector3(100, 50, 500)), // Close to Venus
        planets[2].position.clone().add(new THREE.Vector3(-200, -100, 500)), // Close to Earth
        planets[3].position.clone().add(new THREE.Vector3(150, 100, 500)), // Close to Mars
        planets[4].position.clone().add(new THREE.Vector3(0, 0, 1000)), // Close to Jupiter/Saturn
    ];

    const pathCurve = new THREE.CatmullRomCurve3(pathPoints);
    const pathLength = pathCurve.getLength();

    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        const t = Math.min(scrollY / (document.body.scrollHeight - window.innerHeight), 1); // Normalize scroll position
        const positionOnCurve = pathCurve.getPointAt(t);

        camera.position.copy(positionOnCurve);

        // Optionally look at a point, such as a target or the next point on the path
        const lookAtPoint = pathCurve.getPointAt(Math.min(t + 0.01, 1));
        camera.lookAt(lookAtPoint);
    });

    function animate() {
        requestAnimationFrame(animate);

        stars.rotation.y += 0.0005; // Slow rotation of the star field

        planets.forEach(planet => {
            planet.rotation.y += 0.001; // Slow rotation of planets
        });

        ringedPlanet.rotation.y += 0.001; // Rotate the ringed planet
        ring.rotation.z += 0.0005; // Slowly rotate the ring

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
});