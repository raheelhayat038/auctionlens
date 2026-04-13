export default async function handler(req, res) {
    // Vercel only allows POST for this specific logic
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { image, mimeType } = req.body;
        const API_KEY = process.env.GROQ_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "Server Configuration Error: API Key missing" });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.2-11b-vision-preview", // Use this for 100% stability on Vercel
                messages: [
                    {
                        role: "system",
                        content: "Return ONLY: MODEL, GRADE, CHASSIS, and DAMAGE in short bullet points. No conversational text."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Extract data from this sheet." },
                            { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}` } }
                        ]
                    }
                ],
                temperature: 0,
                max_tokens: 150
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "Groq Error" });
        }

        return res.status(200).json({
            result: data.choices?.[0]?.message?.content || "No data found."
        });

    } catch (error) {
        return res.status(500).json({ error: "Vercel Function Error: " + error.message });
    }
}
