document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECT ALL ELEMENTS
    const btnScan = document.getElementById('navScanner');
    const btnCont = document.getElementById('navContact');
    const viewScan = document.getElementById('viewScanner');
    const viewCont = document.getElementById('viewContact');
    const video = document.getElementById('video');
    const previewImg = document.getElementById('previewImg');
    const shutterBtn = document.getElementById('shutter');
    const analyzeBtn = document.getElementById('analyze');
    const leadForm = document.getElementById('leadForm');

    console.log("App Initialized. Checking IDs...");

    // 2. NAVIGATION LOGIC
    if (btnScan && btnCont && viewScan && viewCont) {
        btnCont.addEventListener('click', () => {
            viewScan.classList.add('hidden');
            viewCont.classList.remove('hidden');
            btnCont.classList.add('text-blue-500');
            btnScan.classList.remove('text-blue-500');
            btnScan.classList.add('text-slate-500');
        });

        btnScan.addEventListener('click', () => {
            viewCont.classList.add('hidden');
            viewScan.classList.remove('hidden');
            btnScan.classList.add('text-blue-500');
            btnCont.classList.remove('text-blue-500');
            btnCont.classList.add('text-slate-500');
        });
    }

    // 3. CAMERA LOGIC
    document.getElementById('btnCam')?.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = stream;
            video.classList.remove('hidden');
            shutterBtn.classList.remove('hidden');
            previewImg.classList.add('hidden');
            document.getElementById('placeholderText').classList.add('hidden');
        } catch (err) {
            alert("Please allow camera access.");
        }
    });

    shutterBtn?.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        previewImg.src = canvas.toDataURL('image/png');
        video.classList.add('hidden');
        previewImg.classList.remove('hidden');
        shutterBtn.classList.add('hidden');
        analyzeBtn.classList.remove('hidden');
        video.srcObject.getTracks().forEach(track => track.stop());
    });

    // 4. WHATSAPP LEAD FORM
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('leadName').value;
            const phone = document.getElementById('leadPhone').value;
            const msg = document.getElementById('leadMessage').value;
            const myNumber = "923318484115";
            const text = `*AUCTIONLENS PK LEAD*%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Car:* ${msg}`;
            window.open(`https://wa.me/${myNumber}?text=${text}`, '_blank');
        });
    }
});
