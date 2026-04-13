export default async function handler(req, res) {
    const { prompt } = req.body;
    // This pulls the key from Vercel's secret settings
    const API_KEY = process.env.GEMINI_API_KEY; AIzaSyCKTuHqNFv01tXzsYNJyBh4uYMxmDpbOqg

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "API connection failed" });
    }
}
