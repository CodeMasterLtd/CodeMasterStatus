document.addEventListener("DOMContentLoaded", function() {
    const websites = [
        { id: 'website1', url: 'https://www.codemaster.ltd' },
        { id: 'website2', url: 'https://learntocodegame.netlify.app/' },
        { id: 'website3', url: 'https://codemasterchallenge.netlify.app/' },
        { id: 'website4', url: 'https://vehiclenamesgenerator.netlify.app/' },
        { id: 'website5', url: 'https://personalfinancetrack.netlify.app/' },
        { id: 'website6', url: 'https://numberplatecreator.netlify.app/' },
        { id: 'website7', url: 'https://vehiclefxmanifestgenerator.netlify.app/' }
    ];

    websites.forEach(website => {
        checkStatus(website.id, website.url);
        setInterval(() => checkStatus(website.id, website.url), 1000); // Check every 30 seconds
    });
});

function checkStatus(elementId, url) {
    const startTime = performance.now();

    fetch(url, { mode: 'no-cors' })
        .then(response => {
            const endTime = performance.now();
            const ping = Math.round(endTime - startTime);
            updateStatus(elementId, true, ping);
        })
        .catch(error => {
            const endTime = performance.now();
            const ping = Math.round(endTime - startTime);
            updateStatus(elementId, false, ping);
        });
}

function updateStatus(elementId, isUp, ping) {
    const statusIndicator = document.getElementById(`${elementId}-status`);
    const statusText = document.getElementById(`${elementId}-text`);
    const pingText = document.getElementById(`${elementId}-ping`);

    if (isUp) {
        statusIndicator.classList.add('status-up');
        statusIndicator.classList.remove('status-down');
        statusText.textContent = 'Up and Running';
        pingText.textContent = `${ping} ms`;
    } else {
        statusIndicator.classList.add('status-down');
        statusIndicator.classList.remove('status-up');
        statusText.textContent = 'Major Outage';
        pingText.textContent = '';
    }
}

