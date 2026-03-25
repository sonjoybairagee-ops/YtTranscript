document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('video-url');
    const getTranscriptBtn = document.getElementById('get-transcript-btn');
    const loadingState = document.getElementById('loading-state');
    const loadingText = document.getElementById('loading-text');
    const errorState = document.getElementById('error-state');
    const errorText = document.getElementById('error-text');
    const outputSection = document.getElementById('output-section');
    const transcriptContent = document.getElementById('transcript-content');
    
    // Actions
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const translateBtn = document.getElementById('translate-btn');
    const summaryBtn = document.getElementById('summary-btn');
    
    const aiResultsContainer = document.getElementById('ai-results-container');
    const aiContent = document.getElementById('ai-content');

    let currentTranscriptRaw = [];
    let currentFullText = "";

    function formatTime(seconds) {
        if (!seconds) return "0:00";
        const totalSeconds = Math.floor(parseFloat(seconds));
        const min = Math.floor(totalSeconds / 60);
        const sec = totalSeconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    // Helper functions to manage UI state
    function showLoading(text) {
        loadingText.textContent = text;
        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');
        if (text === "Fetching transcript...") {
            outputSection.classList.add('hidden');
            aiResultsContainer.classList.add('hidden');
        }
        getTranscriptBtn.disabled = true;
    }

    function hideLoading() {
        loadingState.classList.add('hidden');
        getTranscriptBtn.disabled = false;
    }

    function showError(message) {
        hideLoading();
        errorText.textContent = message;
        errorState.classList.remove('hidden');
        outputSection.classList.add('hidden');
    }

    // Main fetch function
    getTranscriptBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
            alert('Please enter a valid YouTube URL');
            return;
        }

        showLoading('Fetching transcript...');
        
        try {
            const response = await fetch('/.netlify/functions/getTranscript', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch transcript');
            }

            currentTranscriptRaw = data.transcript;
            renderTranscript(data.transcript);

        } catch (error) {
            showError(error.message);
        }
    });

    function renderTranscript(transcriptData) {
        hideLoading();
        outputSection.classList.remove('hidden');
        transcriptContent.innerHTML = '';
        currentFullText = '';

        const df = document.createDocumentFragment();

        transcriptData.forEach(item => {
            currentFullText += item.text + " ";
            
            const lineDiv = document.createElement('div');
            lineDiv.className = 'transcript-line';
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'timestamp';
            timeSpan.textContent = formatTime(item.offset);
            
            const textSpan = document.createElement('span');
            textSpan.className = 'text';
            // decoding html entities if needed
            const parser = new DOMParser();
            const decodedString = parser.parseFromString(`<!doctype html><body>${item.text}`, 'text/html').body.textContent;
            textSpan.textContent = decodedString;

            lineDiv.appendChild(timeSpan);
            lineDiv.appendChild(textSpan);
            
            df.appendChild(lineDiv);
        });

        transcriptContent.appendChild(df);
    }

    // Action Helpers
    copyBtn.addEventListener('click', async () => {
        if (!currentFullText) return;
        try {
            // Strip html tags just in case
            const parser = new DOMParser();
            const cleanText = parser.parseFromString(`<!doctype html><body>${currentFullText}`, 'text/html').body.textContent;
            await navigator.clipboard.writeText(cleanText);
            
            const btnText = copyBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            btnText.textContent = 'Copied!';
            setTimeout(() => btnText.textContent = originalText, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard.');
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (!currentFullText) return;
        
        let textToDownload = '';
        transcriptContent.querySelectorAll('.transcript-line').forEach(line => {
            textToDownload += `[${line.querySelector('.timestamp').textContent}] ${line.querySelector('.text').textContent}\n`;
        });

        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'youtube_transcript.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // AI Integrations
    async function processAI(action) {
        if (!currentFullText) return;
        
        showLoading(action === 'summary' ? 'Generating AI Summary...' : 'Translating to Bangla...');
        outputSection.classList.add('hidden'); // Hide temporarily

        try {
            const response = await fetch('/.netlify/functions/processAI', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, text: currentFullText })
            });

            const data = await response.json();

            hideLoading();
            outputSection.classList.remove('hidden');

            if (!response.ok) {
                // Not showing error state so we dont lose the transcript, just alert
                alert(data.error || `Failed to process AI (${action})`);
                return;
            }

            aiResultsContainer.classList.remove('hidden');
            aiContent.innerHTML = data.result;

            // Scroll to AI results
            aiResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
        } catch (error) {
            hideLoading();
            outputSection.classList.remove('hidden');
            alert(error.message);
        }
    }

    translateBtn.addEventListener('click', () => processAI('translate'));
    summaryBtn.addEventListener('click', () => processAI('summary'));

});
