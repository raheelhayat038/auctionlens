export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { image, mimeType } = req.body;

        if (!image || !mimeType) {
            return res.status(400).json({ error: "Missing image data" });
        }

        const API_KEY = process.env.GROQ_API_KEY;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

        if (!API_KEY) {
            return res.status(500).json({ error: "API key not configured" });
        }

        // 🔥 Strong prompt for your business use-case
        const prompt = `
You are a professional Japanese car auction inspector.

Analyze the provided auction sheet image and respond in this EXACT format:

-------------------------
Auction Grade: 
Chassis Number: 

Key Issues:
- 

Damaged Parts:
- 

Risk Level: (Low / Medium / High)

Final Verdict:
(Write in English AND Urdu)

If you detect mismatch (like high grade but heavy damage),
add: ⚠️ Scam Alert (in Urdu)
-------------------------
`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.2-90b-vision-preview",
                temperature: 0.3,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${image}`
                                }
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        // Handle API errors safely
        if (!response.ok) {
            return res.status(500).json({
                error: data.error?.message || "Groq API error"
            });
        }

        // Clean response (avoid frontend crash)
        const resultText =
            data.choices?.[0]?.message?.content || "No response from AI";

        return res.status(200).json({
            success: true,
            result: resultText
        });

    } catch (error) {
        console.error("Server Error:", error);

        return res.status(500).json({
            error: "Server crashed",
            details: error.message
        });
    }
}
