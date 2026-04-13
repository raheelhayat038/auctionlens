document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const btnScan = document.getElementById('navScanner');
    const btnCont = document.getElementById('navContact');
    const viewScan = document.getElementById('viewScanner');
    const viewCont = document.getElementById('viewContact');
    
    const video = document.getElementById('video');
    const previewImg = document.getElementById('previewImg');
    const fileIn = document.getElementById('fileIn');
    const shutterBtn = document.getElementById('shutter');
    const analyzeBtn = document.getElementById('analyze');
    const resultDiv = document.getElementById('result');
    const placeholder = document.getElementById('placeholderText');

    let activeBase64 = null;

    // --- 1. NAVIGATION ---
    btnCont.addEventListener('click', () => {
        viewScan.classList.add('hidden');
        viewCont.classList.remove('hidden');
        btnCont.classList.add('text-blue-500');
        btnScan.classList.remove('text-blue-500');
    });

    btnScan.addEventListener('click', () => {
        viewCont.classList.add('hidden');
        viewScan.classList.remove('hidden');
        btnScan.classList.add('text-blue-500');
        btnCont.classList.remove('text-blue-500');
    });

    // --- 2. CAMERA & UPLOAD ---
    document.getElementById('btnCam').addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = stream;
            video.classList.remove('hidden');
            shutterBtn.classList.remove('hidden');
            previewImg.classList.add('hidden');
            placeholder.classList.add('hidden');
            resultDiv.classList.add('hidden');
        } catch (err) { alert("Camera access denied."); }
    });

    shutterBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        activeBase64 = canvas.toDataURL('image/png').split(',')[1];
        previewImg.src = canvas.toDataURL('image/png');
        video.classList.add('hidden');
        previewImg.classList.remove('hidden');
        shutterBtn.classList.add('hidden');
        analyzeBtn.classList.remove('hidden');
        video.srcObject.getTracks().forEach(t => t.stop());
    });

    fileIn.addEventListener('change', (e) => {
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

    // --- 3. AI ANALYSIS ---
    analyzeBtn.addEventListener('click', async () => {
        analyzeBtn.innerText = "PROCESSING...";
        analyzeBtn.disabled = true;
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: activeBase64, mimeType: "image/png" })
            });
            const data = await res.json();
            if (res.ok) {
                const txt = data.result;
                const extract = (label) => {
                    const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z\\s]+:|$)`, 'i');
                    return txt.match(regex)?.[1]?.trim() || "-";
                };

                document.getElementById('resVerdict').innerText = extract("VERDICT");
                document.getElementById('resGrade').innerText = extract("GRADE");
                document.getElementById('resChassis').innerText = extract("CHASSIS");
                
                resultDiv.classList.remove('hidden');
                window.scrollTo({ top: resultDiv.offsetTop, behavior: 'smooth' });
            }
        } catch (err) { alert("Analysis failed."); }
        finally { analyzeBtn.innerText = "PROCESS SHEET"; analyzeBtn.disabled = false; }
    });

    // --- 4. FORM LOGIC ---
    document.getElementById('leadForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const text = `*New Inquiry*%0AName: ${document.getElementById('leadName').value}%0APhone: ${document.getElementById('leadPhone').value}%0ACar: ${document.getElementById('leadMessage').value}`;
        window.open(`https://wa.me/923318484115?text=${text}`, '_blank');
    });
});
