const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// Set canvas size dynamically based on window size
canvas.width = window.innerWidth * 0.95;
canvas.height = window.innerHeight * 0.8;

let cities = [];
let ants = [];
let pheromone = [];
let bestPath = [];
let bestDist = Infinity;
let running = false;

// --- ACO Constants ---
const ALPHA = 1;     // pheromone influence
const BETA = 5;      // distance influence
const RHO = 0.3;     // pheromone evaporation rate
const Q = 100;       // pheromone deposit constant

// --- Visualization Constants and State ---
let currentAntIndex = 0;
// Adjust this value to change speed (higher = faster visualization)
let MAX_STEPS_PER_FRAME = 2; 
let SHOW_ALL_ANT_PATHS = true; 
const ANT_COLOR = "rgba(100, 200, 255, 0.4)"; // Color for general ant paths
const FADE_COLOR = "rgba(0,0,0,0.1)"; // Lighter fade for background/trails

// --- Event Listeners ---
canvas.addEventListener("click", (e) => {
    if (!running && cities.length < 100) {
        cities.push({ x: e.offsetX, y: e.offsetY });
        drawCities(true);
    }
});

document.getElementById("resetBtn").onclick = () => {
    running = false;
    cities = [];
    ants = [];
    pheromone = [];
    bestPath = [];
    bestDist = Infinity;
    currentAntIndex = 0;
    SHOW_ALL_ANT_PATHS = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("info").innerText = "";
};

document.getElementById("startBtn").onclick = () => {
    if (cities.length < 2) return;
    initACO();
    running = true;
    runACO();
};

document.getElementById("generateBtn").onclick = () => {
    if (running) return;

    // Get the desired number of cities, defaulting to 30
    let num = parseInt(document.getElementById("numCities").value) || 30;
    
    // Clamp the number between 1 and 100
    num = Math.max(1, Math.min(100, num));
    
    // Clear existing state
    document.getElementById("resetBtn").click(); 
    
    // Generate cities
    for (let i = 0; i < num; i++) {
        // Generate coordinates within the canvas boundaries
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;

        // Ensure cities are slightly offset from the edge
        x = Math.max(10, Math.min(canvas.width - 10, x));
        y = Math.max(10, Math.min(canvas.height - 10, y));

        cities.push({ x: x, y: y });
    }
    
    drawCities(true); // Draw the newly generated cities with a full clear
};

// --- Core Helper Functions ---

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function initACO() {
    const n = cities.length;
    // Initial pheromone level
    pheromone = Array.from({ length: n }, () => Array(n).fill(1 / (n * n))); 
    const antCount = Math.max(20, n * 20); 
    ants = Array.from({ length: antCount }, () => ({
        path: [],
        visited: [],
        dist: 0,
    }));
    currentAntIndex = 0; 
    SHOW_ALL_ANT_PATHS = true;
}

// --- Drawing Functions ---

function drawCities(fullClear = false) {
    if (fullClear) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw cities
    ctx.fillStyle = "#fff";
    for (let c of cities) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    drawBestPath(); // Always draw the best path on top
}

function drawAntPath(ant) {
    if (ant.path.length < 2 || !SHOW_ALL_ANT_PATHS) return;

    ctx.strokeStyle = ANT_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();

    let start = cities[ant.path[0]];
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < ant.path.length; i++) {
        let c = cities[ant.path[i]];
        ctx.lineTo(c.x, c.y);
    }
    
    // If the ant is done, connect back to start
    if (ant.path.length === cities.length) {
        ctx.lineTo(start.x, start.y);
    }
    ctx.stroke();
}

function drawBestPath(highlight = false) {
    if (bestPath.length < 2) return;
    
    // Use yellow/thick line when highlighting or if SHOW_ALL_ANT_PATHS is still true
    const color = highlight || SHOW_ALL_ANT_PATHS ? "yellow" : "#f00"; 
    
    ctx.strokeStyle = color;
    ctx.lineWidth = highlight ? 3 : 2;
    ctx.beginPath();
    
    let start = cities[bestPath[0]];
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < bestPath.length; i++) {
        let c = cities[bestPath[i]];
        ctx.lineTo(c.x, c.y);
    }
    ctx.lineTo(start.x, start.y);
    ctx.stroke();
}

// --- ACO Algorithm Logic ---

function selectNextCity(ant, i) {
    const n = cities.length;
    let probs = [];
    let sum = 0;
    
    for (let j = 0; j < n; j++) {
        if (!ant.visited[j]) {
            const tau = Math.pow(pheromone[i][j], ALPHA);
            const eta = Math.pow(1 / (distance(cities[i], cities[j]) + 1e-9), BETA); 
            
            probs[j] = tau * eta; // Probability calculation
            sum += probs[j];
        } else {
            probs[j] = 0;
        }
    }
    if (sum === 0) return null;

    // Roulette wheel selection
    let r = Math.random() * sum;
    for (let j = 0; j < n; j++) {
        if ((r -= probs[j]) <= 0) return j;
    }
    
    return null; 
}

function updatePheromones() {
    const n = cities.length;
    
    // 1. Evaporate Pheromones
    for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
            pheromone[i][j] = (1 - RHO) * pheromone[i][j];

    // 2. Deposit Pheromones
    for (let ant of ants) {
        const delta = Q / ant.dist; 
        
        for (let k = 0; k < ant.path.length; k++) {
            let i = ant.path[k];
            let j = ant.path[(k + 1) % n]; 
            
            pheromone[i][j] += delta;
            pheromone[j][i] += delta; 
        }
        
        // Reset ant for the next iteration
        ant.path = [];
        ant.visited = [];
        ant.dist = 0;
    }
}

// --- Main Simulation Loop ---

function runACO() {
    if (!running) return;

    const n = cities.length;

    // Create the 'trail' effect by drawing a semi-transparent black layer
    ctx.fillStyle = FADE_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let stepsTaken = 0;
    
    // Process multiple steps/moves within a single frame for speed control
    while (stepsTaken < MAX_STEPS_PER_FRAME) {
        let ant = ants[currentAntIndex];
        
        // 1. Initialize Ant Path
        if (ant.path.length === 0) {
            ant.path = [Math.floor(Math.random() * n)];
            ant.visited = Array(n).fill(false);
            ant.visited[ant.path[0]] = true;
            ant.dist = 0;
        }

        // 2. Take One Step (Select Next City)
        if (ant.path.length < n) {
            let i = ant.path[ant.path.length - 1];
            let next = selectNextCity(ant, i);
            
            if (next !== null) {
                ant.path.push(next);
                ant.visited[next] = true;
                ant.dist += distance(cities[i], cities[next]);
                stepsTaken++;
            } else {
                stepsTaken = MAX_STEPS_PER_FRAME; 
            }
        }
        
        // 3. Ant has completed its tour
        if (ant.path.length === n) {
            let tourDist = ant.dist + distance(cities[ant.path[n - 1]], cities[ant.path[0]]); 
            ant.dist = tourDist; 
                 
            // Update Global Best
            if (ant.dist < bestDist) {
                bestDist = ant.dist;
                bestPath = [...ant.path];
            }
                 
            // Move to next ant
            currentAntIndex++;
            stepsTaken++; 
        }

        // Visualize the ant's current path
        drawAntPath(ant);
        
        // 4. Check if all ants have finished the current iteration
        if (currentAntIndex >= ants.length) {
            updatePheromones(); 
            currentAntIndex = 0; 
            
            // AFTER the first iteration, stop drawing every path
            if (bestPath.length > 0) {
                 SHOW_ALL_ANT_PATHS = false; 
            }
            
            stepsTaken = MAX_STEPS_PER_FRAME; 
        }
    }
    
    // Redraw fixed elements (cities, best path)
    drawCities(); 

    // Update Info Display
    document.getElementById("info").innerText = `Cities: ${cities.length} | Ant: ${currentAntIndex + 1}/${ants.length} | Best: ${bestDist.toFixed(2)}`;

    // Loop for next frame
    requestAnimationFrame(runACO);
}
