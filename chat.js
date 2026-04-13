const video = document.getElementById('video');
const previewImg = document.getElementById('previewImg');
const resultDiv = document.getElementById('result');
const analyzeBtn = document.getElementById('analyze');
const shutterBtn = document.getElementById('shutter');

let activeBase64 = null;
let activeMime = "image/png";

// Camera Logic (Portrait)
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
    } catch (err) { alert("Camera Error"); }
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

document.getElementById('fileIn').addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        activeBase64 = ev.target.result.split(',')[1];
        previewImg.src = ev.target.result;
        previewImg.classList.remove('hidden');
        analyzeBtn.classList.remove('hidden');
        document.getElementById('placeholderText').classList.add('hidden');
    };
    reader.readAsDataURL(e.target.files[0]);
});

analyzeBtn.addEventListener('click', async () => {
    resultDiv.classList.add('hidden');
    analyzeBtn.innerText = "GENERATING ELABORATE REPORT...";
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
                const match = txt.match(regex);
                return match ? match[1].trim() : "Not Detected";
            };

            // Filling Detailed Fields
            document.getElementById('resYear').innerText = extract("YEAR");
            document.getElementById('resGrade').innerText = extract("GRADE");
            document.getElementById('resChassis').innerText = extract("CHASSIS");
            document.getElementById('resSummary').innerText = extract("SUMMARY");
            document.getElementById('resInterior').innerText = extract("INTERIOR");
            document.getElementById('resExterior').innerText = extract("EXTERIOR");
            
            const verdict = extract("VERDICT");
            const verdictEl = document.getElementById('resVerdict');
            const verdictBox = document.getElementById('verdictBox');
            verdictEl.innerText = verdict;

            if (verdict.toUpperCase().includes("AVOID") || verdict.toUpperCase().includes("CAUTION") || txt.includes("TAMPERED")) {
                verdictBox.className = "p-5 rounded-2xl border-2 border-red-600 bg-red-950/30 text-red-400";
                document.getElementById('flagStatus').classList.remove('hidden');
            } else {
                verdictBox.className = "p-5 rounded-2xl border-2 border-emerald-600 bg-emerald-950/30 text-emerald-400";
                document.getElementById('flagStatus').classList.add('hidden');
            }

            resultDiv.classList.remove('hidden');
            window.scrollTo({ top: resultDiv.offsetTop - 20, behavior: 'smooth' });
        }
    } catch (err) { alert("API Error"); }
    finally {
        analyzeBtn.innerText = "ANALYZE SHEET";
        analyzeBtn.disabled = false;
    }
});
