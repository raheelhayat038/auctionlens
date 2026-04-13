document.addEventListener('DOMContentLoaded', () => {
    console.log("App Loaded - Checking elements...");

    // 1. Grab all the elements
    const btnScan = document.getElementById('navScanner');
    const btnCont = document.getElementById('navContact');
    const viewScan = document.getElementById('viewScanner');
    const viewCont = document.getElementById('viewContact');
    const leadForm = document.getElementById('leadForm');

    // 2. Troubleshooting: Tell us exactly what is missing
    if (!btnScan) console.error("MISSING FROM HTML: id='navScanner'");
    if (!btnCont) console.error("MISSING FROM HTML: id='navContact'");
    if (!viewScan) console.error("MISSING FROM HTML: id='viewScanner'");
    if (!viewCont) console.error("MISSING FROM HTML: id='viewContact'");

    // 3. If everything is found, set up the buttons
    if (btnScan && btnCont && viewScan && viewCont) {
        console.log("Success! All IDs found. Navigation is ready.");

        // Click Contact
        btnCont.addEventListener('click', () => {
            console.log("Switching to Contact View");
            viewScan.classList.add('hidden');
            viewCont.classList.remove('hidden');
            // Colors
            btnCont.classList.add('text-blue-500');
            btnScan.classList.remove('text-blue-500');
        });

        // Click Scanner
        btnScan.addEventListener('click', () => {
            console.log("Switching to Scanner View");
            viewCont.classList.add('hidden');
            viewScan.classList.remove('hidden');
            // Colors
            btnScan.classList.add('text-blue-500');
            btnCont.classList.remove('text-blue-500');
        });
    }

    // 4. Lead Form Logic
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('leadName').value;
            const phone = document.getElementById('leadPhone').value;
            const msg = document.getElementById('leadMessage').value;
            const myNumber = "923318484115"; 
            const text = `*NEW INQUIRY*%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Msg:* ${msg}`;
            window.open(`https://wa.me/${myNumber}?text=${text}`, '_blank');
        });
    }
});
