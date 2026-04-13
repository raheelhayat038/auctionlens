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
                        content: `You are a Senior Automotive Inspector. Provide a highly detailed report. 
                        Format exactly:
                        Year: [val], Make: [val], Model: [val], Grade: [val], Chassis: [val]
                        Condition Summary: [A 2-3 sentence overview of the car's overall health]
                        Interior Details: [Detailed bullet points on seats, dash, and smell]
                        Exterior & Diagram: [Explain every W, A, S, or XX mark found and its severity]
                        Final Verdict: [Advice on whether to buy or avoid based on tampering/damage]`
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Provide an elaborate inspection report including interior, exterior, and a final purchase verdict." },
                            { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}` } }
                        ]
                    }
                ],
                temperature: 0.2, // Slightly higher for better descriptive language
                max_tokens: 1000
            })
        });

        const data = await response.json();
        res.status(200).json({ result: data.choices[0].message.content });
    } catch (e) { res.status(500).json({ error: e.message }); }
}
