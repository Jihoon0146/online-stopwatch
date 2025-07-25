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
            if (key === 'title') {
                this.renderTitle(element);
            } else if (translations[this.currentLanguage] && translations[this.currentLanguage][key]) {
                element.textContent = translations[this.currentLanguage][key];
            }
        });
        
        document.title = translations[this.currentLanguage]?.title || document.title;
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && translations[this.currentLanguage]?.subtitle) {
            metaDescription.setAttribute('content', translations[this.currentLanguage].subtitle);
        }
    }
    
    renderTitle(titleElement) {
        const titleText = translations[this.currentLanguage]?.title || translations.ko.title;
        const words = titleText.split(' ');
        
        if (words.length >= 4) {
            // 스페인어의 경우 긴 단어 처리
            const isSpanish = this.currentLanguage === 'es';
            const stackClass = isSpanish ? 'vertical-stack long-words' : 'vertical-stack';
            
            titleElement.innerHTML = `
                <span class="title-word">${words[0]}</span>
                <div class="${stackClass}">
                    <span class="up-text">${words[1]}</span>
                    <span class="down-text">${words[2]}</span>
                </div>
                <span class="title-word">${words[3]}</span>
            `;
        } else {
            titleElement.textContent = titleText;
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
        this.settingsBtn = document.getElementById('settingsBtn');
        
        this.initEventListeners();
        this.initColorSettings();
    }
    
    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.settingsBtn.addEventListener('click', () => this.showColorPicker());
        
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
        const mainTime = this.display.querySelector('.time-main');
        const msTime = this.display.querySelector('.time-ms');
        
        if (mainTime && msTime) {
            mainTime.textContent = time.main;
            msTime.textContent = '.' + time.ms;
        }
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        return {
            main: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            ms: ms.toString().padStart(2, '0')
        };
    }
    
    addLap() {
        if (this.elapsedTime > 0) {
            const lapTime = this.formatTime(this.elapsedTime);
            const lapItem = document.createElement('li');
            lapItem.innerHTML = `
                <span>${window.languageManager.getText('lap')} ${this.lapCounter}</span>
                <span class="lap-time">${lapTime.main}<span class="lap-ms">.${lapTime.ms}</span></span>
            `;
            this.lapList.appendChild(lapItem);
            this.lapCounter++;
            
            this.lapList.scrollTop = this.lapList.scrollHeight;
        }
    }
    
    initColorSettings() {
        // 저장된 색상 불러오기
        const savedColor = localStorage.getItem('stopwatchColor') || '#ffffff';
        this.applyColor(savedColor);
    }
    
    showColorPicker() {
        const currentColor = localStorage.getItem('stopwatchColor') || '#ffffff';
        const colors = [
            '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
            '#fff3cd', '#d1ecf1', '#d4edda', '#f8d7da',
            '#e2e3e5', '#ffeaa7', '#74b9ff', '#00b894',
            '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe'
        ];
        
        let colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.remove();
        }
        
        colorPicker = document.createElement('div');
        colorPicker.id = 'colorPicker';
        colorPicker.className = 'color-picker';
        colorPicker.innerHTML = `
            <div class="color-picker-content">
                <div class="color-picker-header">색상 선택</div>
                <div class="color-grid">
                    ${colors.map(color => `
                        <div class="color-option ${color === currentColor ? 'selected' : ''}" 
                             data-color="${color}" 
                             style="background-color: ${color}"></div>
                    `).join('')}
                </div>
                <button class="color-picker-close">닫기</button>
            </div>
        `;
        
        document.body.appendChild(colorPicker);
        
        // 이벤트 리스너 추가
        colorPicker.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.changeColor(color);
                colorPicker.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
        
        colorPicker.querySelector('.color-picker-close').addEventListener('click', () => {
            colorPicker.remove();
        });
        
        // 배경 클릭 시 닫기
        colorPicker.addEventListener('click', (e) => {
            if (e.target === colorPicker) {
                colorPicker.remove();
            }
        });
    }
    
    changeColor(color) {
        localStorage.setItem('stopwatchColor', color);
        this.applyColor(color);
    }
    
    applyColor(color) {
        const stopwatch = document.querySelector('.stopwatch');
        const timer = document.querySelector('.timer');
        const display = document.querySelector('.display');
        const timerDisplay = document.querySelector('#timerDisplay');
        const lapList = document.querySelector('#lapList');
        const timeInputs = document.querySelectorAll('.time-input input');
        
        // 컨테이너 색상 적용
        if (stopwatch) {
            stopwatch.style.backgroundColor = color;
        }
        if (timer) {
            timer.style.backgroundColor = color;
        }
        
        // 메인 색상에 따른 조화로운 보조 색상 계산
        const complementaryColor = this.getComplementaryColor(color);
        const borderColor = this.getBorderColor(color);
        
        // display 색상 적용
        if (display) {
            display.style.backgroundColor = complementaryColor;
            display.style.borderColor = borderColor;
        }
        if (timerDisplay) {
            timerDisplay.style.backgroundColor = complementaryColor;
            timerDisplay.style.borderColor = borderColor;
        }
        
        // 기타 요소들
        if (lapList) {
            lapList.style.backgroundColor = complementaryColor;
        }
        
        // timer 입력 필드들
        timeInputs.forEach(input => {
            input.style.backgroundColor = complementaryColor;
            input.style.borderColor = borderColor;
        });
    }
    
    getComplementaryColor(hexColor) {
        // 색상별 조화로운 보조 색상 매핑
        const colorMap = {
            '#ffffff': '#f8f9fa',  // 흰색 -> 연한 회색
            '#f8f9fa': '#e9ecef',  // 연한 회색 -> 더 진한 회색
            '#e9ecef': '#dee2e6',  // 회색 -> 더 진한 회색
            '#dee2e6': '#ced4da',  // 진한 회색 -> 더 진한 회색
            '#fff3cd': '#ffeaa7',  // 연한 노랑 -> 진한 노랑
            '#d1ecf1': '#b8daff',  // 연한 파랑 -> 진한 파랑
            '#d4edda': '#b8e6b8',  // 연한 초록 -> 진한 초록
            '#f8d7da': '#ffb3ba',  // 연한 빨강 -> 진한 빨강
            '#e2e3e5': '#d3d3d4',  // 연한 회색 -> 진한 회색
            '#ffeaa7': '#fdcb6e',  // 노랑 -> 오렌지
            '#74b9ff': '#0984e3',  // 파랑 -> 진한 파랑
            '#00b894': '#00a085',  // 초록 -> 진한 초록
            '#fd79a8': '#e84393',  // 분홍 -> 진한 분홍
            '#fdcb6e': '#e17055',  // 오렌지 -> 진한 오렌지
            '#6c5ce7': '#5f3dc4',  // 보라 -> 진한 보라
            '#a29bfe': '#6c5ce7'   // 연한 보라 -> 진한 보라
        };
        
        return colorMap[hexColor.toLowerCase()] || '#f0f0f0';
    }
    
    getBorderColor(hexColor) {
        // 메인 색상에 따른 테두리 색상 매핑 (배경색보다 더 진한 색)
        const borderMap = {
            '#ffffff': '#dee2e6',  // 흰색 -> 회색 테두리
            '#f8f9fa': '#ced4da',  // 연한 회색 -> 진한 회색
            '#e9ecef': '#adb5bd',  // 회색 -> 더 진한 회색
            '#dee2e6': '#8a9497',  // 진한 회색 -> 더 진한 회색
            '#fff3cd': '#f1c40f',  // 연한 노랑 -> 진한 노랑
            '#d1ecf1': '#3498db',  // 연한 파랑 -> 진한 파랑
            '#d4edda': '#27ae60',  // 연한 초록 -> 진한 초록
            '#f8d7da': '#e74c3c',  // 연한 빨강 -> 진한 빨강
            '#e2e3e5': '#95a5a6',  // 연한 회색 -> 진한 회색
            '#ffeaa7': '#f39c12',  // 노랑 -> 진한 오렌지
            '#74b9ff': '#2980b9',  // 파랑 -> 진한 파랑
            '#00b894': '#16a085',  // 초록 -> 진한 초록
            '#fd79a8': '#c0392b',  // 분홍 -> 진한 빨강
            '#fdcb6e': '#d35400',  // 오렌지 -> 진한 오렌지
            '#6c5ce7': '#8e44ad',  // 보라 -> 진한 보라
            '#a29bfe': '#9b59b6'   // 연한 보라 -> 진한 보라
        };
        
        return borderMap[hexColor.toLowerCase()] || '#bdc3c7';
    }
}

class Timer {
    constructor() {
        this.totalTime = 0;
        this.remainingTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
        
        this.hoursInput = document.getElementById('hoursInput');
        this.minutesInput = document.getElementById('minutesInput');
        this.secondsInput = document.getElementById('secondsInput');
        this.display = document.getElementById('timerDisplay');
        this.startBtn = document.getElementById('timerStartBtn');
        this.pauseBtn = document.getElementById('timerPauseBtn');
        this.resetBtn = document.getElementById('timerResetBtn');
        this.settingsBtn = document.getElementById('timerSettingsBtn');
        
        this.initEventListeners();
        this.initColorSettings();
        this.updateDisplayFromInputs();
    }
    
    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.settingsBtn.addEventListener('click', () => this.showColorPicker());
        
        // 입력 필드 변경 시 디스플레이 업데이트
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('input', () => this.updateDisplayFromInputs());
            input.addEventListener('change', () => this.validateInput(input));
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return; // 입력 필드에서는 키보드 단축키 비활성화
            
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
            }
        });
    }
    
    validateInput(input) {
        let value = parseInt(input.value) || 0;
        const min = parseInt(input.min);
        const max = parseInt(input.max);
        
        if (value < min) value = min;
        if (value > max) value = max;
        
        input.value = value;
        this.updateDisplayFromInputs();
    }
    
    updateDisplayFromInputs() {
        if (this.isRunning) return;
        
        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;
        
        this.totalTime = hours * 3600000 + minutes * 60000 + seconds * 1000;
        this.remainingTime = this.totalTime;
        
        this.updateDisplay();
    }
    
    start() {
        if (this.remainingTime <= 0) {
            this.updateDisplayFromInputs();
            if (this.remainingTime <= 0) return;
        }
        
        this.isRunning = true;
        this.startTime = Date.now();
        
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 10);
        
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.startBtn.textContent = window.languageManager.getText('running');
    }
    
    pause() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;
            
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.startBtn.textContent = window.languageManager.getText('continue');
        }
    }
    
    reset() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        
        this.updateDisplayFromInputs();
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.textContent = window.languageManager.getText('start');
    }
    
    updateTimer() {
        if (this.isRunning) {
            const elapsed = Date.now() - this.startTime;
            this.remainingTime = Math.max(0, this.totalTime - elapsed);
            
            if (this.remainingTime <= 0) {
                this.timerFinished();
                return;
            }
            
            this.totalTime = this.remainingTime;
            this.startTime = Date.now();
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        const time = this.formatTime(this.remainingTime);
        const mainTime = this.display.querySelector('.time-main');
        const msTime = this.display.querySelector('.time-ms');
        
        if (mainTime && msTime) {
            mainTime.textContent = time.main;
            msTime.textContent = '.' + time.ms;
        }
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        return {
            main: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            ms: ms.toString().padStart(2, '0')
        };
    }
    
    timerFinished() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.remainingTime = 0;
        
        this.updateDisplay();
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.startBtn.textContent = window.languageManager.getText('start');
        
        // 타이머 완료 알림
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('타이머 완료!', {
                body: '설정한 시간이 완료되었습니다.',
                icon: '/favicon.ico'
            });
        }
        
        // 사운드 알림 (선택사항)
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+f3CjA=');
            audio.play().catch(() => {}); // 오디오 재생 실패 시 무시
        } catch (e) {}
    }
    
    // Stopwatch와 동일한 색상 관리 메서드들
    initColorSettings() {
        const savedColor = localStorage.getItem('stopwatchColor') || '#ffffff';
        // Stopwatch의 applyColor를 사용하여 통일된 색상 적용
        if (window.stopwatch) {
            window.stopwatch.applyColor(savedColor);
        }
    }
    
    showColorPicker() {
        // Stopwatch의 showColorPicker와 동일한 로직 사용
        if (window.stopwatch) {
            window.stopwatch.showColorPicker();
        }
    }
}

// 모드 전환 관리 클래스
class ModeManager {
    constructor() {
        this.currentMode = 'stopwatch';
        this.stopwatchBtn = document.getElementById('stopwatchMode');
        this.timerBtn = document.getElementById('timerMode');
        this.stopwatchContainer = document.getElementById('stopwatchContainer');
        this.timerContainer = document.getElementById('timerContainer');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.stopwatchBtn.addEventListener('click', () => this.switchToStopwatch());
        this.timerBtn.addEventListener('click', () => this.switchToTimer());
    }
    
    switchToStopwatch() {
        if (this.currentMode === 'stopwatch') return;
        
        this.currentMode = 'stopwatch';
        this.stopwatchBtn.classList.add('active');
        this.timerBtn.classList.remove('active');
        this.stopwatchContainer.style.display = 'block';
        this.timerContainer.style.display = 'none';
        
        // 타이머가 실행 중이면 일시정지
        if (window.timer && window.timer.isRunning) {
            window.timer.pause();
        }
    }
    
    switchToTimer() {
        if (this.currentMode === 'timer') return;
        
        this.currentMode = 'timer';
        this.timerBtn.classList.add('active');
        this.stopwatchBtn.classList.remove('active');
        this.timerContainer.style.display = 'block';
        this.stopwatchContainer.style.display = 'none';
        
        // 스톱워치가 실행 중이면 일시정지
        if (window.stopwatch && window.stopwatch.isRunning) {
            window.stopwatch.pause();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
    window.stopwatch = new Stopwatch();
    window.timer = new Timer();
    window.modeManager = new ModeManager();
    
    // 알림 권한 요청 (타이머 완료 알림용)
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    console.log('온라인 스톱워치가 시작되었습니다!');
    console.log('키보드 단축키:');
    console.log('- 스페이스바: 시작/일시정지');
    console.log('- Ctrl+R: 리셋');
    console.log('- L: 랩 타임 추가 (실행 중일 때)');
});