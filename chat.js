const video = document.getElementById('video');
const previewImg = document.getElementById('previewImg');
const resultDiv = document.getElementById('result');
const analyzeBtn = document.getElementById('analyze');
const shutterBtn = document.getElementById('shutter');
const placeholder = document.getElementById('placeholderText');

let activeBase64 = null;
let activeMime = "image/png";

const fill = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };

// --- 1. Load Last Scan ---
window.addEventListener('load', () => {
    const saved = localStorage.getItem('lastScan');
    if (saved) {
        const d = JSON.parse(saved);
        fill('resYear', d.year); fill('resGrade', d.grade); fill('resChassis', d.chassis);
        fill('resSummary', `(Last Saved) ${d.summary}`); fill('resInterior', d.interior);
        fill('resExterior', d.exterior); fill('resVerdict', d.verdict);
        applyVerdictStyle(d.verdict);
        resultDiv.classList.remove('hidden');
    }
});

// --- 2. Camera Controls ---
document.getElementById('btnCam').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment", width: { ideal: 1080 } } 
        });
        video.srcObject = stream;
        video.classList.remove('hidden'); shutterBtn.classList.remove('hidden');
        previewImg.classList.add('hidden'); resultDiv.classList.add('hidden');
        placeholder.classList.add('hidden');
    } catch (err) { alert("Camera Error: Please check permissions."); }
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
        previewImg.classList.remove('hidden'); analyzeBtn.classList.remove('hidden');
        placeholder.classList.add('hidden'); resultDiv.classList.add('hidden');
    };
    reader.readAsDataURL(e.target.files[0]);
});

// --- 3. Legend Logic ---
document.getElementById('openLegend').addEventListener('click', () => document.getElementById('legendModal').classList.remove('hidden'));
document.getElementById('closeLegend').addEventListener('click', () => document.getElementById('legendModal').classList.add('hidden'));

// --- 4. Analysis Logic ---
analyzeBtn.addEventListener('click', async () => {
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
                const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z\\s]+:|$)`, 'i');
                return txt.match(regex)?.[1]?.trim() || "-";
            };

            const verdict = extract("VERDICT");
            const fields = {
                year: extract("YEAR"), grade: extract("GRADE"), chassis: extract("CHASSIS"),
                summary: extract("SUMMARY"), interior: extract("INTERIOR"),
                exterior: extract("EXTERIOR"), verdict: verdict
            };

            Object.keys(fields).forEach(key => fill('res' + key.charAt(0).toUpperCase() + key.slice(1), fields[key]));
            applyVerdictStyle(verdict);

            localStorage.setItem('lastScan', JSON.stringify(fields));
            resultDiv.classList.remove('hidden');
            window.scrollTo({ top: resultDiv.offsetTop - 20, behavior: 'smooth' });
        }
    } catch (err) { alert("Server Error."); }
    finally { analyzeBtn.innerText = "PROCESS SHEET"; analyzeBtn.disabled = false; }
});

function applyVerdictStyle(verdict) {
    const vBox = document.getElementById('verdictBox');
    const flag = document.getElementById('flagStatus');
    const isBad = verdict.toUpperCase().includes("AVOID") || verdict.toUpperCase().includes("CAUTION");
    if(vBox) {
        vBox.className = isBad ? "p-4 rounded-xl border-2 border-red-600 bg-red-900/20 text-red-400" : "p-4 rounded-xl border-2 border-emerald-600 bg-emerald-900/20 text-emerald-400";
    }
    if(flag) flag.classList.toggle('hidden', !isBad);
}

// --- 5. WhatsApp Integration Logic ---
document.getElementById('whatsappBtn').addEventListener('click', () => {
    const saved = localStorage.getItem('lastScan');
    if (!saved) return alert("Scan a car first!");
    
    const d = JSON.parse(saved);
    const phoneNumber = "923318484115"; // REPLAC WITH YOUR REAL WHATSAPP NUMBER
    
    const message = `*AuctionLens PK Expert Review Request*%0A%0A` +
        `*Car:* ${d.year} | Grade: ${d.grade}%0A` +
        `*Chassis:* ${d.chassis}%0A%0A` +
        `*AI Verdict:* ${d.verdict}%0A%0A` +
        `*Summary:* ${d.summary}%0A%0A` +
        `Please provide a human expert second opinion on this sheet.`;

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
});
