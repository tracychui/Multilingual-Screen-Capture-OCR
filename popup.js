document.getElementById('captureBtn').addEventListener('click', () => {
  const resultDiv = document.getElementById('ocrResult');
  const progressBar = document.querySelector('#progressBar div');
  const selectedLang = document.getElementById('langSelect').value;
  resultDiv.textContent = 'Capturing screen...';

  chrome.runtime.sendMessage({action: "capture"}, (response) => {
    if (response && response.success) {
      performOCR(response.dataUrl, selectedLang);
    } else {
      resultDiv.textContent = 'Error capturing screen: ' + (response ? response.error : 'Unknown error');
    }
  });
});

function performOCR(imageDataUrl, lang) {
  const resultDiv = document.getElementById('ocrResult');
  const progressBar = document.querySelector('#progressBar div');
  resultDiv.textContent = 'Initializing Tesseract...';

  Tesseract.recognize(
    imageDataUrl,
    lang,
    { 
      logger: m => {
        console.log(m);
        if (m.status === 'loading tesseract core') {
          resultDiv.textContent = `Loading Tesseract core: ${(m.progress * 100).toFixed(2)}%`;
        } else if (m.status === 'loading language traineddata') {
          resultDiv.textContent = `Loading language data: ${(m.progress * 100).toFixed(2)}%`;
        } else if (m.status === 'initializing api') {
          resultDiv.textContent = `Initializing API: ${(m.progress * 100).toFixed(2)}%`;
        } else if (m.status === 'recognizing text') {
          resultDiv.textContent = `Recognizing text: ${(m.progress * 100).toFixed(2)}%`;
        }
        progressBar.style.width = `${m.progress * 100}%`;
      }
    }
  ).then(({ data: { text } }) => {
    if (text && text.trim().length > 0) {
      resultDiv.innerHTML = '<h3>OCR Result:</h3><pre>' + text + '</pre>';
      copyToClipboard(text);
    } else {
      resultDiv.textContent = 'No text found in the image.';
    }
    progressBar.style.width = '100%';
  }).catch(error => {
    console.error('Error:', error);
    resultDiv.textContent = 'Error performing OCR: ' + error.message;
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Text copied to clipboard');
    const resultDiv = document.getElementById('ocrResult');
    resultDiv.innerHTML += '<p>OCR result copied to clipboard!</p>';
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}