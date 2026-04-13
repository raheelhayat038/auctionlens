// Global navigation function
function show(view) {
    const views = { scan: 'viewScanner', parts: 'viewParts', cont: 'viewContact' };
    const navs = { scan: 'navScan', parts: 'navParts', cont: 'navCont' };

    Object.keys(views).forEach(k => {
        document.getElementById(views[k]).classList.add('hidden');
        document.getElementById(navs[k]).classList.replace('text-blue-500', 'text-slate-500');
    });

    document.getElementById(views[view]).classList.remove('hidden');
    document.getElementById(navs[view]).classList.replace('text-slate-500', 'text-blue-500');
}

document.addEventListener('DOMContentLoaded', () => {
    const fileIn = document.getElementById('fileIn');
    const preview = document.getElementById('previewImg');
    const analyzeBtn = document.getElementById('analyze');
    const video = document.getElementById('video');
    const shutter = document.getElementById('shutter');
    let activeBase64 = null;

    // --- GALLERY FIX ---
    document.getElementById('btnGallery').addEventListener('click', () => fileIn.click());

    fileIn.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            activeBase64 = event.target.result.split(',')[1];
            preview.src = event.target.result;
            preview.classList.remove('hidden');
            document.getElementById('placeholder').classList.add('hidden');
            video.classList.add('hidden');
            shutter.classList.add('hidden');
            analyzeBtn.classList.remove('hidden'); // This reveals the Process button
            document.getElementById('result').classList.add('hidden');
        };
        reader.readAsDataURL(file);
    });

    // --- CAMERA ENGINE ---
    document.getElementById('btnCam').addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = stream;
            video.classList.remove('hidden');
            shutter.classList.remove('hidden');
            preview.classList.add('hidden');
            document.getElementById('placeholder').classList.add('hidden');
            analyzeBtn.classList.add('hidden');
        } catch (err) { alert("Camera Error"); }
    });

    shutter.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        activeBase64 = canvas.toDataURL('image/png').split(',')[1];
        preview.src = canvas.toDataURL('image/png');
        preview.classList.remove('hidden');
        video.classList.add('hidden');
        shutter.classList.add('hidden');
        analyzeBtn.classList.remove('hidden');
        video.srcObject.getTracks().forEach(t => t.stop());
    });

    // --- AI ANALYSIS ---
    analyzeBtn.addEventListener('click', async () => {
        analyzeBtn.innerText = "WAIT...";
        analyzeBtn.disabled = true;
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: activeBase64, mimeType: "image/png" })
            });
            const data = await res.json();
            const txt = data.result;

            const extract = (tag) => {
                const reg = new RegExp(`${tag}:\\s*([\\s\\S]*?)(?=\\n[A-Z]+:|$)`, 'i');
                return txt.match(reg)?.[1]?.trim() || "-";
            };

            document.getElementById('resVerdict').innerText = extract("VERDICT");
            document.getElementById('resYear').innerText = extract("YEAR");
            document.getElementById('resGrade').innerText = extract("GRADE");
            document.getElementById('resChassis').innerText = extract("CHASSIS");
            document.getElementById('resSummary').innerText = extract("SUMMARY");

            // Style Verdict
            const isBad = txt.toUpperCase().includes("AVOID");
            document.getElementById('verdictBox').className = isBad ? 
                "p-4 rounded-xl bg-red-900/20 border border-red-500 text-red-500 text-center mb-4" : 
                "p-4 rounded-xl bg-emerald-900/20 border border-emerald-500 text-emerald-500 text-center mb-4";

            document.getElementById('result').classList.remove('hidden');
        } catch (e) { alert("Error"); }
        finally { analyzeBtn.innerText = "PROCESS SHEET"; analyzeBtn.disabled = false; }
    });
});
