import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';

export const handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const body = JSON.parse(event.body);
        const videoUrl = body.url;

        if (!videoUrl) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing YouTube URL" })
            };
        }

        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ transcript })
        };
    } catch (error) {
        console.error("Transcript Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: "Failed to fetch transcript. The video might not have one, or the URL is invalid." 
            })
        };
    }
};
