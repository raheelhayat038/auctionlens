document.addEventListener('DOMContentLoaded', () => {
    // 1. Check elements (Prevents the errors in your screenshots)
    const elements = {
        navScanner: document.getElementById('navScanner'),
        navContact: document.getElementById('navContact'),
        viewScanner: document.getElementById('viewScanner'),
        viewContact: document.getElementById('viewContact'),
        fileIn: document.getElementById('fileIn'),
        preview: document.getElementById('previewImg'),
        analyze: document.getElementById('analyze'),
        placeholder: document.getElementById('placeholder')
    };

    // If anything is missing, stop and tell us
    for (let key in elements) {
        if (!elements[key]) {
            console.error(`MISSING FROM HTML: id='${key}'`);
            return;
        }
    }

    // 2. Navigation Logic
    elements.navScanner.onclick = () => {
        elements.viewScanner.classList.remove('hidden');
        elements.viewContact.classList.add('hidden');
        elements.navScanner.classList.replace('text-slate-500', 'text-blue-500');
        elements.navContact.classList.replace('text-blue-500', 'text-slate-500');
    };

    elements.navContact.onclick = () => {
        elements.viewScanner.classList.add('hidden');
        elements.viewContact.classList.remove('hidden');
        elements.navContact.classList.replace('text-slate-500', 'text-blue-500');
        elements.navScanner.classList.replace('text-blue-500', 'text-slate-500');
    };

    // 3. Gallery Upload Logic
    document.getElementById('btnGallery').onclick = () => elements.fileIn.click();

    elements.fileIn.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            elements.preview.src = ev.target.result;
            elements.preview.classList.remove('hidden');
            elements.analyze.classList.remove('hidden');
            elements.placeholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    };

    console.log("App Loaded Successfully!");
});
