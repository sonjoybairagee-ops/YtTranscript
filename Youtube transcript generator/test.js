import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';

async function test() {
    try {
        const t = await YoutubeTranscript.fetchTranscript("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        console.log("Success:", t.length);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
