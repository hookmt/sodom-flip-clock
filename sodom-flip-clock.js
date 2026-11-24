class SodomFlipClock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._timer = null;
    this._resizeObserver = null;
    this._lastState = { h1: '', h2: '', m1: '', m2: '', dayName: '', dateFull: '' };
    this._isInitialized = false;
  }

  static getStubConfig() {
    return {
      language: 'auto',
      digit_color: '#FFA000',
      digit_glow: 'rgba(255, 160, 0, 0.35)',
      animation: true,
      blink_colon: true,
      show_date: true,
      uppercase_day: true
    };
  }

  setConfig(config) {
    this._config = {
      language: config.language || 'auto',
      digit_color: config.digit_color || '#FFA000',
      digit_glow: config.digit_glow || 'rgba(255, 160, 0, 0.35)',
      animation: config.animation !== false,
      blink_colon: config.blink_colon !== false,
      show_date: config.show_date !== false,
      uppercase_day: config.uppercase_day !== false,
      time_zone: config.time_zone || '',
      ...config
    };

    if (this._isInitialized) {
      this._applyConfig();
      this._tick(true);
    }
  }

  set hass(hass) {
    const oldTz = this._hass?.config?.time_zone;
    const oldLang = this._hass?.locale?.language || this._hass?.language;
    this._hass = hass;
    const newTz = hass?.config?.time_zone;
    const newLang = hass?.locale?.language || hass?.language;
    if (this._isInitialized && (oldTz !== newTz || oldLang !== newLang)) {
      this._tick(false);
    }
  }

  connectedCallback() {
    if (!this._isInitialized) {
      this._render();
      this._isInitialized = true;
      this._applyConfig();
    }

    this._startTimer();
    this._setupResizeObserver();
  }

  disconnectedCallback() {
    this._stopTimer();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  getCardSize() {
    return 3;
  }

  _startTimer() {
    this._stopTimer();
    this._tick(false);
    this._timer = setInterval(() => this._tick(false), 1000);
  }

  _stopTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _setupResizeObserver() {
    const wrap = this.shadowRoot.querySelector('.card-container');
    if (!wrap) return;

    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        this._updateDimensions();
      });
      this._resizeObserver.observe(wrap);
    } else {
      window.addEventListener('resize', () => this._updateDimensions());
    }
    this._updateDimensions();
  }

  _updateDimensions() {
    const wrap = this.shadowRoot.querySelector('.card-container');
    if (!wrap) return;
    const w = wrap.clientWidth || 320;

    // Proportional calculation for 4 digits + colon + gaps
    const available = Math.max(180, w - 50);
    const digitWidth = Math.min(88, Math.max(48, Math.floor(available / 4.5)));
    const digitHeight = Math.floor(digitWidth * 1.4);
    const fontSize = Math.floor(digitHeight * 0.76);
    const dotSize = Math.max(5, Math.min(10, Math.floor(digitWidth * 0.12)));
    const dayFontSize = Math.max(15, Math.min(24, Math.floor(w * 0.052)));
    const dateFontSize = Math.max(12, Math.min(17, Math.floor(w * 0.038)));

    wrap.style.setProperty('--digit-w', `${digitWidth}px`);
    wrap.style.setProperty('--digit-h', `${digitHeight}px`);
    wrap.style.setProperty('--digit-font', `${fontSize}px`);
    wrap.style.setProperty('--colon-dot-size', `${dotSize}px`);
    wrap.style.setProperty('--day-font-size', `${dayFontSize}px`);
    wrap.style.setProperty('--date-font-size', `${dateFontSize}px`);
  }

  _applyConfig() {
    const wrap = this.shadowRoot.querySelector('.card-container');
    if (!wrap) return;

    wrap.style.setProperty('--digit-color', this._config.digit_color);
    wrap.style.setProperty('--digit-glow', this._config.digit_glow);

    const colon = this.shadowRoot.querySelector('.colon-box');
    if (colon) {
      if (this._config.blink_colon) {
        colon.classList.add('blinking');
      } else {
        colon.classList.remove('blinking');
      }
    }

    const dateBox = this.shadowRoot.querySelector('.date-wrap');
    if (dateBox) {
      dateBox.style.display = this._config.show_date ? 'flex' : 'none';
    }
  }

  _resolveLanguage() {
    const cfgLang = (this._config.language || 'auto').toLowerCase();
    if (cfgLang === 'pl') return 'pl';
    if (cfgLang === 'en') return 'en';

    // Auto mode: polish if HA language starts with pl, otherwise english
    const haLang = (this._hass?.locale?.language || this._hass?.language || '').toLowerCase();
    if (haLang.startsWith('pl')) {
      return 'pl';
    }
    return 'en';
  }

  _getNowZoned() {
    const tz = this._config.time_zone || this._hass?.config?.time_zone || 'Europe/Warsaw';
    const now = new Date();
    try {
      return new Date(now.toLocaleString('en-US', { timeZone: tz }));
    } catch (e) {
      return now;
    }
  }

  _tick(forceUpdate = false) {
    const d = this._getNowZoned();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');

    const lang = this._resolveLanguage();

    const DNI_PL = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
    const MIESIACE_PL = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];

    const DNI_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const MIESIACE_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const days = lang === 'pl' ? DNI_PL : DNI_EN;
    const months = lang === 'pl' ? MIESIACE_PL : MIESIACE_EN;

    const rawDay = days[d.getDay()];
    const dayName = this._config.uppercase_day ? rawDay.toUpperCase() : (rawDay.charAt(0).toUpperCase() + rawDay.slice(1));
    const dateFull = lang === 'pl'
      ? `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
      : `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

    const newDigits = {
      h1: h[0],
      h2: h[1],
      m1: m[0],
      m2: m[1]
    };

    ['h1', 'h2', 'm1', 'm2'].forEach(slotId => {
      const oldVal = this._lastState[slotId];
      const newVal = newDigits[slotId];

      if (forceUpdate || oldVal === '') {
        this._setDigitInstant(slotId, newVal);
      } else if (oldVal !== newVal) {
        if (this._config.animation) {
          this._animateDigit(slotId, oldVal, newVal);
        } else {
          this._setDigitInstant(slotId, newVal);
        }
      }
    });

    this._lastState.h1 = newDigits.h1;
    this._lastState.h2 = newDigits.h2;
    this._lastState.m1 = newDigits.m1;
    this._lastState.m2 = newDigits.m2;

    if (this._config.show_date) {
      if (forceUpdate || this._lastState.dayName !== dayName) {
        const elDay = this.shadowRoot.querySelector('.day-name');
        if (elDay) elDay.textContent = dayName;
        this._lastState.dayName = dayName;
      }
      if (forceUpdate || this._lastState.dateFull !== dateFull) {
        const elDate = this.shadowRoot.querySelector('.date-full');
        if (elDate) elDate.textContent = dateFull;
        this._lastState.dateFull = dateFull;
      }
    }
  }

  _setDigitInstant(slotId, val) {
    const slot = this.shadowRoot.querySelector(`#slot-${slotId}`);
    if (!slot) return;

    slot.querySelectorAll('.num').forEach(el => {
      el.textContent = val;
    });
    slot.classList.remove('flipping');
  }

  _animateDigit(slotId, oldVal, newVal) {
    const slot = this.shadowRoot.querySelector(`#slot-${slotId}`);
    if (!slot) return;

    const staticTop = slot.querySelector('.static-top .num');
    const staticBottom = slot.querySelector('.static-bottom .num');
    const flapTop = slot.querySelector('.flap-top .num');
    const flapBottom = slot.querySelector('.flap-bottom .num');

    // Setup values for flip
    staticTop.textContent = newVal;       // Revealed underneath as top flap drops
    staticBottom.textContent = oldVal;    // Remains visible until bottom flap lands
    flapTop.textContent = oldVal;         // Drops from 0 to -90 deg
    flapBottom.textContent = newVal;      // Drops from 90 to 0 deg

    slot.classList.remove('flipping');
    // Force reflow
    void slot.offsetWidth;
    slot.classList.add('flipping');

    const onDone = () => {
      slot.removeEventListener('animationend', onDone);
      staticBottom.textContent = newVal;
      slot.classList.remove('flipping');
    };

    const flapB = slot.querySelector('.flap-bottom');
    if (flapB) {
      flapB.addEventListener('animationend', onDone, { once: true });
    } else {
      setTimeout(onDone, 550);
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        ha-card {
          background: rgba(28, 28, 30, 0.65) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.14) !important;
          border-radius: 16px !important;
          padding: 18px 16px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
        }

        .card-container {
          --digit-w: 64px;
          --digit-h: 90px;
          --digit-font: 68px;
          --digit-color: #FFA000;
          --digit-glow: rgba(255, 160, 0, 0.35);
          --colon-dot-size: 8px;
          --day-font-size: 19px;
          --date-font-size: 14px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Clock Row */
        .clock-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
        }

        .digit-pair {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Digit Slot */
        .digit-slot {
          position: relative;
          width: var(--digit-w);
          height: var(--digit-h);
          perspective: 400px;
          -webkit-perspective: 400px;
          border-radius: 10px;
          background: #18191c;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        .card-bg {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          overflow: hidden;
        }

        /* Half Panels */
        .half {
          position: relative;
          width: 100%;
          height: 50%;
          overflow: hidden;
          box-sizing: border-box;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .half.top {
          background: linear-gradient(180deg, #2b2c30 0%, #202124 100%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.7);
          border-radius: 10px 10px 0 0;
        }

        .half.bottom {
          background: linear-gradient(180deg, #1d1e21 0%, #151618 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0 0 10px 10px;
        }

        /* Crease Split */
        .crease {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(10, 10, 12, 0.95);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
          transform: translateY(-50%);
          z-index: 10;
          pointer-events: none;
        }

        /* Number Typography */
        .num {
          position: absolute;
          left: 0;
          right: 0;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", sans-serif;
          font-weight: 700;
          font-size: var(--digit-font);
          line-height: var(--digit-h);
          color: var(--digit-color);
          text-shadow: 0 0 14px var(--digit-glow);
        }

        .half.top .num {
          top: 0;
        }

        .half.bottom .num {
          bottom: 0;
        }

        /* Flaps (Animation) */
        .card-flap {
          position: absolute;
          left: 0;
          right: 0;
          height: 50%;
          overflow: hidden;
          box-sizing: border-box;
          display: none;
          z-index: 5;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }

        .flap-top {
          top: 0;
          transform-origin: bottom center;
          background: linear-gradient(180deg, #2b2c30 0%, #202124 100%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.7);
          border-radius: 10px 10px 0 0;
        }
        .flap-top .num {
          top: 0;
        }

        .flap-bottom {
          top: 50%;
          transform-origin: top center;
          background: linear-gradient(180deg, #1d1e21 0%, #151618 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0 0 10px 10px;
        }
        .flap-bottom .num {
          bottom: 0;
        }

        .digit-slot.flipping .flap-top {
          display: block;
          animation: flipTop 0.5s ease-in forwards;
        }

        .digit-slot.flipping .flap-bottom {
          display: block;
          animation: flipBottom 0.5s ease-out forwards;
        }

        @keyframes flipTop {
          0% {
            transform: rotateX(0deg);
          }
          50% {
            transform: rotateX(-90deg);
          }
          100% {
            transform: rotateX(-90deg);
            opacity: 0;
          }
        }

        @keyframes flipBottom {
          0% {
            transform: rotateX(90deg);
            opacity: 0;
          }
          50% {
            transform: rotateX(90deg);
            opacity: 1;
          }
          100% {
            transform: rotateX(0deg);
            opacity: 1;
          }
        }

        /* Colon */
        .colon-box {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 12px;
          padding: 0 4px;
        }

        .colon-dot {
          width: var(--colon-dot-size);
          height: var(--colon-dot-size);
          border-radius: 50%;
          background: var(--digit-color);
          box-shadow: 0 0 8px var(--digit-glow);
        }

        .colon-box.blinking {
          animation: blinkColon 1s infinite steps(1);
        }

        @keyframes blinkColon {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }

        /* Date Container */
        .date-wrap {
          margin-top: 14px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-align: center;
        }

        .day-name {
          font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", sans-serif;
          font-size: var(--day-font-size);
          font-weight: 800;
          letter-spacing: 2.5px;
          color: #ffffff;
          line-height: 1.2;
        }

        .date-full {
          font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", sans-serif;
          font-size: var(--date-font-size);
          font-weight: 500;
          letter-spacing: 0.6px;
          color: rgba(255, 255, 255, 0.76);
          line-height: 1.2;
        }
      </style>

      <ha-card>
        <div class="card-container">
          <div class="clock-row">
            <div class="digit-pair">
              <div class="digit-slot" id="slot-h1">
                <div class="card-bg">
                  <div class="half top static-top"><span class="num">0</span></div>
                  <div class="half bottom static-bottom"><span class="num">0</span></div>
                </div>
                <div class="crease"></div>
                <div class="card-flap flap-top"><span class="num">0</span></div>
                <div class="card-flap flap-bottom"><span class="num">0</span></div>
              </div>
              <div class="digit-slot" id="slot-h2">
                <div class="card-bg">
                  <div class="half top static-top"><span class="num">0</span></div>
                  <div class="half bottom static-bottom"><span class="num">0</span></div>
                </div>
                <div class="crease"></div>
                <div class="card-flap flap-top"><span class="num">0</span></div>
                <div class="card-flap flap-bottom"><span class="num">0</span></div>
              </div>
            </div>

            <div class="colon-box blinking">
              <div class="colon-dot"></div>
              <div class="colon-dot"></div>
            </div>

            <div class="digit-pair">
              <div class="digit-slot" id="slot-m1">
                <div class="card-bg">
                  <div class="half top static-top"><span class="num">0</span></div>
                  <div class="half bottom static-bottom"><span class="num">0</span></div>
                </div>
                <div class="crease"></div>
                <div class="card-flap flap-top"><span class="num">0</span></div>
                <div class="card-flap flap-bottom"><span class="num">0</span></div>
              </div>
              <div class="digit-slot" id="slot-m2">
                <div class="card-bg">
                  <div class="half top static-top"><span class="num">0</span></div>
                  <div class="half bottom static-bottom"><span class="num">0</span></div>
                </div>
                <div class="crease"></div>
                <div class="card-flap flap-top"><span class="num">0</span></div>
                <div class="card-flap flap-bottom"><span class="num">0</span></div>
              </div>
            </div>
          </div>

          <div class="date-wrap">
            <div class="day-name">---</div>
            <div class="date-full">-- -------- ----</div>
          </div>
        </div>
      </ha-card>
    `;
  }
}

customElements.define('sodom-flip-clock', SodomFlipClock);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'sodom-flip-clock',
  name: 'SODOM Flip Clock',
  description: 'Retro split-flap clock card with animation, blinking colon, and EN/PL auto-detection.'
});
