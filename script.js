class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'ko';
        this.initLanguageSelector();
        this.translatePage();
    }
    
    initLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
    }
    
    changeLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
        this.translatePage();
    }
    
    translatePage() {
        const elementsToTranslate = document.querySelectorAll('[data-translate]');
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[this.currentLanguage] && translations[this.currentLanguage][key]) {
                element.textContent = translations[this.currentLanguage][key];
            }
        });
        
        document.title = translations[this.currentLanguage]?.title || document.title;
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && translations[this.currentLanguage]?.subtitle) {
            metaDescription.setAttribute('content', translations[this.currentLanguage].subtitle);
        }
    }
    
    getText(key) {
        return translations[this.currentLanguage]?.[key] || translations.ko[key] || key;
    }
}

class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
        this.lapCounter = 1;
        
        this.display = document.getElementById('display');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapList = document.getElementById('lapList');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (!this.isRunning) {
                        this.start();
                    } else {
                        this.pause();
                    }
                    break;
                case 'KeyR':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.reset();
                    }
                    break;
                case 'KeyL':
                    if (this.isRunning) {
                        this.addLap();
                    }
                    break;
            }
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.timerInterval = setInterval(() => this.updateDisplay(), 10);
            this.isRunning = true;
            
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.startBtn.textContent = window.languageManager.getText('running');
        }
    }
    
    pause() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;
            
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.startBtn.textContent = window.languageManager.getText('continue');
            
            this.addLap();
        }
    }
    
    reset() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.elapsedTime = 0;
        this.lapCounter = 1;
        
        this.updateDisplay();
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.textContent = window.languageManager.getText('start');
        
        this.lapList.innerHTML = '';
    }
    
    updateDisplay() {
        if (this.isRunning) {
            this.elapsedTime = Date.now() - this.startTime;
        }
        
        const time = this.formatTime(this.elapsedTime);
        this.display.textContent = time;
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
    }
    
    addLap() {
        if (this.elapsedTime > 0) {
            const lapTime = this.formatTime(this.elapsedTime);
            const lapItem = document.createElement('li');
            lapItem.innerHTML = `
                <span>${window.languageManager.getText('lap')} ${this.lapCounter}</span>
                <span>${lapTime}</span>
            `;
            this.lapList.appendChild(lapItem);
            this.lapCounter++;
            
            this.lapList.scrollTop = this.lapList.scrollHeight;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
    new Stopwatch();
    
    console.log('온라인 스톱워치가 시작되었습니다!');
    console.log('키보드 단축키:');
    console.log('- 스페이스바: 시작/일시정지');
    console.log('- Ctrl+R: 리셋');
    console.log('- L: 랩 타임 추가 (실행 중일 때)');
});