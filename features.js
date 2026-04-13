// --- FEATURE: DOWNLOAD REPORT AS IMAGE ---

document.getElementById('downloadBtn').addEventListener('click', async () => {
    const reportElement = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');

    // 1. Temporary Hide Buttons (so they don't show in the photo)
    downloadBtn.style.display = 'none';
    whatsappBtn.style.display = 'none';

    // 2. Capture the Report
    try {
        const canvas = await html2canvas(reportElement, {
            backgroundColor: "#020617", // Matches your body color
            scale: 2, // Higher quality
            useCORS: true,
            borderRadius: 24
        });

        // 3. Create the Download Link
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        const chassis = document.getElementById('resChassis').innerText || "Report";
        
        link.href = image;
        link.download = `AuctionLens_${chassis}.png`;
        link.click();

    } catch (err) {
        console.error("Capture failed:", err);
        alert("Could not generate image. Try again.");
    } finally {
        // 4. Show Buttons again
        downloadBtn.style.display = 'flex';
        whatsappBtn.style.display = 'flex';
    }
});
