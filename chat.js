const video = document.getElementById('video');
const previewImg = document.getElementById('previewImg');
const resultDiv = document.getElementById('result');
const analyzeBtn = document.getElementById('analyze');
const shutterBtn = document.getElementById('shutter');

let activeBase64 = null;
let activeMime = "image/png";

// Camera Initialization
document.getElementById('btnCam').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment", aspectRatio: 0.5625 } 
        });
        video.srcObject = stream;
        video.classList.remove('hidden');
        previewImg.classList.add('hidden');
        shutterBtn.classList.remove('hidden');
        document.getElementById('placeholderText').classList.add('hidden');
        analyzeBtn.classList.add('hidden');
        resultDiv.classList.add('hidden');
    } catch (err) { alert("Camera Access Error"); }
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
        document.getElementById('placeholderText').classList.add('hidden');
        resultDiv.classList.add('hidden');
    };
    reader.readAsDataURL(e.target.files[0]);
});

// Analysis & Safe Mapping
analyzeBtn.addEventListener('click', async () => {
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
            
            // Safe Extractor
            const extract = (label) => {
                const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z\\s]+:|$)`, 'i');
                const match = txt.match(regex);
                return match ? match[1].trim() : "Not Detected";
            };

            // Safe Fill Helper (Fixes the crash)
            const fill = (id, val) => {
                const el = document.getElementById(id);
                if(el) el.innerText = val;
            };

            // Mapping all IDs correctly
            fill('resYear', extract("YEAR"));
            fill('resMake', extract("MAKE"));
            fill('resModel', extract("MODEL"));
            fill('resGrade', extract("GRADE"));
            fill('resChassis', extract("CHASSIS"));
            fill('resSummary', extract("SUMMARY"));
            fill('resInterior', extract("INTERIOR"));
            fill('resExterior', extract("EXTERIOR"));
            
            const verdict = extract("VERDICT");
            fill('resVerdict', verdict);

            // Verdict Styling
            const vBox = document.getElementById('verdictBox');
            if (vBox) {
                if (verdict.toUpperCase().includes("AVOID") || verdict.toUpperCase().includes("CAUTION") || txt.includes("TAMPERED")) {
                    vBox.className = "p-5 rounded-2xl border-2 border-red-600 bg-red-950/30 text-red-400";
                    document.getElementById('flagStatus')?.classList.remove('hidden');
                } else {
                    vBox.className = "p-5 rounded-2xl border-2 border-emerald-600 bg-emerald-950/30 text-emerald-400";
                    document.getElementById('flagStatus')?.classList.add('hidden');
                }
            }

            resultDiv.classList.remove('hidden');
            window.scrollTo({ top: resultDiv.offsetTop - 20, behavior: 'smooth' });
        }
    } catch (err) { alert("API Connection Failed"); }
    finally {
        analyzeBtn.innerText = "ANALYZE SHEET";
        analyzeBtn.disabled = false;
    }
});
