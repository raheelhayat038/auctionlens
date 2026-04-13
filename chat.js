const video = document.getElementById('video');
const previewImg = document.getElementById('previewImg');
const resultDiv = document.getElementById('result');
const analyzeBtn = document.getElementById('analyze');
const shutterBtn = document.getElementById('shutter');

let activeBase64 = null;
let activeMime = "image/png";

// --- Helpers ---
const fill = (id, val) => {
    const el = document.getElementById(id);
    if(el) el.innerText = val;
};

// --- Camera & Upload (Simplified) ---
document.getElementById('btnCam').addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;
    video.classList.remove('hidden');
    shutterBtn.classList.remove('hidden');
    previewImg.classList.add('hidden');
    resultDiv.classList.add('hidden');
});

shutterBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    activeBase64 = canvas.toDataURL('image/png').split(',')[1];
    previewImg.src = canvas.toDataURL('image/png');
    video.classList.add('hidden'); previewImg.classList.remove('hidden');
    shutterBtn.classList.add('hidden'); analyzeBtn.classList.remove('hidden');
    video.srcObject.getTracks().forEach(t => t.stop());
});

document.getElementById('fileIn').addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        activeBase64 = ev.target.result.split(',')[1];
        previewImg.src = ev.target.result;
        previewImg.classList.remove('hidden');
        analyzeBtn.classList.remove('hidden');
        resultDiv.classList.add('hidden');
    };
    reader.readAsDataURL(e.target.files[0]);
});

// --- Main Analysis ---
analyzeBtn.addEventListener('click', async () => {
    resultDiv.classList.add('hidden');
    analyzeBtn.innerText = "EXTRACTING...";
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
                const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z]+:|$)`, 'i');
                return txt.match(regex)?.[1]?.trim() || "-";
            };

            // Filling Data
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

            // UI Styling
            const vBox = document.getElementById('verdictBox');
            if (vBox) {
                const isBad = verdict.toUpperCase().includes("AVOID") || verdict.toUpperCase().includes("CAUTION");
                vBox.className = isBad ? "p-4 rounded-2xl border-2 border-red-600 bg-red-900/20 text-red-400" : "p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-900/20 text-emerald-400";
                document.getElementById('flagStatus')?.classList.toggle('hidden', !isBad);
            }

            resultDiv.classList.remove('hidden');
            window.scrollTo({ top: resultDiv.offsetTop - 20, behavior: 'smooth' });
        }
    } catch (err) { alert("Error connecting to server."); }
    finally { analyzeBtn.innerText = "ANALYZE SHEET"; analyzeBtn.disabled = false; }
});
