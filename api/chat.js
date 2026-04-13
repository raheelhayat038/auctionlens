export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    try {
        const { image, mimeType } = req.body;
        const API_KEY = process.env.GROQ_API_KEY;

        if (!API_KEY) return res.status(500).json({ error: "API Key missing in Vercel" });

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Using Llama-3-70b-vision as it is the current stable flagship
                model: "llama-3.2-90b-vision-preview", 
                messages: [
                    {
                        role: "system",
                        content: "Return ONLY: MODEL, GRADE, CHASSIS, and DAMAGE in 1-3 word bullet points. No conversational text."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Extract auction sheet data." },
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
            // Check if model was decommissioned again
            if (data.error?.message?.includes('decommissioned')) {
                return res.status(400).json({ error: "Groq updated their models. Please check documentation for the newest Vision ID." });
            }
            return res.status(response.status).json({ error: data.error?.message || "Groq Error" });
        }

        return res.status(200).json({
            result: data.choices?.[0]?.message?.content || "No data found."
        });

    } catch (error) {
        return res.status(500).json({ error: "Server Error: " + error.message });
    }
}
