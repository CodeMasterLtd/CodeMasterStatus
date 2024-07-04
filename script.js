document.addEventListener("DOMContentLoaded", function() {

    const websites = [
        { id: 'ltcg', url: 'https://learntocodegame.netlify.app/' },
        { id: 'cmc', url: 'https://codemasterchallenge.netlify.app/' },
        { id: 'vng', url: 'https://vehiclenamesgenerator.netlify.app/' },
        { id: 'pft', url: 'https://personalfinancetrack.netlify.app/' },
        { id: 'npc', url: 'https://numberplatecreator.netlify.app/' },
        { id: 'fmlua', url: 'https://vehiclefxmanifestgenerator.netlify.app/' },
        { id: 'discord', url: 'https://discord.g/XcEHvPR9qA' },
    ];

    const overallStatusText = document.getElementById('overall-status-text');
    const lastUpdatedTime = document.getElementById('last-updatedTime');
    const dis = document.getElementById(`discord-message`);
    const dis1 = document.getElementById(`discord-status`);

    let allow = false;
    let message = true;

    function ManualErrors() {
        if (allow) {
            allow = true;

        dis1.classList.add('status-fixing');
        dis.style.color = '#ffc107';
        dis.textContent = 'Problem is Being Investigated';
        } else {
            allow = false;
        }
        if (!allow && message) {
            message = true;
            dis1.classList.add('status-fixing2');
            dis.style.color = '#ffc107';
            dis.textContent = 'We are Working On It';
        } else {
            message = false;
        }
        return allow, message;
    }

    // Function to get the current time in minutes
    function getCurrentMinutes() {
        return new Date().getMinutes();
    }

    // Function to update last updated time
    function updateLastUpdatedTime() {
        const lastUpdateMinutes = localStorage.getItem('lastUpdateTime');
        const currentMinutes = getCurrentMinutes();
        localStorage.setItem('lastUpdateTime', currentMinutes);
    
        const minutesAgo = currentMinutes - (lastUpdateMinutes || currentMinutes);
    
        if (minutesAgo <= 0) {
            lastUpdatedTime.textContent = 'Last updated: just now';
        } else {
            lastUpdatedTime.textContent = `Last updated: ${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
        }
    }
    

    // Function to continuously check status of each website
    function checkStatus(elementId, url) {
        return new Promise((resolve) => {
            const startTime = performance.now();

            fetch(url, { mode: 'no-cors' })
                .then(response => {
                    updateStatus(elementId, true);
                    resolve(true);
                })
                .catch(error => {
                    console.error(`Error checking status for ${url}:`, error);
                    updateStatus(elementId, false);
                    resolve(false);
                });
        });
    }

    // Function to update status on the page
    function updateStatus(elementId, isUp) {
        const statusIndicator = document.getElementById(`${elementId}-status`);
        const statusText = document.getElementById(`${elementId}-text`);
        const statusMessage = document.getElementById(`${elementId}-message`);

        if (isUp) {
            statusIndicator.classList.add('status-up');
            statusIndicator.classList.remove('status-down');
            statusText.textContent = 'Up and Running';
            statusMessage.textContent = ''; // Clear any previous messages
            statusMessage.style.backgroundColor = 'transparent'; // Reset background color
            statusMessage.style.padding = '0'; // Reset padding
            statusMessage.style.borderRadius = '0'; // Reset border radius
            statusMessage.style.fontWeight = 'normal'; // Reset font weight
        } else {
            statusIndicator.classList.add('status-down');
            statusIndicator.classList.remove('status-up');
            statusText.textContent = '';
            handleOutageMessages(elementId);
            ManualErrors();
        }
    }

    // Function to handle outage messages based on elapsed time
    function handleOutageMessages(elementId) {
        const statusMessage = document.getElementById(`${elementId}-message`);
        const outageStart = getCurrentMinutes();
        const statusIndicator = document.getElementById(`${elementId}-status`);
    
        // Define messages and corresponding times
        const outageMessages = [
            { time: 0, message: "Major Outage Detected", color: '#dc3545', class: 'status-down' }, // Red
            { time: 10, message: "Problem is Being Investigated", color: '#ffc107', class: 'status-fixing' }, // Orange
            { time: 20, message: "Problem Solved", color: '#28a745', class: 'status-up' } // Green
        ];
    
        // Function to update message based on elapsed time
        function updateMessage() {
            const minutesElapsed = getCurrentMinutes() - outageStart;
    
            // Find the message that matches the current elapsed time
            const messageObj = outageMessages.find(msg => minutesElapsed >= msg.time);
    
            // Display the appropriate message and update status indicator class
            if (messageObj) {
                statusMessage.textContent = messageObj.message;
                statusMessage.style.color = messageObj.color;
                statusMessage.style.backgroundColor = '#0000007e';
                statusMessage.style.padding = '5px';
                statusMessage.style.borderRadius = '50px';
                statusMessage.style.fontWeight = 'bold';
    
                // Update status indicator class
                statusIndicator.classList.remove('status-down', 'status-fixing', 'status-up');
                statusIndicator.classList.add(messageObj.class);
            }
        }
    
        // Initial update
        updateMessage();
        setInterval(ManualErrors, 1); // Check every 24 hours
    
        // Update message every minute
        const outageTimer = setInterval(updateMessage, 1000 * 60); // Check every minute
        statusMessage.dataset.intervalId = outageTimer.toString(); // Store interval ID in element data
    
        // Stop interval after the last message time
        const lastMessageTime = outageMessages[outageMessages.length - 1].time;
        const timeUntilClear = (lastMessageTime - (getCurrentMinutes() - outageStart)) * 1000 * 60;
        setTimeout(() => {
            clearInterval(outageTimer);
            statusMessage.textContent = ''; // Clear message after last message time
        }, timeUntilClear);
    }
    
    function setStatus(elementId, status) {
        updateStatus(elementId, status);
        if (status === 'down') {
            handleOutageMessages(elementId);
        }
    }
    

    // Initial check
    function initialCheck() {
        const statusPromises = websites.map(website => checkStatus(website.id, website.url));
        Promise.all(statusPromises).then(results => {
            results.forEach((isUp, index) => {
                if (!isUp) {
                    document.getElementById(websites[index].id).click();
                    localStorage.setItem('lastUpdateTime', getCurrentMinutes());
                    lastUpdatedTime.textContent = 'Last updated: just now';
                }
            });
        });
    }

    // Function to perform periodic checks
    function periodicCheck() {
        let allUp = true;
        let outageCount = 0;

        const statusPromises = websites.map(website => checkStatus(website.id, website.url));
        const statusElements = document.getElementsByClassName('status');
        const outageElements = [];

        Promise.all(statusPromises).then(results => {
            results.forEach((isUp, index) => {
                if (!isUp) {
                    allUp = false;
                    outageCount++;
                    document.getElementById(websites[index].id).click();
                }
            });

            // Update overall status message
            if (outageCount === 0) {
                overallStatusText.style.color = 'green';
                overallStatusText.textContent = 'All services up and running';
            } else {
                overallStatusText.style.color = '#dc3545';
                overallStatusText.style.textShadow = '0 0 5px black';
                overallStatusText.textContent = `Outage on ${outageCount} service${outageCount > 1 ? 's' : ''}`;
            } if (message === true && outageCount === 1) {
                overallStatusText.style.color = '#ffc107';
                overallStatusText.textContent = `Resolving issues on ${outageCount} service${outageCount > 1 ? 's' : ''}`;
            } else {
                overallStatusText.style.color = '#dc3545';
                overallStatusText.style.textShadow = '0 0 5px black';
                overallStatusText.textContent = `Outage on ${outageCount} service${outageCount > 1 ? 's' : ''}`;
            }
        });
    }

    // Perform initial check
    initialCheck();

    periodicCheck();
    
    // Update the last updated time on load
    updateLastUpdatedTime();

    // Update the last updated time every minute
    setInterval(updateLastUpdatedTime, 60 * 1000);

    // Perform periodic check every 30 seconds
    setInterval(periodicCheck, 30 * 1000);

    window.setStatus = setStatus;

    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
            const currentTheme = localStorage.getItem("theme");

            if (currentTheme == "dark" || (currentTheme === null && prefersDarkScheme.matches)) {
                document.body.classList.add("dark-mode");
            } else {
                document.body.classList.remove("dark-mode");
            }

            const themeSwitcher = document.getElementById("theme-switcher");
            themeSwitcher.addEventListener("click", function() {
                if (document.body.classList.contains("dark-mode")) {
                    document.body.classList.remove("dark-mode");
                    localStorage.setItem("theme", "light");
                } else {
                    document.body.classList.add("dark-mode");
                    localStorage.setItem("theme", "dark");
                }
            });
});
