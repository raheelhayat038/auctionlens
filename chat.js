/**
 * AUCTIONLENS PK - Core Controller
 * Handles Camera, File Uploads, and AI Data Mapping
 */

const video = document.getElementById('video');
const previewImg = document.getElementById('previewImg');
const resultDiv = document.getElementById('result');
const analyzeBtn = document.getElementById('analyze');
const shutterBtn = document.getElementById('shutter');
const placeholder = document.getElementById('placeholderText');

let activeBase64 = null;
let activeMime = "image/png";

// --- 1. Camera Logic (Portrait Locked) ---
document.getElementById('btnCam').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment",
                aspectRatio: { ideal: 0.5625 } // 9:16 Portrait
            } 
        });
        video.srcObject = stream;
        video.classList.remove('hidden');
        previewImg.classList.add('hidden');
        shutterBtn.classList.remove('hidden');
        placeholder.classList.add('hidden');
        analyzeBtn.classList.add('hidden');
        resultDiv.classList.add('hidden');
    } catch (err) { 
        alert("Camera Access Error. Please allow camera permissions."); 
    }
});

// Capture Photo from Stream
shutterBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/png');
    activeBase64 = dataUrl.split(',')[1];
    activeMime = "image/png";
    
    previewImg.src = dataUrl;
    video.classList.add('hidden');
    previewImg.classList.remove('hidden');
    shutterBtn.classList.add('hidden');
    analyzeBtn.classList.remove('hidden');
    
    // Stop camera to save battery
    video.srcObject.getTracks().forEach(track => track.stop());
});

// --- 2. File Upload Logic ---
document.getElementById('fileIn').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    activeMime = file.type;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        activeBase64 = dataUrl.split(',')[1];
        
        previewImg.src = dataUrl;
        previewImg.classList.remove('hidden');
        video.classList.add('hidden');
        shutterBtn.classList.add('hidden');
        analyzeBtn.classList.remove('hidden');
        placeholder.classList.add('hidden');
        resultDiv.classList.add('hidden');
    };
    reader.readAsDataURL(file);
});

// --- 3. Expert Analysis & Data Mapping ---
analyzeBtn.addEventListener('click', async () => {
    // UI State: Loading
    resultDiv.classList.add('hidden');
    analyzeBtn.innerText = "GENERATING EXPERT REPORT...";
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

            /**
             * Helper function: extract()
             * Searches for a Label (e.g., "YEAR:") and grabs text until the next Label.
             */
            const extract = (label) => {
                const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z\\s]+:|$)`, 'i');
                const match = txt.match(regex);
                return match ? match[1].trim() : "Not Detected";
            };

            // Map Quick Stats
            document.getElementById('resYear').innerText = extract("YEAR");
            document.getElementById('resMake').innerText = extract("MAKE");
            document.getElementById('resModel').innerText = extract("MODEL");
            document.getElementById('resGrade').innerText = extract("GRADE");
            document.getElementById('resChassis').innerText = extract("CHASSIS");

            // Map Detailed Text Sections
            document.getElementById('resSummary').innerText = extract("SUMMARY");
            document.getElementById('resInterior').innerText = extract("INTERIOR");
            document.getElementById('resExterior').innerText = extract("EXTERIOR");

            // Verdict Logic
            const verdictText = extract("VERDICT");
            const verdictEl = document.getElementById('resVerdict');
            const verdictBox = document.getElementById('verdictBox');
            const flag = document.getElementById('flagStatus');

            verdictEl.innerText = verdictText;

            // Visual Styling based on AI Verdict
            const upperVerdict = verdictText.toUpperCase();
            if (upperVerdict.includes("AVOID") || upperVerdict.includes("CAUTION") || txt.includes("TAMPERED")) {
                // Danger Style
                verdictBox.className = "p-5 rounded-2xl border-2 border-red-600 bg-red-950/30 text-red-400";
                flag.classList.remove('hidden');
            } else {
                // Healthy Style
                verdictBox.className = "p-5 rounded-2xl border-2 border-emerald-600 bg-emerald-950/30 text-emerald-400";
                flag.classList.add('hidden');
            }

            // Reveal Result
            resultDiv.classList.remove('hidden');
            
            // Smooth scroll to report
            window.scrollTo({
                top: resultDiv.offsetTop - 20,
                behavior: 'smooth'
            });

        } else {
            alert("API Error: " + (data.error || "Unknown error occurred"));
        }
    } catch (err) {
        console.error(err);
        alert("Connection failed. Please check your network and Groq API key.");
    } finally {
        analyzeBtn.innerText = "ANALYZE SHEET";
        analyzeBtn.disabled = false;
    }
});
