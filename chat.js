const video = document.getElementById('video');
const previewImg = document.getElementById('previewImg');
const resultDiv = document.getElementById('result');
const analyzeBtn = document.getElementById('analyze');
const shutterBtn = document.getElementById('shutter');
const placeholder = document.getElementById('placeholderText');

let activeBase64 = null;
let activeMime = "image/png";

// --- 1. Camera Management ---
document.getElementById('btnCam').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment", aspectRatio: 0.5625 } 
        });
        video.srcObject = stream;
        video.classList.remove('hidden');
        previewImg.classList.add('hidden');
        shutterBtn.classList.remove('hidden');
        placeholder.classList.add('hidden');
        analyzeBtn.classList.add('hidden');
        resultDiv.classList.add('hidden');
    } catch (err) { alert("Camera Access Denied"); }
});

shutterBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    activeBase64 = canvas.toDataURL('image/png').split(',')[1];
    previewImg.src = canvas.toDataURL('image/png');
    
    video.classList.add('hidden');
    previewImg.classList.remove('hidden');
    shutterBtn.classList.add('hidden');
    analyzeBtn.classList.remove('hidden');
    
    video.srcObject.getTracks().forEach(t => t.stop());
});

// --- 2. File Upload Management ---
document.getElementById('fileIn').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    activeMime = file.type;
    const reader = new FileReader();
    reader.onload = (ev) => {
        activeBase64 = ev.target.result.split(',')[1];
        previewImg.src = ev.target.result;
        previewImg.classList.remove('hidden');
        analyzeBtn.classList.remove('hidden');
        placeholder.classList.add('hidden');
        resultDiv.classList.add('hidden');
    };
    reader.readAsDataURL(file);
});

// --- 3. Analysis & Elaborate Parsing ---
analyzeBtn.addEventListener('click', async () => {
    // UI Loading State
    resultDiv.classList.add('hidden');
    analyzeBtn.innerText = "GENERATING EXPERT REPORT...";
    analyzeBtn.disabled = true;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: activeBase64, mimeType: activeMime })
        });

        const data = await res.json();
        if (res.ok) {
            const txt = data.result;
            
            // Regex to find and extract the long-form sections
            const getField = (label) => {
                const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z][a-z]+:|$)`, 'i');
                return txt.match(regex)?.[1]?.trim() || "Information not found";
            };

            // Filling the UI elements
            document.getElementById('resYear').innerText = getField("Year");
            document.getElementById('resGrade').innerText = getField("Grade");
            document.getElementById('resChassis').innerText = getField("Chassis");
            
            document.getElementById('resSummary').innerText = getField("Condition Summary");
            document.getElementById('resInterior').innerText = getField("Interior Details");
            document.getElementById('resExterior').innerText = getField("Exterior & Diagram");
            
            const verdict = getField("Final Verdict");
            const verdictEl = document.getElementById('resVerdict');
            const verdictBox = document.getElementById('verdictBox');
            verdictEl.innerText = verdict;

            // Visual Logic for the Verdict Box
            if (verdict.toUpperCase().includes("AVOID") || verdict.toUpperCase().includes("TAMPERED") || txt.includes("TAMPERED")) {
                verdictBox.className = "p-5 rounded-2xl border-2 border-red-600 bg-red-950/30 text-red-400";
                document.getElementById('flagStatus').classList.remove('hidden');
            } else {
                verdictBox.className = "p-5 rounded-2xl border-2 border-emerald-600 bg-emerald-950/30 text-emerald-400";
                document.getElementById('flagStatus').classList.add('hidden');
            }

            // Show the final report
            resultDiv.classList.remove('hidden');
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

        } else {
            alert("Error: " + data.error);
        }
    } catch (err) {
        alert("Connection Error. Check your internet.");
    } finally {
        analyzeBtn.innerText = "ANALYZE SHEET";
        analyzeBtn.disabled = false;
    }
});
