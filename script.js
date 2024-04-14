let gameStarted = false;
let word = "";
let tries = 7;

const words = [
    "REVEALS", "MYSTERY", "JOURNEY", "KINDRED", "FLIGHT", "FANTASY", "PASSION", "VINTAGE", "HARMONY", "QUALITY",
    "FREEDOM", "CONTROL", "BALANCE", "CULTURE", "NETWORK", "NATURAL", "VENTURE", "DIGITAL", "CAPITAL", "MEASURE",
    "SILENCE", "STATION", "CURIOSA", "COMPASS", "ELEGANT", "HORIZON", "VISIBLE", "FREQUEN", "DYNAMIC", "JOURNAL",
    "POETIC", "ARTISAN", "ECONOMY", "INSIGHT", "MARKETS", "PATTERN", "VARIETY", "TRIBUTE", "OUTDOOR", "SERVICE",
    "SUPPORT", "PROJECT", "HEALTHY", "COMFORT", "COLOURS", "SUCCESS", "LEADERS", "WINDOWS", "JUSTICE", "CONNECT",
    "CENTURY", "PICTURE", "UNIVERS", "ORGANIC", "DEVELOP", "VERSION", "EXPLORE", "BELIEVE", "QUALITY", "SCIENCE",
    "PIONEER", "PHRASES", "HISTORY", "FANTASY", "REALITY", "ADVENTU", "CULTURE", "STORIES", "INSPIRE", "DETAILS",
    "TEXTURE", "THOUGHT", "SPHERES", "BALANCE", "SESSION", "JOURNEY", "FASHION", "SUCCESS", "SKYLINE", "FREEDOM",
    "REALITY", "CONTENT", "NETWORK", "PASSION", "CHANNEL", "STORIES", "FLAVOUR", "RHYTHMS", "ELEMENT", "DANCING",
    "CULTURE", "KINDRED", "PATTERN", "CONNECT", "BALANCE", "GALLERY", "EXPRESS", "WONDERS", "CURIOSA", "JOURNAL",
    "ILLUSIO", "DREAMER", "HORIZON", "VINTAGE", "CONTROL", "INSIGHT", "MYSTERY", "QUALITY", "PICTURE", "STATION",
    "VENTURE", "DIGITAL", "WINDOWS", "OUTDOOR", "ELEGANT", "VARIETY", "SERVICE", "NATURAL", "UNIVERS", "COMPASS",
    "LEADERS", "CAPITAL", "MEASURE", "SUCCESS", "VISIBLE", "QUALITY", "JOURNEY", "FREQUEN", "HARMONY", "FREEDOM"
];        
const symbols = "!@#$%^&*()-_=+[]{};:'\"<>,.?/";

window.addEventListener("message", function (event) {
    let data = event.data;
    switch (data.type) {
        case 'open':
            startGame();
            break;
        case 'close':
            break;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('answer');
    const listItems = document.querySelectorAll('.user-interface');

    document.addEventListener('keypress', function(event) {
        if (gameStarted === false && event.key === 'Enter') {
            randomizeWords();
            listItems.forEach((item) => {
                item.style.display = 'block';
            });
            gameStarted = true;

            // Enable the input field and set focus
            userInput.removeAttribute('tabindex');
            userInput.disabled = false;
            userInput.focus();
        }
    });
});

function randomizeWords() {
    const wordElements = Array.from(document.querySelectorAll('.word'));

    // Shuffle the wordElements and then slice to get 12 random elements
    const shuffledWordElements = wordElements.sort(() => 0.5 - Math.random()).slice(0, 12);

    wordElements.forEach(element => {
        let randomString = "";

        for (let i = 0; i < 16; i++) {
            randomString += symbols.charAt(Math.floor(Math.random() * symbols.length));
        }

        if (shuffledWordElements.includes(element)) {
            let randomWord = words[Math.floor(Math.random() * words.length)];
            let randomPosition = Math.floor(Math.random() * (16 - randomWord.length));
            randomString = randomString.substring(0, randomPosition) + randomWord + randomString.substring(randomPosition + randomWord.length);
        }

        element.textContent = randomString;
    });

    // Select a random word from the shuffled elements
    if (shuffledWordElements.length > 0) {
        let randomElement = shuffledWordElements[Math.floor(Math.random() * shuffledWordElements.length)];
        word = randomElement.textContent;

        // Extract only the uppercase word from the string
        const match = word.match(/[A-Z]+/);
        word = match ? match[0] : "";
    }
    console.log(word);
}

function processGuess() {
    const userInput = document.getElementById('answer');
    const userGuess = userInput.value.toUpperCase();
    let correctCount = 0;

    let targetWordCopy = word; // Create a mutable copy of the target word

    for (let i = 0; i < userGuess.length; i++) {
        if (targetWordCopy.includes(userGuess[i])) {
            correctCount++;
            targetWordCopy = targetWordCopy.replace(userGuess[i], ''); // Remove the matched letter to handle duplicates
        }
    }

    const ul = document.querySelector('.terminal');
    
    if (userGuess !== word && tries > 1) {
        let message1 = `Access Denied (${correctCount}/${word.length} correct)`;
        let message2 = `${tries - 1} tries remaining`;
        ul.innerHTML += `<li class="gray reset">${message1}</li>`;
        ul.innerHTML += `<li class="gray reset">${message2}</li>`;
    }

    ul.scrollTop = ul.scrollHeight;

    tries--;

    if (tries <= 0 || userGuess === word) {
        const grantedMessage = document.createElement("li");
        grantedMessage.className = userGuess === word ? "green reset" : "red reset";
        grantedMessage.textContent = userGuess === word ? "Access Granted!" : "Access Denied!";
        ul.appendChild(grantedMessage);
    
        userInput.disabled = true;
        document.getElementById('sent').disabled = true;
        userInput.removeEventListener('keypress', handleEnterKeyPress);
    
        if (userGuess === word) {
            setTimeout(() => {
                initiateHackingSequence(ul, grantedMessage);
            }, 1000);
        } else {
            setTimeout(() => {
                const unusualAttemptsMessage = document.createElement("li");
                unusualAttemptsMessage.className = "red reset";
                unusualAttemptsMessage.textContent = "UNUSUAL ATTEMPTS DETECTED!!";
                ul.appendChild(unusualAttemptsMessage);
                ul.scrollTop = ul.scrollHeight;
    
                setTimeout(() => {
                    const quittingMessage = document.createElement("li");
                    quittingMessage.className = "red reset";
                    ul.appendChild(quittingMessage);
    
                    let dotCount = 0;
                    const dotInterval = setInterval(() => {
                        if (dotCount <= 6) {
                            const dots = ".".repeat(dotCount % 4);
                            quittingMessage.textContent = `SYSTEM SHUTTING DOWN${dots}`;
                            ul.scrollTop = ul.scrollHeight;
                            dotCount++;
                        } else {
                            clearInterval(dotInterval);
                        }
                    }, 333); // Animate dots
                }, 500); // Wait 2 seconds before showing QUITTING...
            }, 500); // Wait 1 second before showing UNUSUAL ATTEMPTS...
            setTimeout(() => {
                $.post('http://cure-hacking-terminal/callback', JSON.stringify({ 'success': false }));
                finishGame()
            },3500)
        }
    }    

    userInput.value = '';
    ul.scrollTop = ul.scrollHeight;
}

function initiateHackingSequence(ul, grantedMessage) {
    let progress = 0;
    grantedMessage.textContent = `Hacking... ${progress}%`;

    // Append "DO NOT CLOSE THE TERMINAL!" immediately
    const doNotCloseMessage = document.createElement("li");
    doNotCloseMessage.className = "red reset";
    doNotCloseMessage.textContent = "DO NOT CLOSE THE TERMINAL!";
    ul.appendChild(doNotCloseMessage);
    ul.scrollTop = ul.scrollHeight;

    // Start random progress incrementation
    const updateProgress = () => {
        if (progress < 100) {
            const increment = Math.floor(Math.random() * 5) + 1; // Random increment between 1% and 5%
            progress += increment;
            if (progress > 100) progress = 100;

            grantedMessage.textContent = `Hacking... ${progress}%`;
            ul.scrollTop = ul.scrollHeight;

            setTimeout(updateProgress, Math.random() * (500 - 100) + 100);
        } else {
            ul.innerHTML += `<li class="green reset">HACK SUCCESSFUL!</li>`;
            ul.scrollTop = ul.scrollHeight;
            setTimeout(() => {
                $.post('http://cure-hacking-terminal/callback', JSON.stringify({ 'success': true }));
                finishGame()
            },1500)
        }
    };

    updateProgress(); // Start the hacking progress updates
}


function calculateProtectionTier() {
    if (tries >= 5) {
        return "High";
    } else if (tries >= 3) {
        return "Medium";
    } else {
        return "Low";
    }
}

function handleEnterKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action
        processGuess();
    }
}

function startGame(){
    document.body.style.display = "block";
}

function finishGame(){
    location. reload()
}

// Event listener for the button click
document.getElementById('sent').addEventListener('click', processGuess);
// $("#sent").click(function(){
//     processGuess()
// })

// $("#answer").keypress(function(event){
//     if (event.key === 'Enter') {
//         processGuess();
//     }
// })

// Event listener for the Enter key in the input field
document.getElementById('answer').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        processGuess();
    }
});

startGame()