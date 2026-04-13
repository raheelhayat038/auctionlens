// ... existing camera/file logic ...

analyzeBtn.addEventListener('click', async () => {
    resultDiv.classList.add('hidden');
    analyzeBtn.innerText = "EXTRACTING DATA...";
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
            
            // Map NEW fields to UI
            document.getElementById('resYear').innerText = txt.match(/Year:\s*([^\n,]+)/i)?.[1] || "-";
            document.getElementById('resMake').innerText = txt.match(/Make:\s*([^\n,]+)/i)?.[1] || "-";
            document.getElementById('resModel').innerText = txt.match(/Model:\s*([^\n,]+)/i)?.[1] || "-";
            
            // Existing fields
            document.getElementById('resGrade').innerText = txt.match(/Grade:\s*([^\n,]+)/i)?.[1] || "N/A";
            document.getElementById('resChassis').innerText = txt.match(/Chassis:\s*([^\n,]+)/i)?.[1] || "N/A";
            document.getElementById('resNotes').innerText = txt.match(/Notes:\s*([^\n,]+)/i)?.[1] || "No summary available";
            document.getElementById('resDiagram').innerText = txt.match(/Diagram:\s*([^\n,]+)/i)?.[1] || "None detected";

            const flag = document.getElementById('flagStatus');
            txt.includes("POTENTIALLY TAMPERED") ? flag.classList.remove('hidden') : flag.classList.add('hidden');

            resultDiv.classList.remove('hidden');
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    } catch (err) { alert("Network Error"); }
    finally {
        analyzeBtn.innerText = "ANALYZE SHEET";
        analyzeBtn.disabled = false;
    }
});
