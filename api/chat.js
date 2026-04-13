messages: [
    {
        role: "user",
        content: [
            { 
                type: "text", 
                text: `ACT AS A DATA EXTRACTOR. 
                Analyze the Japanese auction sheet and provide ONLY the following points in short bullet points:
                - **MODEL:** (Year/Model)
                - **GRADE:** (Auction Score)
                - **CHASSIS:** (Full Number)
                - **CONDITION:** (1 sentence on interior/exterior)
                - **DAMAGE:** (List major points like RUST, REPAIR, or X marks)
                
                Strictly avoid any introductory or concluding sentences.` 
            },
            {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${image}` }
            }
        ]
    }
],
temperature: 0.0, // Set to 0.0 for maximum consistency and zero "creativity"
