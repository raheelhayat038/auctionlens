document.addEventListener('DOMContentLoaded', () => {
    // --- SETUP ---
    const nav = {
        scanBtn: document.getElementById('navScanner'),
        partsBtn: document.getElementById('navParts'),
        contBtn: document.getElementById('navContact'),
        scanView: document.getElementById('viewScanner'),
        partsView: document.getElementById('viewParts'),
        contView: document.getElementById('viewContact')
    };

    const scanner = {
        video: document.getElementById('video'),
        preview: document.getElementById('previewImg'),
        fileIn: document.getElementById('fileIn'),
        shutter: document.getElementById('shutter'),
        analyze: document.getElementById('analyze'),
        result: document.getElementById('result'),
        placeholder: document.getElementById('placeholderText')
    };

    let activeBase64 = null;

    // --- NAVIGATION ---
    function switchView(activeKey) {
        ['scan', 'parts', 'cont'].forEach(k => {
            nav[k + 'View'].classList.toggle('hidden', k !== activeKey);
            nav[k + 'Btn'].classList.toggle('text-blue-500', k === activeKey);
            nav[k + 'Btn'].classList.toggle('text-slate-500', k !== activeKey);
        });
    }

    nav.scanBtn.addEventListener('click', () => switchView('scan'));
    nav.partsBtn.addEventListener('click', () => switchView('parts'));
    nav.contBtn.addEventListener('click', () => switchView('cont'));

    // --- UPLOAD LOGIC (FIXED) ---
    scanner.fileIn.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const dataUrl = event.target.result;
            activeBase64 = dataUrl.split(',')[1];
            
            // UI Updates
            scanner.preview.src = dataUrl;
            scanner.preview.classList.remove('hidden');
            scanner.placeholder.classList.add('hidden');
            scanner.video.classList.add('hidden');
            scanner.shutter.classList.add('hidden');
            scanner.analyze.classList.remove('hidden'); // SHOW PROCESS BUTTON
            scanner.result.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    });

    // --- CAMERA LOGIC ---
    document.getElementById('btnCam').addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            scanner.video.srcObject = stream;
            scanner.video.classList.remove('hidden');
            scanner.shutter.classList.remove('hidden');
            scanner.preview.classList.add('hidden');
            scanner.placeholder.classList.add('hidden');
            scanner.result.classList.add('hidden');
            scanner.analyze.classList.add('hidden');
        } catch (err) { alert("Enable camera."); }
    });

    scanner.shutter.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = scanner.video.videoWidth; 
        canvas.height = scanner.video.videoHeight;
        canvas.getContext('2d').drawImage(scanner.video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        activeBase64 = dataUrl.split(',')[1];
        scanner.preview.src = dataUrl;
        scanner.preview.classList.remove('hidden');
        scanner.video.classList.add('hidden');
        scanner.shutter.classList.add('hidden');
        scanner.analyze.classList.remove('hidden');
        scanner.video.srcObject.getTracks().forEach(t => t.stop());
    });

    // --- AI LOGIC ---
    scanner.analyze.addEventListener('click', async () => {
        scanner.analyze.innerText = "PROCESSING...";
        scanner.analyze.disabled = true;
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
                document.getElementById('resYear').innerText = extract("YEAR");
                document.getElementById('resGrade').innerText = extract("GRADE");
                document.getElementById('resChassis').innerText = extract("CHASSIS");
                document.getElementById('resInterior').innerText = extract("INTERIOR");
                document.getElementById('resSummary').innerText = extract("SUMMARY");

                // Verdict Color Logic
                const isBad = txt.toUpperCase().includes("AVOID");
                document.getElementById('verdictBox').className = isBad ? 
                    "p-4 rounded-xl border-2 border-red-600 bg-red-900/10 text-red-500 text-center" : 
                    "p-4 rounded-xl border-2 border-emerald-600 bg-emerald-900/10 text-emerald-500 text-center";

                scanner.result.classList.remove('hidden');
                window.scrollTo({ top: scanner.result.offsetTop, behavior: 'smooth' });
            }
        } catch (err) { alert("Connection error."); }
        finally { scanner.analyze.innerText = "PROCESS IMAGE"; scanner.analyze.disabled = false; }
    });
});
