export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    try {
        const { image, mimeType } = req.body;
        const API_KEY = process.env.GROQ_API_KEY;

        if (!API_KEY) return res.status(500).json({ error: "API Key missing in Vercel settings" });

        // Your specialized 2026 Auction Scouter Prompt
        const auctionPrompt = `
            Analyze this Japanese Auction Sheet image:
            1. Find the Chassis Number and Auction Grade.
            2. Look at the car diagram. List all 'W' (repairs), 'A' (scratches), and 'XX' (replaced panels).
            3. Translate the 'Inspector Notes' into English and Urdu.
            4. Cross-check: If the Grade is '5' or '4.5' but you see 'W' or 'XX' marks, flag it as 'POTENTIALLY TAMPERED'.
            
            Return the result in clear sections.
        `.trim();

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Using the flagship Llama 4 Scout for 2026
                model: "meta-llama/llama-4-scout-17b-16e-instruct", 
                messages: [
                    {
                        role: "system",
                        content: "You are a Japanese Car Auction expert. You provide accurate data extraction and translations."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: auctionPrompt },
                            {
                                type: "image_url",
                                image_url: { url: `data:${mimeType};base64,${image}` }
                            }
                        ]
                    }
                ],
                temperature: 0.1, // Slight flexibility for translation, but low for data accuracy
                max_tokens: 800   // Increased to allow for Urdu/English translations
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "Groq Error" });
        }

        return res.status(200).json({
            result: data.choices?.[0]?.message?.content || "Could not process sheet."
        });

    } catch (error) {
        return res.status(500).json({ error: "Server Error: " + error.message });
    }
}
