document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
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
    const WHATSAPP_NUMBER = "923318484115";

    // --- 1. NAVIGATION LOGIC ---
    function switchView(activeKey) {
        const keys = ['scan', 'parts', 'cont'];
        keys.forEach(k => {
            nav[k + 'View'].classList.toggle('hidden', k !== activeKey);
            nav[k + 'Btn'].classList.toggle('text-blue-500', k === activeKey);
            nav[k + 'Btn'].classList.toggle('text-slate-500', k !== activeKey);
        });
    }

    nav.scanBtn.addEventListener('click', () => switchView('scan'));
    nav.partsBtn.addEventListener('click', () => switchView('parts'));
    nav.contBtn.addEventListener('click', () => switchView('cont'));

    // --- 2. SCANNER ENGINE ---
    document.getElementById('btnCam').addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            scanner.video.srcObject = stream;
            scanner.video.classList.remove('hidden');
            scanner.shutter.classList.remove('hidden');
            scanner.preview.classList.add('hidden');
            scanner.placeholder.classList.add('hidden');
            scanner.result.classList.add('hidden');
        } catch (err) { alert("Enable camera access."); }
    });

    scanner.shutter.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = scanner.video.videoWidth; canvas.height = scanner.video.videoHeight;
        canvas.getContext('2d').drawImage(scanner.video, 0, 0);
        activeBase64 = canvas.toDataURL('image/png').split(',')[1];
        scanner.preview.src = canvas.toDataURL('image/png');
        scanner.video.classList.add('hidden');
        scanner.preview.classList.remove('hidden');
        scanner.shutter.classList.add('hidden');
        scanner.analyze.classList.remove('hidden');
        scanner.video.srcObject.getTracks().forEach(t => t.stop());
    });

    scanner.fileIn.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            activeBase64 = ev.target.result.split(',')[1];
            scanner.preview.src = ev.target.result;
            scanner.preview.classList.remove('hidden');
            scanner.analyze.classList.remove('hidden');
            scanner.placeholder.classList.add('hidden');
            scanner.result.classList.add('hidden');
        };
        reader.readAsDataURL(e.target.files[0]);
    });

    // --- 3. AI ANALYSIS ---
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

                // Style Verdict Box Color
                const isBad = txt.toUpperCase().includes("AVOID");
                document.getElementById('verdictBox').className = isBad ? 
                    "p-4 rounded-xl border-2 border-red-600 bg-red-900/10 text-red-500 text-center mb-4" : 
                    "p-4 rounded-xl border-2 border-emerald-600 bg-emerald-900/10 text-emerald-500 text-center mb-4";

                scanner.result.classList.remove('hidden');
                window.scrollTo({ top: scanner.result.offsetTop, behavior: 'smooth' });
            }
        } catch (err) { alert("AI Error."); }
        finally { scanner.analyze.innerText = "PROCESS SHEET"; scanner.analyze.disabled = false; }
    });

    // --- 4. WHATSAPP & FORMS ---
    document.getElementById('whatsappReport').addEventListener('click', () => {
        const msg = `*Report Review Request*%0AYear: ${document.getElementById('resYear').innerText}%0AGrade: ${document.getElementById('resGrade').innerText}%0AChassis: ${document.getElementById('resChassis').innerText}`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    });

    document.getElementById('leadForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const text = `*New Inquiry*%0AName: ${document.getElementById('leadName').value}%0AInquiry: ${document.getElementById('leadMessage').value}`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
    });
});
