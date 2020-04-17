class Clock {
  constructor() {
    this.titleDisplay = document.querySelector('title');
    this.clockDisplay = document.querySelector('#clockDisplay');
    this.roundIndicatorDiv = document.querySelector('.roundIndicatorDiv');
    this.playButton = document.querySelector('#playButton');
    this.pauseButton = document.querySelector('#pauseButton');
    this.restartButton = document.querySelector('#restartButton');
    this.settingsButton = document.querySelector('#settingsButton');
    this.settingsDiv = document.querySelector('.settingsDiv');
    this.sessionTimeSelector = document.querySelector('#sessionTimeSelector');
    this.breakTimeSelector = document.querySelector('#breakTimeSelector');
    this.arrowButtons = document.querySelectorAll('.arrowButton');

    this.clock = new Date();

    this.roundCounter = 0;

    this.startBreakChime = new Audio("assets/sounds/timer_end.mp3");
    this.endBreakChime = new Audio("assets/sounds/break.wav");
    this.endCycleChime = new Audio('assets/sounds/long-break.wav');
  }

  initializeEventListeners() {
    this.playButton.addEventListener('click', () => {
      if (!this.playButton.classList.contains('disabled')) this.startClock();
    });

    this.pauseButton.addEventListener('click', () => this.pauseClock());

    this.restartButton.addEventListener('click', () => {
      this.restartButton.classList.toggle('resetRotate');
      this.restartButton.addEventListener('animationend', () => this.restartButton.classList.remove('resetRotate'));
      this.restartCycle();
    });

    this.settingsButton.addEventListener('click', () => this.toggleSettings());

    [...this.arrowButtons].forEach(arrowButton => {
      arrowButton.addEventListener('click', () => this.updateSessionBreakTime(arrowButton));
      arrowButton.addEventListener('animationend', () => arrowButton.classList.remove('buttonShake'));
    });

    window.addEventListener("keydown", () => {
      if (event.key == " ") {
         !this.playButton.classList.contains('disabled') ? this.startClock() : this.pauseClock();
      }
    });
  }

  //Clock Functions
  startClock() {
    this.setClockValues();

    this.playButton.classList.add('disabled');
    this.isPaused = false;

    this.countDown = setInterval(() => {
      this.clock.setSeconds(this.clock.getSeconds() - 1);
      this.minutes = this.padZeroes(this.clock.getMinutes());
      this.seconds = this.padZeroes(this.clock.getSeconds());
      this.setClockDisplay(this.minutes, this.seconds);
      if (this.minutes <= 0 && this.seconds <= 0) this.switchSessionBreak();
    }, 10);
  }

  setClockValues() {
    if (this.isPaused) return;
    if (this.cycleEnd()) {
      this.clock.setMinutes(Number(this.breakTimeSelector.textContent) * 2);
    } else if (this.onBreak) {
      this.clock.setMinutes(Number(this.breakTimeSelector.textContent));
    } else if (!this.onBreak) {
      this.clock.setMinutes(Number(this.sessionTimeSelector.textContent));
    }
    this.clock.setSeconds(0);
  }

  setClockDisplay(minutes, seconds) {
    this.currentTime = `${minutes}:${seconds}`
    this.clockDisplay.textContent = this.currentTime;
    this.setTitleDisplay();
  }

  setTitleDisplay(){
    if (focus) {
      this.onBreak
        ? this.titleDisplay.textContent = `(${this.currentTime}) Take A Break :)`
        : this.titleDisplay.textContent = `(${this.currentTime}) Focus!`
    } else this.titleDisplay.textContent = 'Pomodoro Clock';
  }

  padZeroes(time) {
    return String(time).length == 1 ? `0${time}` : time;
  }

  //Checks for onBreak switch to decide if user is on or off a break as clock ends a cycle

  switchSessionBreak() {
    clearInterval(this.countDown);
    if (this.cycleEnd()) {
      this.endCycleChime.play();
      this.restartCycle();
    } else if (this.onBreak) {
      this.onBreak = false;
      this.endBreakChime.play();
      this.clockDisplay.classList.remove('breakTimeColor');
      this.startClock();
    } else if (!this.onBreak) {
      this.roundCounter += 1;
      this.fillRoundCounter();
      this.onBreak = true;
      this.startBreakChime.play();
      this.clockDisplay.classList.add('breakTimeColor');
      this.startClock();
    }
  }

  fillRoundCounter() {
    this.roundIndicatorDiv.children[this.roundCounter - 1].classList.add('roundCompleted');
  }

  resetRoundCounters() {
    for (let i = 0; i < this.roundIndicatorDiv.children.length; i++) {
      this.roundIndicatorDiv.children[i].classList.remove('roundCompleted');
    }
  }

  cycleEnd() {
    if (this.roundCounter == 4) return true;
  }

  pauseClock() {
    this.playButton.classList.remove('disabled');
    this.isPaused = true;
    clearInterval(this.countDown);
  }

  restartClock(minutes = this.sessionTimeSelector.textContent) {
    this.playButton.classList.remove('disabled');
    clearInterval(this.countDown);
    this.setClockDisplay(minutes, '00');
  }

  restartCycle() {
    this.restartClock();
    this.isPaused = false;
    this.onBreak = false;
    this.roundCounter = 0;
    this.resetRoundCounters();
    this.clockDisplay.classList.remove('breakTimeColor');
    this.titleDisplay.textContent = 'Pomodoro Clock';
  }

  toggleSettings() {
    this.settingsDiv.classList.toggle('show');
    this.settingsButton.classList.toggle('wrenchRotate');
  }

  toggleArrowButton(arrowButton, timeSelector = this.sessionTimeSelector.textContent) {
    if (arrowButton.classList.contains('increment') && timeSelector < 60) return true;
    else if (arrowButton.classList.contains('decrement') && timeSelector > 1) return true;
    else arrowButton.classList.add('buttonShake');
  }

  updateSessionBreakTime(arrowButton) {
    const settingsValueId = arrowButton.parentNode.parentNode.id;

    if (settingsValueId == 'sessionSettings' && this.toggleArrowButton(arrowButton)) {
      this.sessionTimeSelector.textContent = Number(this.sessionTimeSelector.textContent) + Number(arrowButton.value);
      if (!this.onBreak) this.restartClock();
    }
    if (settingsValueId == "breakSettings" && this.toggleArrowButton(arrowButton, breakTimeSelector.textContent)) {
      this.breakTimeSelector.textContent = Number(this.breakTimeSelector.textContent) + Number(arrowButton.value);
      if (this.onBreak) this.restartClock(this.breakTimeSelector.textContent);
    }
  }
}

new Clock().initializeEventListeners();

window.onload = () => document.querySelector('body').classList.remove('noTransition');

let focus = false;
window.onfocus = () => focus = false;
window.onblur = () => focus = true;
