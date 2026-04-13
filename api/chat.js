export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    try {
        const { image, mimeType } = req.body;
        const API_KEY = process.env.GROQ_API_KEY;

        if (!API_KEY) return res.status(500).json({ error: "API Key missing in Vercel settings" });

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // NEW 2026 FLAGSHIP VISION MODEL
                model: "meta-llama/llama-4-scout-17b-16e-instruct", 
                messages: [
                    {
                        role: "system",
                        content: "You are a specialized Japanese Auction Sheet extractor. Return ONLY: MODEL, GRADE, CHASSIS, and DAMAGE in 1-3 word bullet points. No chat, no intro."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Extract auction sheet data." },
                            {
                                type: "image_url",
                                image_url: { url: `data:${mimeType};base64,${image}` }
                            }
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
        return res.status(500).json({ error: "Server Error: " + error.message });
    }
}
