document.addEventListener('DOMContentLoaded', () => {
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
