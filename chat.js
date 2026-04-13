const video = document.getElementById('video');
const previewImg = document.getElementById('previewImg');
const outputText = document.getElementById('outputText');
const resultDiv = document.getElementById('result');
const placeholderText = document.getElementById('placeholderText');
const analyzeBtn = document.getElementById('analyze');
const shutterBtn = document.getElementById('shutter');

let activeBase64 = null;
let activeMime = "image/png";

/**
 * UI State Helper
 * Hides placeholders and shows the Analyze button once an image is ready
 */
function showPreviewState() {
    placeholderText.classList.add('hidden');
    analyzeBtn.classList.remove('hidden');
    resultDiv.classList.add('hidden'); // Hide previous results if any
}

// --- Camera Logic ---
document.getElementById('btnCam').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        video.srcObject = stream;
        
        // UI Updates
        video.classList.remove('hidden');
        previewImg.classList.add('hidden');
        shutterBtn.classList.remove('hidden');
        placeholderText.classList.add('hidden');
        analyzeBtn.classList.add('hidden');
    } catch (err) { 
        alert("Camera Access Denied: " + err.message); 
    }
});

// Capture Photo
shutterBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/png');
    activeBase64 = dataUrl.split(',')[1];
    activeMime = "image/png";
    
    previewImg.src = dataUrl;
    
    // UI Updates
    video.classList.add('hidden');
    previewImg.classList.remove('hidden');
    shutterBtn.classList.add('hidden');
    showPreviewState();

    // Stop Camera Stream
    video.srcObject.getTracks().forEach(track => track.stop());
});

// --- File Upload Logic ---
document.getElementById('fileIn').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    activeMime = file.type;
    const reader = new FileReader();
    
    reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        activeBase64 = dataUrl.split(',')[1];
        previewImg.src = dataUrl;
        
        // UI Updates
        video.classList.add('hidden');
        previewImg.classList.remove('hidden');
        shutterBtn.classList.add('hidden');
        showPreviewState();
    };
    reader.readAsDataURL(file);
});

// --- API Request (Analysis) ---
analyzeBtn.addEventListener('click', async () => {
    // UI Loading State
    resultDiv.classList.remove('hidden');
    analyzeBtn.disabled = true;
    analyzeBtn.innerText = "PROCESSING...";
    outputText.innerHTML = `<div class="flex items-center gap-2 text-blue-400">
        <svg class="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>AI is scanning diagrams & notes...</span>
    </div>`;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: activeBase64, mimeType: activeMime })
        });

        const data = await res.json();
        
        if (res.ok) {
            // Success: Display Result
            outputText.textContent = data.result;
        } else {
            // Error from Backend
            outputText.innerHTML = `<span class="text-red-400 font-bold">Error:</span><br><span class="text-xs text-slate-400">${data.error}</span>`;
        }
    } catch (err) {
        // Network Failure
        outputText.innerHTML = `<span class="text-red-400">Network Failure. Please check your Vercel logs and API Key.</span>`;
    } finally {
        // Reset Button
        analyzeBtn.disabled = false;
        analyzeBtn.innerText = "ANALYZE SHEET";
    }
});
