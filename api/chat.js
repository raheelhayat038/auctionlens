const video = document.getElementById('video');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const previewContainer = document.getElementById('previewContainer');
const cameraContainer = document.getElementById('cameraContainer');
const aiResponse = document.getElementById('aiResponse');
const resultBox = document.getElementById('resultBox');

let capturedBase64 = null;
let mimeType = "image/png";

// --- CAMERA LOGIC ---
document.getElementById('openCamera').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } // Prefers back camera on phones
        });
        video.srcObject = stream;
        cameraContainer.classList.remove('hidden');
        previewContainer.classList.add('hidden');
    } catch (err) {
        alert("Camera access denied or not available.");
        console.error(err);
    }
});

document.getElementById('captureBtn').addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    capturedBase64 = canvas.toDataURL('image/png').split(',')[1];
    mimeType = "image/png";
    
    imagePreview.src = canvas.toDataURL('image/png');
    showPreview();
    stopCamera();
});

// --- FILE UPLOAD LOGIC ---
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    mimeType = file.type;
    const reader = new FileReader();
    reader.onload = (event) => {
        imagePreview.src = event.target.result;
        capturedBase64 = event.target.result.split(',')[1];
        showPreview();
    };
    reader.readAsDataURL(file);
});

// --- UI HELPERS ---
function showPreview() {
    previewContainer.classList.remove('hidden');
    cameraContainer.classList.add('hidden');
    resultBox.classList.add('hidden');
}

function stopCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
}

// --- API CALL ---
document.getElementById('analyzeBtn').addEventListener('click', async () => {
    if (!capturedBase64) return;

    // Show loading state
    resultBox.classList.remove('hidden');
    aiResponse.innerHTML = `<span class="animate-pulse">Analyzing auction sheet... please wait...</span>`;
    
    try {
        const response = await fetch('/api/chat', { // Points to your Node.js handler
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                image: capturedBase64,
                mimeType: mimeType
            })
        });

        const data = await response.json();

        if (response.ok) {
            aiResponse.textContent = data.result;
        } else {
            aiResponse.innerHTML = `<span class="text-red-400">Error: ${data.error}</span>`;
        }
    } catch (err) {
        aiResponse.innerHTML = `<span class="text-red-400">Server Error: Could not connect to backend.</span>`;
    }
});
