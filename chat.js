document.addEventListener('DOMContentLoaded', () => {
    console.log("App Loaded - Checking elements...");

    const btnScan = document.getElementById('navScanner');
    const btnCont = document.getElementById('navContact');
    const viewScan = document.getElementById('viewScanner');
    const viewCont = document.getElementById('viewContact');

    if (!btnScan || !btnCont || !viewScan || !viewCont) {
        console.error("Error: Some IDs are missing in your HTML!");
        return;
    }

    btnCont.addEventListener('click', () => {
        console.log("Contact button clicked");
        viewScan.classList.add('hidden');
        viewCont.classList.remove('hidden');
    });

    btnScan.addEventListener('click', () => {
        console.log("Scanner button clicked");
        viewCont.classList.add('hidden');
        viewScan.classList.remove('hidden');
    });
});
