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

    const overallStatusIndicator = document.getElementById('overall-status-indicator');
    const overallStatusText = document.getElementById('overall-status-text');
    const lastUpdatedTime = document.getElementById('last-updatedTime');

    // Initialize startTime
    let startTime = new Date();

    // Function to update last updated time
    function updateLastUpdatedTime() {
        const now = new Date();
        const minutesAgo = Math.round((now - startTime) / (1000 * 60));
        if (minutesAgo === 0) {
            lastUpdatedTime.textContent = 'Last updated: just now';
        } else {
            lastUpdatedTime.textContent = `Last updated: ${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;
        }
    }

    // Check status of each website and update every 30 seconds
    setInterval(() => {
        let allUp = true;
        let outageCount = 0;

        websites.forEach(website => {
            checkStatus(website.id, website.url, (isUp) => {
                if (!isUp) {
                    allUp = false;
                    outageCount++;
                }
            });
        });

        // Update overall status message
        if (outageCount === 0) {
            overallStatusIndicator.classList.add('status-up');
            overallStatusIndicator.classList.remove('status-down');
            overallStatusText.style.fontWeight = 'bold';
            overallStatusText.style.color = 'green';
            overallStatusText.textContent = 'All services up and running';
        } else {
            overallStatusIndicator.classList.add('status-down');
            overallStatusIndicator.classList.remove('status-up');
            overallStatusText.style.fontWeight = 'bold';
            overallStatusText.style.color = 'red';
            overallStatusText.textContent = `Outage on some services (${outageCount} service${outageCount > 1 ? 's' : ''})`;
        }

        // Update last updated time
        updateLastUpdatedTime();
    }, 1000); // Check every second

    // Function to continuously check status of each website
    function checkStatus(elementId, url, callback) {
        const startTime = performance.now();

        fetch(url, { mode: 'no-cors' })
            .then(response => {
                const endTime = performance.now();
                const ping = Math.round(endTime - startTime);
                updateStatus(elementId, true, ping);
                if (callback) callback(true);
            })
            .catch(error => {
                const endTime = performance.now();
                const ping = Math.round(endTime - startTime);
                updateStatus(elementId, false, ping);
                if (callback) callback(false);
            });
    }

    // Function to update status on the page
    function updateStatus(elementId, isUp, ping) {
        const statusIndicator = document.getElementById(`${elementId}-status`);
        const statusText = document.getElementById(`${elementId}-text`);
        const pingText = document.getElementById(`${elementId}-ping`);

        if (isUp) {
            statusIndicator.classList.add('status-up');
            statusIndicator.classList.remove('status-down');
            statusText.textContent = 'Up and Running';
            pingText.style.fontWeight = 'bold';
            pingText.style.color = 'green';
            pingText.textContent = `${ping} ms`;
        } else {
            statusIndicator.classList.add('status-down');
            statusIndicator.classList.remove('status-up');
            statusText.textContent = 'Major Outage';
            pingText.textContent = '';
        }

        // Update last updated time whenever status changes
        updateLastUpdatedTime();
    }
});
