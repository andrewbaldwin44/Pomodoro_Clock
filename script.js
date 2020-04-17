class Clock {
  constructor() {
    this.arrowButtons = document.querySelectorAll('.arrowButton');
    this.playButton = document.querySelector('#playButton');
    this.stopButton = document.querySelector('#stopButton');
    this.pauseButton = document.querySelector('#pauseButton');
    this.restartButton = document.querySelector('#restartButton');
    this.sessionTimeSelector = document.querySelector('#sessionTimeSelector');
    this.breakTimeSelector = document.querySelector('#breakTimeSelector');
    this.clockDisplay = document.querySelector('#clockDisplay');
    this.clock = new Date();
    this.roundCounter = 0;
    this.startBreakChime = new Audio("assets/sounds/timer_end.mp3");
    this.endBreakChime = new Audio("assets/sounds/big_daddy.mp3");
    this.settingsButton = document.querySelector('#settingsButton');
    this.settingsDiv = document.querySelector('.settingsDiv');
    this.roundIndicatorDiv = document.querySelector('.roundIndicatorDiv');
  }

  initializeEventListeners() {
    [...this.arrowButtons].map(arrowButton => {
      arrowButton.addEventListener('click', () => this.updateSessionBreakTime(arrowButton));
    });

    this.playButton.addEventListener('click', () => {
      if(!this.playButton.classList.contains('disabled')) {
        this.startClock();
      }
    });

    this.pauseButton.addEventListener('click', () => this.pauseClock());

    this.restartButton.addEventListener('click', () => {
      this.restartButton.classList.toggle('resetRotate');
      this.restartButton.addEventListener('animationend', ()=> this.restartButton.classList.remove('resetRotate'));
      this.restartClock();
    });

    this.settingsButton.addEventListener('click', ()=> this.toggleSettings());
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
    if(this.isPaused) return;
    if (this.cycleEnd()) {
      this.clock.setMinutes(Number(this.breakTimeSelector.textContent)*2);
    } else if (!this.onBreak) {
      this.clock.setMinutes(Number(this.sessionTimeSelector.textContent));
    } else if (this.onBreak){
      this.clock.setMinutes(Number(this.breakTimeSelector.textContent));
    }
    this.clock.setSeconds(0);
  }

  setClockDisplay(minutes, seconds){
    this.clockDisplay.textContent = `${minutes}:${seconds}`;
  }

  padZeroes(time) {
    return String(time).length == 1 ? `0${time}` : time;
  }

//Checks for onBreak switch to decide if user is on or off a break as clock ends a cycle

  switchSessionBreak() {
    clearInterval(this.countDown);
    if (this.cycleEnd()) {
      this.restartClock();
    } else if (this.onBreak  && !this.cycleEnd()) {
      this.onBreak = false;
      this.endBreakChime.play();
      this.startClock();
    } else {
      this.roundCounter += 1;
      this.fillRoundCounter();
      this.onBreak = true;
      this.startBreakChime.play();
      this.startClock();
    }
  }

  fillRoundCounter() {
    this.roundIndicatorDiv.children[this.roundCounter -1].classList.add('roundCompleted');
  }

  resetRoundCounters() {
    for(let i=0; i<this.roundIndicatorDiv.children.length; i++){
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
    this.isPaused = false;
    this.onBreak = false;
    this.roundCounter = 0;
    this.resetRoundCounters();
    clearInterval(this.countDown);
    this.setClockDisplay(minutes, '00');
  }

  toggleSettings(){
    this.settingsDiv.classList.toggle('show');
    this.settingsButton.classList.toggle('buttonRotate');
  }

  updateSessionBreakTime(arrowButton) {
    if (arrowButton.parentNode.parentNode.id === 'sessionSettings') {
      if (this.sessionTimeSelector.textContent <= 1) arrowButton.disabled = true;
      this.sessionTimeSelector.textContent = Number(this.sessionTimeSelector.textContent) + Number(arrowButton.value);
      if(!this.onBreak){
        this.setClockDisplay(this.sessionTimeSelector.textContent, "00");
      }
    }
    if (arrowButton.parentNode.parentNode.id == "breakSettings") {
      if (this.breakTimeSelector.textContent <= 1) return;
      this.breakTimeSelector.textContent = Number(this.breakTimeSelector.textContent) + Number(arrowButton.value);
        if(this.onBreak) {
          this.setClockDisplay(this.breakTimeSelector.textContent, "00");
        }
    }
  }
}

new Clock().initializeEventListeners();

window.onload = ()=> {
  document.querySelector('body').classList.remove('noTransition');
}

// window.onclick = e => {
//   console.log(e.target)
//   // console.log(e.target.contains(".fa-wrench"))
//   if (!e.target.matches('#settingsButton') && !e.target.matches('.settingsDiv') && !e.target.matches('.sessionSettings')) {
//     let settingsDiv = document.querySelector('.settingsDiv');
//     if (settingsDiv.classList.contains('show')) settingsDiv.classList.remove('show');
//   }
// }
