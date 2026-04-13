const video = document.getElementById('video');
const previewImg = document.getElementById('previewImg');
const resultDiv = document.getElementById('result');
const analyzeBtn = document.getElementById('analyze');
const shutterBtn = document.getElementById('shutter');
const placeholder = document.getElementById('placeholderText');

let activeBase64 = null;
let activeMime = "image/png";

// --- Camera: Large Portrait View ---
document.getElementById('btnCam').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment", 
                width: { ideal: 1920 }, // High quality
                height: { ideal: 1080 } 
            } 
        });
        video.srcObject = stream;
        video.classList.remove('hidden');
        shutterBtn.classList.remove('hidden');
        previewImg.classList.add('hidden');
        placeholder.classList.add('hidden');
        resultDiv.classList.add('hidden');
        analyzeBtn.classList.add('hidden');
    } catch (err) { alert("Enable camera permissions to scan sheets."); }
});

shutterBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    // Capture at video's native resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/png');
    activeBase64 = dataUrl.split(',')[1];
    previewImg.src = dataUrl;
    
    video.classList.add('hidden');
    previewImg.classList.remove('hidden');
    shutterBtn.classList.add('hidden');
    analyzeBtn.classList.remove('hidden');
    video.srcObject.getTracks().forEach(t => t.stop());
});

document.getElementById('fileIn').addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        activeBase64 = ev.target.result.split(',')[1];
        previewImg.src = ev.target.result;
        previewImg.classList.remove('hidden');
        analyzeBtn.classList.remove('hidden');
        placeholder.classList.add('hidden');
        resultDiv.classList.add('hidden');
    };
    reader.readAsDataURL(e.target.files[0]);
});

// --- Analysis & Safe Mapping ---
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
            
            const extract = (label) => {
                const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z\\s]+:|$)`, 'i');
                return txt.match(regex)?.[1]?.trim() || "-";
            };

            const fill = (id, val) => {
                const el = document.getElementById(id);
                if(el) el.innerText = val;
            };

            fill('resYear', extract("YEAR"));
            fill('resGrade', extract("GRADE"));
            fill('resChassis', extract("CHASSIS"));
            fill('resSummary', extract("SUMMARY"));
            fill('resInterior', extract("INTERIOR"));
            fill('resExterior', extract("EXTERIOR"));
            
            const verdict = extract("VERDICT");
            fill('resVerdict', verdict);

            const vBox = document.getElementById('verdictBox');
            if (vBox) {
                const isWarning = verdict.toUpperCase().includes("AVOID") || verdict.toUpperCase().includes("CAUTION");
                vBox.className = isWarning ? "p-4 rounded-xl border-2 border-red-600 bg-red-900/20 text-red-400" : "p-4 rounded-xl border-2 border-emerald-600 bg-emerald-900/20 text-emerald-400";
                document.getElementById('flagStatus')?.classList.toggle('hidden', !isWarning);
            }

            resultDiv.classList.remove('hidden');
            window.scrollTo({ top: resultDiv.offsetTop - 20, behavior: 'smooth' });
        }
    } catch (err) { alert("API Error. Check network."); }
    finally { analyzeBtn.innerText = "PROCESS SHEET"; analyzeBtn.disabled = false; }
});
