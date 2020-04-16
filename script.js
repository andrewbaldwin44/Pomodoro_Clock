class Clock {
  constructor() {
    this.arrowButtons = document.querySelectorAll('.arrowButton');
    this.playButton = document.querySelector('#play');
    this.stopButton = document.querySelector('#stop');
    this.pauseButton = document.querySelector('#pause');
    this.restartButton = document.querySelector('#restart');
    this.sessionTime = document.querySelector('#sessionTime');
    this.breakTime = document.querySelector('#breakTime');
    this.timer = document.querySelector('#timer');
    this.clock = new Date();
    this.roundCounter = 0;
    this.timerStartBreak = new Audio("assets/sounds/timer_end.mp3");
    this.timerEndBreak = new Audio("assets/sounds/big_daddy.mp3");
    this.settingsButton = document.querySelector('#settingsButton');
    this.settingsContent = document.querySelector('.settings');
  }

  initializeEventListeners(){
    [...this.arrowButtons].map(arrowButton => {
      arrowButton.addEventListener('click', () => this.updateSessionBreakTime(arrowButton));
    });
    this.playButton.addEventListener('click', () => this.startClock());
    this.pauseButton.addEventListener('click', () => this.pause());
    this.restartButton.addEventListener('click', () => {
      this.restartButton.classList.toggle('buttonRotate');
      this.restartButton.addEventListener('transitionend', ()=> this.restartButton.classList.remove('buttonRotate'));
      this.restart();
    });
    this.settingsButton.addEventListener('click', ()=> this.toggleSettings());
  }

  toggleSettings(){
    this.settingsContent.classList.toggle('show');
    this.settingsButton.classList.toggle('buttonRotate');
  }

  updateSessionBreakTime(arrowButton) {
    if (arrowButton.parentNode.parentNode.id === 'session') {
      this.sessionTime.textContent = Number(this.sessionTime.textContent) + Number(arrowButton.value);
      if(!this.onBreak){
        this.setClock(Number(this.sessionTime.textContent), '00');
        this.restart();
      }
    }
    if (arrowButton.parentNode.parentNode.id == "break") {
      this.breakTime.textContent = Number(this.breakTime.textContent) + Number(arrowButton.value);
      if(this.onBreak){
        if(this.onBreak) this.setClock(Number(this.breakTime.textContent), '00');
        this.restart(this.breakTime.textContent);
      }
    }
  }

  padZeroes(time) {
    return String(time).length == 1 ? `0${time}` : time;
  }

  setClock(minutes, seconds){
    this.timer.textContent = `${minutes}:${seconds}`;
  }

  startClock() {
    this.roundCounter += 1;
    if (this.roundCounter >= 5) {
      alert("RESET!");
      this.restart();
      return;
    }
    this.playButton.disabled = true;
    if (!this.isPaused) {
      this.clock.setMinutes(Number(this.sessionTime.textContent));
      this.clock.setSeconds(0);
    }
    if (this.onBreak){
      this.clock.setMinutes(Number(this.breakTime.textContent));
      this.clock.setSeconds(0);
    }
    this.countDown = setInterval(() => {
      this.clock.setSeconds(this.clock.getSeconds() - 1);
      this.minutes = this.padZeroes(this.clock.getMinutes());
      this.seconds = this.padZeroes(this.clock.getSeconds());
      this.setClock(this.minutes, this.seconds);
      if (this.minutes <= 0 && this.seconds <= 0) this.setBreak();
    }, 10);
  }

  setBreak() {
    clearInterval(this.countDown);

    if (this.onBreak) {
      this.onBreak = false;
      this.timerEndBreak.play();
    }
    else {
      this.onBreak = true;
      this.timerStartBreak.play();
    }

    this.startClock();
  }

  pause() {
    this.playButton.disabled = false;
    this.isPaused = true;
    clearInterval(this.countDown);
  }

  restart(minutes = this.sessionTime.textContent) {
    this.playButton.disabled = false;
    this.isPaused = false;
    this.roundCounter = 0;
    clearInterval(this.countDown);
    this.setClock(minutes, '00');
  }
}

new Clock().initializeEventListeners();

window.onload = ()=> {
  document.querySelector('body').classList.remove('noTransition');
}
