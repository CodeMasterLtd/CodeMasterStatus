
document.addEventListener("DOMContentLoaded", function() {
    const websites = [
        { id: 'ltcg', url: 'https://learntocodegame.netlify.app/' },
        { id: 'todo', url: 'https://mastertodolist.netlify.app/' },
        { id: 'cmc', url: 'https://codemasterchallenge.netlify.app/' },
        { id: 'vng', url: 'https://vehiclenamesgenerator.netlify.app/' },
        { id: 'pft', url: 'https://personalfinancetrack.netlify.app/' },
        { id: 'npc', url: 'https://numberplatecreator.netlify.app/' },
        { id: 'fmlua', url: 'https://vehiclefxmanifestgenerator.netlify.app/' },
        { id: 'discord', url: 'https://discord.gg/XcEHvPR9qA' }
]

    const overallStatusText = document.getElementById('overall-status-text');
    const lastUpdatedTime = document.getElementById('last-updatedTime');
    const id = 'todo'
    const dis = document.getElementById(`${id}-message`);
    const dis1 = document.getElementById(`${id}-status`);

    let inves = false;
    let working = false;
    let delay = false;

    function ManualErrors() {
        if (inves) {
            inves = true;

        dis1.classList.add('status-fixing');
        dis.style.color = '#ffc107';
        dis.textContent = 'We are Investigating';
        } else {
            inves = false;
        }
        if (!inves && working) {
            working = true;
            dis1.classList.add('status-fixing2');
            dis.style.color = '#ffc107';
            dis.textContent = 'We are Working On It';
        } else {
            working = false;
        }
        if (!inves && !working && delay) {
            delay = true;
            dis1.classList.add('status-fixing2');
            dis.style.color = '#ffc107';
            dis.innerHTML = `Fix Delayed <span style="color: darkgray;">EST: 24 hours</span>`;
        } else {
            delay = false;
        }
        return inves, working, delay;
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
            { time: 10, message: "We are Investigating", color: '#ffc107', class: 'status-fixing' }, // Orange
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
// Function to perform periodic checks
function periodicCheck() {
    let allUp = true;
    let outageCount = 0;

    const statusPromises = websites.map(website => checkStatus(website.id, website.url));
    const statusElements = document.getElementsByClassName('status1');

    Promise.all(statusPromises).then(results => {
        results.forEach((isUp, index) => {
            if (!isUp) {
                allUp = false;
                outageCount++;
                document.getElementById(websites[index].id).click();
            }
        });

        // Update overall status message and apply flashing border
        for (let element of statusElements) {
            element.classList.remove('flash-border-green', 'flash-border-yellow', 'flash-border-red'); // Remove any previous flash classes

            if (outageCount === 0) {
                overallStatusText.style.color = 'green';
                overallStatusText.textContent = 'All services up and running';
                element.style.borderColor = 'green';
            } else {
                if (delay === true && outageCount === 1 || working === true && outageCount === 1) {
                    overallStatusText.style.color = '#ffc107';
                    overallStatusText.textContent = `Resolving issues on ${outageCount} service${outageCount > 1 ? 's' : ''}`;
                    element.style.borderColor = '#ffc107';
                    element.classList.add('flash-border-yellow'); // Add yellow flash class
                } else {
                    overallStatusText.style.color = '#dc3545';
                    overallStatusText.style.textShadow = '0 0 5px black';
                    overallStatusText.textContent = `Outage on ${outageCount} service${outageCount > 1 ? 's' : ''}`;
                    element.style.borderColor = '#dc3545';
                    element.classList.add('flash-border-red'); // Add red flash class
                }
            }
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
                document.getElementById("theme-switcher").textContent = "☀️";
            } else {
                document.body.classList.remove("dark-mode");
                document.getElementById("theme-switcher").textContent = "🌕";
            }

            const themeSwitcher = document.getElementById("theme-switcher");
            themeSwitcher.addEventListener("click", function() {
                if (document.body.classList.contains("dark-mode")) {
                    document.body.classList.remove("dark-mode");
                    localStorage.setItem("theme", "light");
                    document.getElementById("theme-switcher").textContent = "🌕";
                } else {
                    document.body.classList.add("dark-mode");
                    document.getElementById("theme-switcher").textContent = "☀️";
                    localStorage.setItem("theme", "dark");
                }
            });
});

VaniliaTilt.init(document.querySelectorAll(".container"), {
    max: 25,
    speed: 400,
    glare: true,
    reverse: true,
    "max-glare": 0.5,
});