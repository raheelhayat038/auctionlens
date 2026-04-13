const video = document.getElementById('video');
const previewImg = document.getElementById('previewImg');
const resultDiv = document.getElementById('result');
const analyzeBtn = document.getElementById('analyze');
const shutterBtn = document.getElementById('shutter');
const placeholder = document.getElementById('placeholderText');

let activeBase64 = null;
let activeMime = "image/png";

// Camera Initialization (Portrait Locked)
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
    } catch (err) { alert("Camera Error: Check Permissions"); }
});

// Capture
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

// File Upload
document.getElementById('fileIn').addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        activeBase64 = ev.target.result.split(',')[1];
        previewImg.src = ev.target.result;
        previewImg.classList.remove('hidden');
        analyzeBtn.classList.remove('hidden');
        placeholder.classList.add('hidden');
    };
    reader.readAsDataURL(e.target.files[0]);
});

// Analysis
analyzeBtn.addEventListener('click', async () => {
    resultDiv.classList.add('hidden');
    analyzeBtn.innerText = "EXTRACTING DATA...";
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
            
            // UI Update Logic
            document.getElementById('resGrade').innerText = txt.match(/Grade:\s*([^\n,]+)/i)?.[1] || "N/A";
            document.getElementById('resChassis').innerText = txt.match(/Chassis:\s*([^\n,]+)/i)?.[1] || "N/A";
            document.getElementById('resDiagram').innerText = txt.match(/Diagram:\s*([^\n,]+)/i)?.[1] || "None detected";

            const flag = document.getElementById('flagStatus');
            txt.includes("POTENTIALLY TAMPERED") ? flag.classList.remove('hidden') : flag.classList.add('hidden');

            resultDiv.classList.remove('hidden');
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    } catch (err) { alert("Network Error"); }
    finally {
        analyzeBtn.innerText = "ANALYZE SHEET";
        analyzeBtn.disabled = false;
    }
});
