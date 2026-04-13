export default async function handler(req, res) {
    // Safety check for method
    if (req.method !== 'POST') return res.status(405).json({ error: "Method Not Allowed" });

    try {
        const { image, mimeType } = req.body;
        if (!image) return res.status(400).json({ error: "Missing image data" });

        const API_KEY = process.env.GROQ_API_KEY;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct", // Flagship 2026 Vision Model
                messages: [
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: "Analyze this Japanese auction sheet. Extract Auction Grade, Chassis Number, Interior/Exterior condition, and any major damage/rust risks." 
                            },
                            {
                                type: "image_url",
                                image_url: { url: `data:${mimeType};base64,${image}` }
                            }
                        ]
                    }
                ],
                temperature: 0.1, // Forces accuracy over creativity
                max_tokens: 1024
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq Error:", data);
            return res.status(response.status).json({ error: data.error?.message || "Groq API failed" });
        }

        return res.status(200).json({
            result: data.choices?.[0]?.message?.content || "No analysis provided."
        });

    } catch (error) {
        console.error("Server Crash:", error);
        return res.status(500).json({ error: "Internal Server Error: " + error.message });
    }
}
