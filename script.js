// --- Mobile Menu Toggle ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// --- New: Detail Toggle Logic for Academics ---
function toggleDetails(id) {
    const content = document.getElementById(id);
    const button = document.querySelector(`button[onclick="toggleDetails('${id}')"]`);
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        button.innerHTML = 'Collapse Details (&#9650;)'; // Up arrow
    } else {
        content.classList.add('hidden');
        button.innerHTML = 'View Details (&#9660;)'; // Down arrow
    }
}

// --- 1. Custom Radar Chart (Skills) ---
function drawRadarChart() {
    const canvas = document.getElementById('skillsCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = 120;
    
    // Config
    const labels = ["Hardware", "NetSec", "Forensics", "Coding", "Logic", "Storage"];
    const data = [0.9, 0.85, 0.75, 0.65, 0.8, 0.7]; // 0.0 to 1.0
    const sides = 6;
    const angleStep = (Math.PI * 2) / sides;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw Background Web
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let level = 1; level <= 4; level++) {
        const r = (radius / 4) * level;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (i * angleStep) - (Math.PI/2);
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // Draw Axes & Labels
    ctx.font = "12px JetBrains Mono";
    ctx.fillStyle = "#64748B";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < sides; i++) {
        const angle = (i * angleStep) - (Math.PI/2);
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        const lx = cx + (radius + 20) * Math.cos(angle);
        const ly = cy + (radius + 20) * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillText(labels[i], lx, ly);
    }

    // Draw Data Polygon
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
        const val = data[i % sides];
        const angle = (i * angleStep) - (Math.PI/2);
        const r = radius * val;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(8, 145, 178, 0.2)"; // Cyan transparent
    ctx.fill();
    ctx.strokeStyle = "#0891B2"; // Cyan solid
    ctx.lineWidth = 2;
    ctx.stroke();
}

// --- 2. Custom Line Chart (Simulation) ---
let simInterval;
let simData = new Array(50).fill(5); // 50 data points, baseline 5%
let isRunning = false;

function drawLineChart(ctx, w, h, data, isAlert) {
    ctx.clearRect(0, 0, w, h);

    // Draw Grid
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<5; i++) {
        let y = (h/4) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Draw Line
    const stepX = w / (data.length - 1);
    
    ctx.beginPath();
    ctx.moveTo(0, h - (data[0]/100 * h));
    
    for(let i=1; i<data.length; i++) {
        const x = i * stepX;
        const y = h - (data[i]/100 * h);
        ctx.lineTo(x, y);
    }

    // Fill Area
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    
    if (isAlert) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
        ctx.fill();
        ctx.strokeStyle = "#EF4444"; // Red
    } else {
        ctx.fillStyle = "rgba(8, 145, 178, 0.1)";
        ctx.fill();
        ctx.strokeStyle = "#0891B2"; // Cyan
    }
    
    // Redraw stroke on top
    ctx.beginPath();
    ctx.moveTo(0, h - (data[0]/100 * h));
    for(let i=1; i<data.length; i++) {
        const x = i * stepX;
        const y = h - (data[i]/100 * h);
        ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function updateSim() {
    const canvas = document.getElementById('simCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    drawLineChart(ctx, w, h, simData, isRunning);
}

function startSimulation() {
    if (isRunning) return;
    isRunning = true;
    
    const btn = document.getElementById('runBtn');
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('simStatusText');
    
    btn.innerText = "⚠️ RUNNING...";
    btn.classList.remove('bg-slate-900');
    btn.classList.add('bg-red-600');
    statusDot.classList.replace('bg-green-500', 'bg-red-500');
    statusDot.classList.add('animate-pulse');
    statusText.innerText = "PROCESSES SPAWNING - RAM SPIKE DETECTED";
    statusText.classList.add('text-red-500');

    let step = 0;
    const maxSteps = 100;

    simInterval = setInterval(() => {
        step++;
        
        // Logic: Add new high value, remove old
        const lastVal = simData[simData.length-1];
        // Create spike curve
        let noise = Math.random() * 5;
        let trend = 0;
        if (step < 30) trend = step * 3; // Rise
        else if (step < 70) trend = 90 + Math.random() * 10; // Plateau High
        else trend = 5; // Drop
        
        let newVal = Math.min(100, trend + noise);
        
        simData.push(newVal);
        simData.shift();
        
        updateSim();

        if (step > 80) {
           statusText.innerText = "FAILSAFE TRIGGERED - COOLING DOWN";
           statusText.classList.replace('text-red-500', 'text-green-500');
           statusDot.classList.replace('bg-red-500', 'bg-green-500');
           statusDot.classList.remove('animate-pulse');
        }

        if (step >= maxSteps) {
            clearInterval(simInterval);
            resetSimulation();
        }
    }, 50);
}

function resetSimulation() {
    isRunning = false;
    simData = new Array(50).fill(5);
    updateSim();
    
    const btn = document.getElementById('runBtn');
    const statusText = document.getElementById('simStatusText');
    
    btn.innerText = "▶ Run Test";
    btn.classList.add('bg-slate-900');
    btn.classList.remove('bg-red-600');
    statusText.innerText = "SYSTEM IDLE - READY";
    statusText.classList.remove('text-green-500');
}

// Initialize
window.onload = function() {
    drawRadarChart();
    updateSim();
};
