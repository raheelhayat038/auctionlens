export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    try {
        const { image, mimeType } = req.body;
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct", 
                messages: [
                    {
                        role: "system",
                        content: "You are an Auction Expert. Follow this format: Grade: [Value], Chassis: [Value], Notes: [Eng/Urdu Translation], Diagram: [List W,A,XX marks], Cross-check: [Warning if Grade doesn't match damage]."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Analyze this Japanese Auction Sheet: 1. Find Chassis & Grade. 2. List W, A, XX repairs from diagram. 3. Translate Inspector Notes to English and Urdu. 4. If Grade is 4.5/5 but you see W/XX marks, flag as 'POTENTIALLY TAMPERED'." },
                            { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}` } }
                        ]
                    }
                ],
                temperature: 0.1,
                max_tokens: 800
            })
        });

        const data = await response.json();
        res.status(200).json({ result: data.choices[0].message.content });
    } catch (e) { res.status(500).json({ error: e.message }); }
}
