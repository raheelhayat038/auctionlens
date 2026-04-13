// --- CONTACT & NAVIGATION LOGIC ---

const scannerView = document.getElementById('viewScanner');
const contactView = document.getElementById('viewContact');
const navScan = document.getElementById('navScanner');
const navCon = document.getElementById('navContact');

// Tab Switching
navScan.addEventListener('click', () => {
    scannerView.classList.remove('hidden');
    contactView.classList.add('hidden');
    navScan.classList.add('text-blue-500');
    navCon.classList.remove('text-blue-500');
});

navCon.addEventListener('click', () => {
    scannerView.classList.add('hidden');
    contactView.classList.remove('hidden');
    navCon.classList.add('text-blue-500');
    navScan.classList.remove('text-blue-500');
});

// Form Submission to WhatsApp
document.getElementById('leadForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('leadName').value;
    const phone = document.getElementById('leadPhone').value;
    const message = document.getElementById('leadMessage').value;
    
    const adminNumber = "923318484115"; // YOUR NUMBER
    
    const waText = `*NEW INQUIRY FROM AUCTIONLENS*%0A%0A` +
                   `*Name:* ${name}%0A` +
                   `*Phone:* ${phone}%0A` +
                   `*Message:* ${message}`;
                   
    window.open(`https://wa.me/${adminNumber}?text=${waText}`, '_blank');
});
