        // User Account Data
        let accountState = {
            pin: "1234",
            balance: 154.50
        };

        // Current Step Tracker
        let flowState = { 
            activeStep: null, 
            tempData: {} 
        };

        const codeInput = document.getElementById('ussd-code-input');

        function quickType(code) {
            codeInput.value = code;
        }

        function updateBalanceDisplay() {
            document.getElementById('info-balance-display').innerText = `$${accountState.balance.toFixed(2)}`;
        }

        // Show USSD Modal Overlay
        function showUSSDModal(title, message, inputNeeded = true, inputType = "text", placeholder = "") {
            document.getElementById('ussd-header-title').innerText = title;
            document.getElementById('ussd-prompt-text').innerText = message;
            const inputContainer = document.getElementById('ussd-input-container');
            const userInput = document.getElementById('ussd-user-input');
            
            userInput.value = "";
            userInput.type = inputType;
            userInput.placeholder = placeholder;

            if (inputNeeded) {
                inputContainer.classList.remove('hidden');
                setTimeout(() => userInput.focus(), 100);
            } else {
                inputContainer.classList.add('hidden');
            }

            document.getElementById('ussd-overlay').classList.remove('hidden');
        }

        function closeUSSD() {
            document.getElementById('ussd-overlay').classList.add('hidden');
            flowState = { activeStep: null, tempData: {} };
        }

        // Keypress Listener (Enter to Submit)
        window.addEventListener('keydown', (e) => {
            const overlayVisible = !document.getElementById('ussd-overlay').classList.contains('hidden');
            if (overlayVisible && e.key === 'Enter') {
                e.preventDefault();
                submitUSSDResponse();
            } else if (!overlayVisible && e.key === 'Enter') {
                executeUSSD();
            }
        });

        // Start USSD Call
        function executeUSSD() {
            const code = codeInput.value.trim();
            if (!code) return;

            if (code === "*711#") {
                flowState.activeStep = "711_PIN";
                showUSSDModal("EVC Plus - Haraaga", "Fadlan geli PIN-kaaga (4 number):", true, "password", "xxxx");
            } else if (code === "*770#") {
                flowState.activeStep = "770_PIN";
                showUSSDModal("EVC Plus - Main Menu", "EVCPlus\nFadlan geli PIN-kaaga:", true, "password", "xxxx");
            } else {
                showUSSDModal("USSD Error", `Koodhka (${code}) ma aha mid sax ah.\nIsku day *711# ama *770#.`, false);
            }
        }

        // Handle Step-by-Step EVC Plus Flow
        function submitUSSDResponse() {
            const input = document.getElementById('ussd-user-input').value.trim();

            switch (flowState.activeStep) {
                
                // STEP 1: *711# PIN Check
                case "711_PIN":
                    if (input === accountState.pin) {
                        showUSSDModal("EVC Plus", `[-EVCPlus-]\nHaraagagaagu waa: $${accountState.balance.toFixed(2)}.\nMahadsanid.`, false);
                        flowState.activeStep = null;
                    } else {
                        showUSSDModal("EVC Plus", "PIN-ka aad gelisay waa qaldan yahay.", false);
                    }
                    break;

                // STEP 2: *770# PIN Check
                case "770_PIN":
                    if (input === accountState.pin) {
                        flowState.activeStep = "770_MENU";
                        showUSSDModal("EVC Plus", "EVCPlus\n1. Haraaga\n2. Kaarka Hadalka\n3. Bixi Biil\n4. U dir lacag\n5. Warbixin Kooban\n6. Maaraynta", true, "text", "Geli nambarka (1-6)");
                    } else {
                        showUSSDModal("EVC Plus", "PIN-ka aad gelisay waa qaldan yahay.", false);
                    }
                    break;

                // Menu Selection
                case "770_MENU":
                    if (input === "1") {
                        showUSSDModal("EVC Plus", `[-EVCPlus-]\nHaraagagaagu waa: $${accountState.balance.toFixed(2)}.`, false);
                    } else if (input === "4") {
                        flowState.activeStep = "SEND_MONEY_NUM";
                        showUSSDModal("EVC Plus - U Dir Lacag", "Fadlan geli mobile-ka:", true, "tel", "61xxxxxxx");
                    } else {
                        showUSSDModal("EVC Plus", "Doorashadan dhowaan ayaa la soo kordhin doonaa.", false);
                    }
                    break;

                // Send Money - Phone Number
                case "SEND_MONEY_NUM":
                    if (input.length >= 7 && !isNaN(input)) {
                        flowState.tempData.recipient = input;
                        flowState.activeStep = "SEND_MONEY_AMT";
                        showUSSDModal("EVC Plus - U Dir Lacag", "Fadlan geli lacagta ($):", true, "number", "0.00");
                    } else {
                        showUSSDModal("EVC Plus", "Lambar qaldan! Fadlan geli lambarka moobaylka ee saxda ah.", false);
                    }
                    break;

                // Send Money - Amount
                case "SEND_MONEY_AMT":
                    const amt = parseFloat(input);
                    if (!isNaN(amt) && amt > 0) {
                        if (amt <= accountState.balance) {
                            flowState.tempData.amount = amt;
                            flowState.activeStep = "SEND_MONEY_CONFIRM";
                            showUSSDModal("EVC Plus - Xaqiijin", `Ma hubtaa inaad $${amt.toFixed(2)} u dirtid ${flowState.tempData.recipient}?\n1. Haa\n2. Maya`, true, "number", "1 ama 2");
                        } else {
                            showUSSDModal("EVC Plus", `Haraagaga kuguma filna!\nHaraagaaga waa: $${accountState.balance.toFixed(2)}`, false);
                        }
                    } else {
                        showUSSDModal("EVC Plus", "Fadlan geli qadar lacageed oo sax ah.", false);
                    }
                    break;
                // Send Money - Confirmation
                case "SEND_MONEY_CONFIRM":
                    if (input === "1") {
                        accountState.balance -= flowState.tempData.amount;
                        updateBalanceDisplay();
                        showUSSDModal("EVC Plus", `[-EVCPlus-]\n$${flowState.tempData.amount.toFixed(2)} ayaad u dirtay ${flowState.tempData.recipient}.\nHaraagaaga cusub waa: $${accountState.balance.toFixed(2)}.`, false);
                    } else {
                        closeUSSD();
                    }
                    break;

                default:
                    closeUSSD();
                    break;
            }
        }









        // 10-ka Su'aalood ee Quiz-ka
        const questions = [
            {
                question: "1. Waa maxay caasimada dalka Soomaaliya?",
                answers: [
                    { text: "Hargeysa", correct: false },
                    { text: "Muqdisho", correct: true },
                    { text: "Kismaayo", correct: false },
                    { text: "Garowe", correct: false }
                ]
            },
            {
                question: "2. Waa maxay luqada ugu weyn ee loo isticmaalo web development-ka dhanka client-side?",
                answers: [
                    { text: "Python", correct: false },
                    { text: "Java", correct: false },
                    { text: "JavaScript", correct: true },
                    { text: "C++", correct: false }
                ]
            },
            {
                question: "3. Waa maxay gaabinta HTML?",
                answers: [
                    { text: "HyperText Markup Language", correct: true },
                    { text: "HighTech Modern Language", correct: false },
                    { text: "HyperTransfer Machine Language", correct: false },
                    { text: "Home Tool Markup Language", correct: false }
                ]
            },
            {
                question: "4. Badda ee ku taal Bariga Soomaaliya waa maxay?",
                answers: [
                    { text: "Badda Cas", correct: false },
                    { text: "Baxar Cadiim", correct: false },
                    { text: "Badweynta Hindiya", correct: true },
                    { text: "Badda Madow", correct: false }
                ]
            },
            {
                question: "5. CSS waxaa loo isticmaalaa maxay web-ka dhexdiisa?",
                answers: [
                    { text: "In lagu kaydiyo Data-da", correct: false },
                    { text: "In lagu bilcleeyo laguna qaabeeyo (Style)", correct: true },
                    { text: "In lagu dhiso Server-ka", correct: false },
                    { text: "In lagu sameeyo kalkuleetar", correct: false }
                ]
            },
            {
                question: "6. Waa maxay web browser-ka ugu isticmaalka badan dunida?",
                answers: [
                    { text: "Mozilla Firefox", correct: false },
                    { text: "Safari", correct: false },
                    { text: "Google Chrome", correct: true },
                    { text: "Microsoft Edge", correct: false }
                ]
            },
            {
                question: "7. Waa maxay wabiga ugu dheer dalka Soomaaliya?",
                answers: [
                    { text: "Wabiga Shabelle", correct: true },
                    { text: "Wabiga Juba", correct: false },
                    { text: "Wabiga Niil", correct: false },
                    { text: "Wabiga Tana", correct: false }
                ]
            },
            {
                question: "8. Waa maxay gaabinta CSS?",
                answers: [
                    { text: "Creative Style Sheets", correct: false },
                    { text: "Cascading Style Sheets", correct: true },
                    { text: "Computer Style System", correct: false },
                    { text: "Colorful Style Sheets", correct: false }
                ]
            },
            {
                question: "9. Waa maxay meeraha ugu dhow Qorraxda?",
                answers: [
                    { text: "Dusaa (Mercury)", correct: true },
                    { text: "Zuhra (Venus)", correct: false },
                    { text: "Dheehan (Mars)", correct: false },
                    { text: "Dhulka (Earth)", correct: false }
                ]
            },
            {
                question: "10. Waa maxay calaamadda loo isticmaalo ID-yada (IDs) CSS-ka dhexdiisa?",
                answers: [
                    { text: "Barta (.)", correct: false },
                    { text: "Astaanta Hash (#)", correct: true },
                    { text: "Astaanta At (@)", correct: false },
                    { text: "Astaanta Dollar ($)", correct: false }
                ]
            }
        ];

        // Variables maamula Stat-ka
        let currentQuestionIndex = 0;
        let score = 0;

        const questionText = document.getElementById("question-text");
        const answersContainer = document.getElementById("answers-container");
        const nextBtn = document.getElementById("next-btn");
        const questionTracker = document.getElementById("question-tracker");
        const scoreLive = document.getElementById("score-live");
        const progressBar = document.getElementById("progress-bar");

        const quizHeader = document.getElementById("quiz-header");
        const quizBody = document.getElementById("quiz-body");
        const resultScreen = document.getElementById("result-screen");

        // Bilaabida Quiz-ka
        function startQuiz() {
            currentQuestionIndex = 0;
            score = 0;
            quizHeader.classList.remove("hidden");
            quizBody.classList.remove("hidden");
            resultScreen.classList.add("hidden");
            showQuestion();
        }

        // Soo bandhigida Su'aasha Hadda
        function showQuestion() {
            resetState();
            let currentQuestion = questions[currentQuestionIndex];
            
            // Cusbooneysii Text-ga iyo Progress Bar-ka
            questionText.innerText = currentQuestion.question;
            questionTracker.innerText = `Su'aasha ${currentQuestionIndex + 1} ee ${questions.length}`;
            scoreLive.innerText = `Puntos: ${score}`;
            progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;

            // Soo saar Jawaabaha
            currentQuestion.answers.forEach(answer => {
                const button = document.createElement("button");
                button.innerText = answer.text;
                button.className = "w-full text-left p-4 rounded-xl border-2 border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 font-medium text-slate-700 transition duration-150 flex justify-between items-center";
                
                if (answer.correct) {
                    button.dataset.correct = "true";
                }
                
                button.addEventListener("click", selectAnswer);
                answersContainer.appendChild(button);
            });
        }

        // Reset-gareynta
        function resetState() {
            nextBtn.disabled = true;
            answersContainer.innerHTML = "";
        }

        // Marka la taabto Jawaab
        function selectAnswer(e) {
            const selectedBtn = e.target;
            const isCorrect = selectedBtn.dataset.correct === "true";

            if (isCorrect) {
                selectedBtn.classList.remove("bg-slate-50", "border-slate-100", "hover:bg-slate-100");
                selectedBtn.classList.add("bg-emerald-50", "border-emerald-500", "text-emerald-800", "font-bold");
                selectedBtn.innerHTML += ' <i class="fa-solid fa-circle-check text-emerald-500 text-lg"></i>';
                score++;
            } else {
                selectedBtn.classList.remove("bg-slate-50", "border-slate-100", "hover:bg-slate-100");
                selectedBtn.classList.add("bg-rose-50", "border-rose-500", "text-rose-800", "font-bold");
                selectedBtn.innerHTML += ' <i class="fa-solid fa-circle-xmark text-rose-500 text-lg"></i>';
            }

            // Muuji Jawaabta Saxda ah hadii tii qaldanayd la doortay
            Array.from(answersContainer.children).forEach(button => {
                if (button.dataset.correct === "true" && !isCorrect) {
                    button.classList.remove("bg-slate-50", "border-slate-100");
                    button.classList.add("bg-emerald-50", "border-emerald-400", "text-emerald-800");
                    button.innerHTML += ' <i class="fa-solid fa-circle-check text-emerald-500 text-lg"></i>';
                }
                button.disabled = true; // Dhammaan batannada kale xidh
            });

            scoreLive.innerText = `Puntos: ${score}`;
            nextBtn.disabled = false;
        }

        // Tallaabada Xigta
        function nextQuestion() {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                showQuestion();
            } else {
                showResult();
            }
        }

        // Soo bandhigida Natiijada Ugu Dambaysa
        function showResult() {
            quizHeader.classList.add("hidden");
            quizBody.classList.add("hidden");
            resultScreen.classList.remove("hidden");

            document.getElementById("final-score").innerText = `${score}/${questions.length}`;
            const percentage = Math.round((score / questions.length) * 100);
            document.getElementById("final-percentage").innerText = `${percentage}%`;
        }

        // Dib u bilaabid
        function restartQuiz() {
            startQuiz();
        }

        // Bilaabida marka safxada la furo
        startQuiz();









        // DOM Elements
        const timeDisplay = document.getElementById('time-display');
        const modeDisplay = document.getElementById('mode-display');
        const progressCircle = document.getElementById('progress');
        const startIcon = document.getElementById('start-icon');
        const startText = document.getElementById('start-text');

        // State Variables
        let isRunning = false;
        let isFocusMode = true;
        let timer = null;
        let focusSeconds = 0.5 * 60; // 25 daqiiqad
        let breakSeconds = 5 * 60;  // 5 daqiiqad nasasho ah
        let totalSeconds = focusSeconds;
        let remainingSeconds = focusSeconds;
        let audioCtx = null;

        const CIRCUMFERENCE = 2 * Math.PI * 130; // 816.8

        function getAudioContext() {
            if (!audioCtx) {
                const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
                if (AudioCtxClass) {
                    audioCtx = new AudioCtxClass();
                }
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            return audioCtx;
        }

        // Dhawaaqa marka waqtigu dhammaado (soconaya 5 ilbiriqsi)
        function playAlarmSound() {
            try {
                const ctx = getAudioContext();
                if (!ctx) return;
                const totalDuration = 5000;
                const intervalTime = 500;
                let elapsed = 0;

                function playTone() {
                    const now = ctx.currentTime;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, now);
                    gain.gain.setValueAtTime(0.5, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.25);
                }

                playTone();
                const soundInterval = setInterval(() => {
                    elapsed += intervalTime;
                    if (elapsed >= totalDuration) {
                        clearInterval(soundInterval);
                    } else {
                        playTone();
                    }
                }, intervalTime);
            } catch (e) {
                console.log("Audio error:", e);
            }
        }

        function toggleTimer() {
            getAudioContext();
            if (isRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        }

        function startTimer() {
            isRunning = true;
            startIcon.className = 'fa-solid fa-pause';
            startText.innerText = 'Jooji';

            timer = setInterval(() => {
                if (remainingSeconds > 0) {
                    remainingSeconds--;
                    render();
                } else {
                    clearInterval(timer);
                    isRunning = false;
                    startIcon.className = 'fa-solid fa-play';
                    startText.innerText = 'Bilow';
                    playAlarmSound();
                    skipMode();
                }
            }, 1000);
        }

        function pauseTimer() {
            isRunning = false;
            clearInterval(timer);
            startIcon.className = 'fa-solid fa-play';
            startText.innerText = 'Bilow';
        }

        function resetTimer() {
            pauseTimer();
            remainingSeconds = totalSeconds;
            render();
        }

        function skipMode() {
            pauseTimer();
            isFocusMode = !isFocusMode;
            if (isFocusMode) {
                modeDisplay.innerText = "Focus";
                totalSeconds = focusSeconds;
            } else {
                modeDisplay.innerText = "Nasasho gaaban";
                totalSeconds = breakSeconds;
            }
            remainingSeconds = totalSeconds;
            render();
        }

        function render() {
            const mins = Math.floor(remainingSeconds / 60);
            const secs = remainingSeconds % 60;

            const formattedMins = String(mins).padStart(2, '0');
            const formattedSecs = String(secs).padStart(2, '0');

            timeDisplay.innerText = `${formattedMins}:${formattedSecs}`;

            const progressRatio = totalSeconds > 0 ? (remainingSeconds / totalSeconds) : 0;
            const offset = CIRCUMFERENCE * (1 - progressRatio);
            progressCircle.style.strokeDashoffset = offset;
        }

        // Initial render
        render();