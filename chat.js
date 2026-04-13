const video = document.getElementById('video');
const previewImg = document.getElementById('previewImg');
const outputText = document.getElementById('outputText');
const resultDiv = document.getElementById('result');

let activeBase64 = null;
let activeMime = "image/png";

// --- Camera Logic ---
document.getElementById('btnCam').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        document.getElementById('camBox').classList.remove('hidden');
        document.getElementById('previewBox').classList.add('hidden');
    } catch (err) { alert("Camera Access Denied"); }
});

document.getElementById('shutter').addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/png');
    activeBase64 = dataUrl.split(',')[1];
    previewImg.src = dataUrl;
    
    document.getElementById('previewBox').classList.remove('hidden');
    document.getElementById('camBox').classList.add('hidden');
    video.srcObject.getTracks().forEach(t => t.stop()); // Stop camera
});

// --- File Upload ---
document.getElementById('fileIn').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    activeMime = file.type;
    const reader = new FileReader();
    reader.onload = (ev) => {
        activeBase64 = ev.target.result.split(',')[1];
        previewImg.src = ev.target.result;
        document.getElementById('previewBox').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
});

// --- API Request ---
document.getElementById('analyze').addEventListener('click', async () => {
    resultDiv.classList.remove('hidden');
    outputText.innerHTML = `<span class="animate-pulse">AI is reading the sheet...</span>`;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: activeBase64, mimeType: activeMime })
        });

        const data = await res.json();
        if (res.ok) {
            outputText.textContent = data.result;
        } else {
            outputText.innerHTML = `<span class="text-red-400">Error: ${data.error}</span>`;
        }
    } catch (err) {
        outputText.innerHTML = `<span class="text-red-400">Network Failure. Check Backend.</span>`;
    }
});
