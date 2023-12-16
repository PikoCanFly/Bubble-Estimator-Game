let circlesDrawn = 0;
let audioContext;

try {
	audioContext = new (window.AudioContext || window.webkitAudioContext)();
} catch (error) {
	console.error("Web Audio API is not supported.");
}

function createBubbles(svg, centerX, centerY, radius, depth) {
	if (depth === 0) {
		return;
	}

	const numBubbles = Math.floor(Math.random() * 6) + 2;

	const angleIncrement = (3 * Math.PI) / numBubbles;
	for (let i = 0; i < numBubbles; i++) {
		const angle = i * angleIncrement;
		//cartesian coordinates
		const x = radius * Math.cos(angle) + centerX;
		const y = radius * Math.sin(angle) + centerY;
		const newRadius = radius / (Math.random() + 1);
		const newX = x + newRadius * Math.cos(angle);
		const newY = y + newRadius * Math.sin(angle);

		//draw circle
		const circle = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"circle"
		);
		circle.setAttribute("cx", newX);
		circle.setAttribute("cy", newY);
		circle.setAttribute("r", newRadius);

		//color
		const randomColor = generateRandomColor();
		circle.setAttribute("fill", randomColor);

		circlesDrawn++;
		console.log("num bubbles", circlesDrawn);
		svg.appendChild(circle);
		//play sound
		playBlopSound();

		//recursive case
		setTimeout(() => {
			circle.style.transform = "translate(0,-5%)";
			createBubbles(svg, newX, newY, newRadius, depth - 1);
		}, i * 500);
	}
}

let score = 0;

function startGame() {
	circlesDrawn = 0;
	inputArea.focus();
	document.getElementById("user-score").style.display = "block";
	startGameButton.style.display = "none";
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	const svgHeight = window.innerHeight / 4;
	const svgWidth = window.innerWidth;
	const circleRadius =
		window.innerWidth > 1500 ? 100 : window.innerWidth * 0.09;
	svg.setAttribute("height", svgHeight);
	svg.setAttribute("width", svgWidth);
	document.body.appendChild(svg);
	//Load sound and start game
	loadSoundFile("blop.wav", () => {
		createBubbles(svg, svgWidth / 2, svgHeight * 0.9, circleRadius, 3);

		setTimeout(() => {
			document.getElementById("question").style.display = "block";
			inputArea.focus();
		}, 4000);
	});
}

function loadSoundFile(url, callback) {
	fetch(url)
		.then((response) => response.arrayBuffer())
		.then((buffer) => audioContext.decodeAudioData(buffer))
		.then((audioBuffer) => {
			blopBuffer = audioBuffer;

			if (callback) {
				callback();
			}
		})
		.catch((error) => console.error("Error loading sound!", error));
}

function playBlopSound() {
	const source = audioContext.createBufferSource();
	source.buffer = blopBuffer;
	source.connect(audioContext.destination);
	source.start(0);
}

function generateRandomColor() {
	const hue = Math.floor(Math.random() * 360);
	const saturation = Math.floor(Math.random() * 50) + 50;
	const lightness = Math.floor(Math.random() * 30) + 50;

	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const startGameButton = document.getElementById("start-game");
startGameButton.addEventListener("click", startGame);
startGameButton.addEventListener("touchstart", startGame);
const submitAnswerButton = document.getElementById("submit-answer");
const inputArea = document.getElementById("input-area");
const restartButton = document.getElementById("restart-game");

submitAnswerButton.addEventListener("click", (event) => {
	event.preventDefault();
	submitAnswer();
	submitAnswerButton.disabled = "true";

});

inputArea.addEventListener("keydown", (event) => {
	if(event.key === "Enter") {
	event.preventDefault();
	submitAnswer();
	submitAnswerButton.disabled = "true";

	}

});

function submitAnswer() {
	const userInput = inputArea.value.trim();
	restartButton.style.display = "block";
	if (!/^\d+$/.test(userInput)) {
		alert("Please enter a valid number.");

		inputArea.value = "";
		submitAnswerButton.disabled = false;
		inputArea.focus();
		return;
	}

	const userAnswer = parseInt(userInput, 10);
	const percentageDifference = Math.abs(
		((userAnswer - circlesDrawn) / circlesDrawn) * 100
	);

	if (percentageDifference === 0) {
		document.getElementById("result").innerText =
			"Correct! Well done! You get +100 !";
		score += 100;
	} else if (percentageDifference <= 20) {
		document.getElementById(
			"result"
		).innerText = `Close! You were ${percentageDifference.toFixed(
			2
		)}% off! \n the number we were looking for is : ${circlesDrawn} \n You get +50 !`;
		score += 50;
	} else if (percentageDifference <= 45) {
		document.getElementById(
			"result"
		).innerText = `Close! You were ${percentageDifference.toFixed(
			2
		)}% off! \n the number we were looking for is : ${circlesDrawn} \n You get +25 !`;
		score += 25;
	} else {
		document.getElementById(
			"result"
		).innerText = `Ooops! You were ${percentageDifference.toFixed(
			2
		)}% off! \n the number we were looking for is : ${circlesDrawn} !`;
	}

	document.getElementById("user-score").innerText = `Score : ${score}`;
}

function restartGame(){
	restartButton.style.display = "none";
	submitAnswerButton.disabled = false;

	document.getElementById("question").style.display = "none";
	const existingSvg = document.querySelector("svg");
	if(existingSvg){
		document.body.removeChild(existingSvg);
	}
	inputArea.value="";
	document.getElementById("result").innerText="";
	startGame();
}

restartButton.addEventListener("click", restartGame);
document.addEventListener("keydown", (event)=>{
	if(event.key == " "){
		restartGame();
	}
})

const rulesButton = document.getElementById("rules");
const rulesBox = document.getElementById("rules-box");
rulesButton.style.backgroundColor = generateRandomColor();
startGameButton.style.backgroundColor = generateRandomColor();


function toggleRulesBox(){
	if(rulesBox.style.display === "block"){
		rulesBox.style.display = "none";

	}else{
		rulesBox.style.display="block";

	}

}


rulesButton.addEventListener("mouseover", ()=>{
	rulesBox.style.display = "block"
})

rulesButton.addEventListener("mouseleave", ()=>{
	rulesBox.style.display="none";
})

rulesButton.addEventListener("touchstart", (event)=>{
	event.preventDefault();
	toggleRulesBox();
})

rulesButton.addEventListener("touchend", (event)=>{
	event.preventDefault();
	toggleRulesBox();
})