// --- NAVIGATION LOGIC ---
const btnScan = document.getElementById('navScanner');
const btnCont = document.getElementById('navContact');
const viewScan = document.getElementById('viewScanner');
const viewCont = document.getElementById('viewContact');

// When 'Scanner' is clicked
if(btnScan) {
    btnScan.addEventListener('click', () => {
        viewScan.classList.remove('hidden');
        viewCont.classList.add('hidden');
        // Update colors
        btnScan.classList.add('text-blue-500');
        btnScan.classList.remove('text-slate-500');
        btnCont.classList.remove('text-blue-500');
        btnCont.classList.add('text-slate-500');
    });
}

// When 'Contact' is clicked
if(btnCont) {
    btnCont.addEventListener('click', () => {
        viewScan.classList.add('hidden');
        viewCont.classList.remove('hidden');
        // Update colors
        btnCont.classList.add('text-blue-500');
        btnCont.classList.remove('text-slate-500');
        btnScan.classList.remove('text-blue-500');
        btnScan.classList.add('text-slate-500');
    });
}

// --- LEAD FORM LOGIC ---
const leadForm = document.getElementById('leadForm');
if(leadForm) {
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('leadName').value;
        const phone = document.getElementById('leadPhone').value;
        const msg = document.getElementById('leadMessage').value;
        
        const myNumber = "923318484115"; // CHANGE TO YOUR NUMBER
        const text = `*New Inquiry:*%0AName: ${name}%0APhone: ${phone}%0ACar: ${msg}`;
        
        window.open(`https://wa.me/${myNumber}?text=${text}`, '_blank');
    });
}document.addEventListener('DOMContentLoaded', () => {
    const btnScan = document.getElementById('navScanner');
    const btnCont = document.getElementById('navContact');
    const viewScan = document.getElementById('viewScanner');
    const viewCont = document.getElementById('viewContact');

    // Toggle to Contact Page
    if (btnCont && viewCont && viewScan) {
        btnCont.addEventListener('click', () => {
            viewScan.classList.add('hidden');
            viewCont.classList.remove('hidden');
            btnCont.classList.add('text-blue-500');
            btnScan.classList.remove('text-blue-500');
        });
    }

    // Toggle back to Scanner
    if (btnScan && viewScan && viewCont) {
        btnScan.addEventListener('click', () => {
            viewCont.classList.add('hidden');
            viewScan.classList.remove('hidden');
            btnScan.classList.add('text-blue-500');
            btnCont.classList.remove('text-blue-500');
        });
    }
});
