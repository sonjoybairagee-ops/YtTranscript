const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const body = JSON.parse(event.body);
        const { action, text } = body;

        if (!text) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing text to process" }) };
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ error: "GEMINI_API_KEY is not configured in environment variables." }) 
            };
        }

        // Initialize Gemini (using gemini-2.5-flash as default modern model)
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let prompt = "";
        // Optional: limit text length to avoid token explosion, but 2.5-flash has large context.
        if (action === "summary") {
            prompt = `Please provide an engaging SEO-friendly title and a concise, well-structured summary for the following YouTube video transcript.
Use HTML tags for formatting (e.g., <h4>, <p>, <ul>/<li>) but omit outer wrappers like markdown code blocks (\`\`\`html) or <html>/<body> tags. Do not use markdown syntax, only raw HTML.

Transcript:
${text}`;
        } else if (action === "translate") {
            prompt = `Translate the following YouTube video transcript to Bengali (Bangla). Retain the structure and meaning. Break down into simple paragraphs separated by <p> tags, omit markdown backticks.

Transcript:
${text}`;
        } else {
            return { statusCode: 400, body: JSON.stringify({ error: "Invalid action type" }) };
        }

        const result = await model.generateContent(prompt);
        const generatedText = result.response.text();

        // Clean up markdown codeblocks if AI happens to output them
        const cleanedText = generatedText.replace(/```(html)?/g, "").trim();

        return {
            statusCode: 200,
            body: JSON.stringify({ result: cleanedText })
        };
    } catch (error) {
        console.error("AI Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process AI request.", details: error.message })
        };
    }
};
