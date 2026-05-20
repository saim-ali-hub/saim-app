/* =========================
   GLOBAL STATE (ONLY ONCE)
========================= */

window.AppState = window.AppState || {
    currentData: null,
    quizState: { answers: {}, done: {} },
    labState: { status: {} }
};


/* =========================
   SECTION LOADER
========================= */

function loadSection(type) {

    if (type === "quiz") loadQuizSection();
    if (type === "lab" && typeof window.loadLabSection === "function") {
    window.loadLabSection();
    } else {
    console.error("loadLabSection not available. script_lab.js not loaded.");
    }
    if (type === "test") loadTestSection();
    if (type === "project") loadProjectSection();
}

window.loadSection = loadSection;


/* =========================
   MASTER OPEN ITEM ROUTER
   (ONLY ONE IN ENTIRE PROJECT)
========================= */

function openItem(section, file) {

    fetch(`get_item.php?section=${section}&file=${file}`)
        .then(res => res.json())
        .then(data => {

            console.log("LOADED:", section, file);

            if (section === "lab") {
    		AppState.currentLabData = data;
	    }

	    if (section === "quiz") {
    		AppState.currentQuizData = data;
	    }

	    if (section === "test") {
    		AppState.currentTestData = data;
	    }

	    if (section === "project") {
    		AppState.currentProjectData = data;
	    } 

	    if (section === "quiz") {

    		AppState.currentQuizFile = file;
                
		// init quiz state safely
                AppState.quizStateMap = AppState.quizStateMap || {};

    		if (!AppState.quizStateMap[file]) {
        	   AppState.quizStateMap[file] = {
            		answers: {},
            		done: {}
        	    };
    		}

    		setTimeout(() => renderQuestions(), 0);
	    }

            if (section === "lab") {

    		AppState.currentLabFile = file;

   		AppState.labStateMap = AppState.labStateMap || {};

    		if (!AppState.labStateMap[file]) {
        	    AppState.labStateMap[file] = {
           	 	data: data,
            		status: {}
        	    };
    		} else {
        	    AppState.labStateMap[file].data = data;
    		}

    		AppState.currentLabState = AppState.labStateMap[file];

    		document.querySelector(".welcome-title").style.display = "none";
    		document.querySelector(".work-area").style.display = "flex";

    		setTimeout(() => renderLabQuestions(), 0);
	     }


            if (section === "test") {

	       AppState.currentTestFile = file;

                AppState.testState = AppState.testState || { status: {} };

                setTimeout(() => renderTestQuestions(), 0);
            }


            if (section === "project") {

                AppState.currentProjectFile = file;

                AppState.projectState = AppState.projectState || { status: {} };

                setTimeout(() => renderProjectQuestions(), 0);
            }

        })
        .catch(err => {
            console.error("openItem error:", err);
        });
}

window.openItem = openItem;

/* ==================================
   TERMINAL LOADS INSIDE RIGHT PANEL
================================== */

function loadTerminalInsidePanel() {

    const username = localStorage.getItem("lab_user");

    if (!username) {
        return;
    }

    // hide welcome screen
    document.querySelector(".welcome-title").style.display = "none";

    // show work area
    document.querySelector(".work-area").style.display = "flex";

    // optional
    document.getElementById("contentArea").innerHTML = `
        <button onclick="toggleQuestions()" id="toggleBtn">
            HIDE QUESTIONS
        </button>
    `;

    // create terminal
    createTerminal(username);
}

/* ==================================
   ADD TERMINAL FUNCTION
================================== */
function createTerminal(username) {

    // prevent duplicate terminal
    if (window.termLoaded) {
        return;
    }

    window.termLoaded = true;

    const terminalDiv = document.getElementById("terminal");

    terminalDiv.innerHTML = "";
    
    const watermark = document.createElement("div");

    watermark.innerText = "Saim";

    watermark.style.position = "absolute";
    watermark.style.bottom = "20px";
    watermark.style.right = "25px";
    watermark.style.fontSize = "35px";
    watermark.style.fontWeight = "800";
    watermark.style.fontFamily = "monospace";
    watermark.style.color = "rgba(0,255,120,0.75)";
    watermark.style.textShadow = "0 0 15px rgba(0,255,120,1)";
    watermark.style.letterSpacing = "4px";
    watermark.style.zIndex = "999";
    watermark.style.pointerEvents = "none";
    watermark.style.letterSpacing = "3px";

    terminalDiv.style.position = "relative";

    terminalDiv.appendChild(watermark);

    const term = new Terminal({
        cursorBlink: true,
        scrollback: 10000,
        convertEol: true,
        fontSize: 18,
	lineHeight: 1.3,
        theme: {
            background: "#000000"
        }
    });

    const fitAddon = new FitAddon.FitAddon();

    term.loadAddon(fitAddon);

    term.open(terminalDiv);

    setTimeout(() => {
    fitAddon.fit();
    }, 100);

    const ws = new WebSocket(
        `ws://192.168.100.78:8000/ws/${username}`
    );

    ws.onopen = () => {

        fitAddon.fit();

        ws.send(JSON.stringify({
            type: "resize",
            cols: term.cols,
            rows: term.rows
        }));

        term.write(
            `\r\nConnected as ${username}\r\n\r\n`
        );
    };

    ws.onmessage = (event) => {

        if (event.data) {
            term.write(event.data);
        }
    };

    term.onData((data) => {

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    });

    window.addEventListener("resize", () => {

        fitAddon.fit();

        if (ws.readyState === WebSocket.OPEN) {

            ws.send(JSON.stringify({
                type: "resize",
                cols: term.cols,
                rows: term.rows
            }));
        }
    });
}

/* ==================================
   ADD LOAD TERMINAL AFTER LOGIN
================================== */
window.onload = function(){

    loadTerminalInsidePanel();

};
