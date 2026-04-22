const rewards = [
  [1, "#0066cc"], // Player blue
  [1, "#cc0000"], // Banker red
  [1, "#0066cc"],
  [1, "#cc0000"],
  [1, "#0066cc"],
  [1, "#cc0000"],
  [1, "#0066cc"],
  [1, "#cc0000"],
  [1, "#0066cc"],
  [1, "#cc0000"]
];

const w = document.getElementById("w"),
	c = document.getElementById("c"),
	p = document.getElementById("p"),
	statusDisplayEl = document.getElementById("status-display"),
	betPlayerBtn = document.getElementById("bet-player"),
	betBankerBtn = document.getElementById("bet-banker"),
	spinBtn = document.getElementById("spin-btn");

const segmentMaxWidth = Math.ceil((400 * Math.PI) / rewards.length),
	segmentHalfWidth = 0.5 * segmentMaxWidth,
	segmentRotate = 360 / rewards.length;

const STATE_IDLE = "idle",
	STATE_ROTATING = "rotating";

let state = STATE_IDLE,
	betChoice = null,
	lastWinner = null;

updateStatus();

// Bet handlers
function handleBet(choice) {
  betChoice = choice;
  betPlayerBtn.classList.remove('active');
  betBankerBtn.classList.remove('active');
  if (choice === 'player') {
    betPlayerBtn.classList.add('active');
  } else {
    betBankerBtn.classList.add('active');
  }
  spinBtn.disabled = false;
}

betPlayerBtn.addEventListener('click', () => handleBet('player'));
betBankerBtn.addEventListener('click', () => handleBet('banker'));

// Spin handler
spinBtn.addEventListener('click', () => {
  if (betChoice && state === STATE_IDLE) {
    betPlayerBtn.disabled = true;
    betBankerBtn.disabled = true;
    spinBtn.disabled = true;
    turn();
  }
});

// segments
for (let i = 0, j = 0; i < rewards.length; i++) {
	j = rewards.length - 1 - i;
	const segment = document.createElement("div");
	segment.classList.add("segment");
	segment.style.left = `${-segmentHalfWidth}px`;
	segment.style.borderColor = `transparent transparent ${rewards[i][1]} transparent`;
	segment.style.borderWidth = `0 ${segmentHalfWidth}px 200px ${segmentHalfWidth}px`;
	segment.style.transform = `rotateZ(${180 + j * segmentRotate}deg)`;
	c.appendChild(segment);
}

// dividers
for (let i = 0; i < rewards.length; i++) {
	const divider = document.createElement("div");
	divider.classList.add("divider");
	divider.style.transform = `rotateZ(${180 + 0.5 * segmentRotate + i * segmentRotate}deg)`;
	c.appendChild(divider);
}

// turn
function turn() {
  p.classList.add('jolt');
  setTimeout(() => p.classList.remove('jolt'), 250);

  const currentRotation = getRotationAngle(w),
    minimumRotation = 600,
    newRotation = minimumRotation + Math.round(Math.random() * 720),
    time = Math.round((1 + newRotation / 180) * 1000);
  state = STATE_ROTATING;
  w.style.transition = `transform ${time}ms cubic-bezier(0.42, -0.1, 0.58, 1.02)`;
  w.style.transform = `rotate(${newRotation}deg)`;

  setTimeout(() => {
    const rot = newRotation % 360;
    w.style.transition = "none";
    w.style.transform = `rotate(${rot}deg)`;

    const segmentIndex =
      rot < 0.5 * segmentRotate
        ? rewards.length - 1
        : Math.floor((rot - 0.5 * segmentRotate) / segmentRotate);

    const color = rewards[segmentIndex][1];
    const playerWinRound = color === '#0066cc';
    
    lastWinner = playerWinRound ? 'player' : 'banker';
    
    updateStatus();

    betPlayerBtn.disabled = false;
    betBankerBtn.disabled = false;
    betChoice = null;
    betPlayerBtn.classList.remove('active');
    betBankerBtn.classList.remove('active');

    state = STATE_IDLE;
    spinBtn.disabled = true;
  }, time + 100);
}

// Update status display
function updateStatus() {
  if (lastWinner) {
    statusDisplayEl.innerText = lastWinner.toUpperCase() + ' WINS!';
    statusDisplayEl.className = 'status-display ' + lastWinner + '-win';
  } else {
    statusDisplayEl.innerText = 'Select bet to begin';
    statusDisplayEl.className = 'status-display';
  }
}

// Get angle from element
function getRotationAngle(element) {
	const computedStyle = window.getComputedStyle(element);
	const transform =
		computedStyle.transform ||
		computedStyle.webkitTransform ||
		computedStyle.mozTransform;

	if (transform === "none") {
		return 0;
	}

	const values = transform.split("(")[1].split(")")[0].split(",");
	const a = parseFloat(values[0]);
	const b = parseFloat(values[1]);
	return Math.round(Math.atan2(b, a) * (180 / Math.PI));
}

