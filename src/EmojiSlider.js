import template from './template.js';
import { getLuminance } from './helpers.js';

const THEMES = [ 'white', 'light', 'dark' ];

export class EmojiSlider extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    const select = str => this.shadowRoot.querySelector(`.${str}`);

    this.$root = select('root');
    this.$emojiThumb = select('thumb');
    this.$emojiFixed = select('emoji_fixed');
    this.$emojiScale = select('emoji_scaled');
    this.$sliderLeft = select('area_left');
    this.$sliderRight = select('area_right');

    this.handleSlideStart = this.handleSlideStart.bind(this);
    this.handleSlide = this.handleSlide.bind(this);
    this.handleSlideEnd = this.handleSlideEnd.bind(this);
  }

  static get observedAttributes () {
    return ['rate', 'emoji'];
  }

  get rate () {
    return Number(this.getAttribute('rate')) || 0;
  }

  set rate (value) {
    this.setAttribute('rate', value);
  }

  get emoji () {
    return this.getAttribute('emoji') || '😍';
  }

  set emoji (value) {
    this.setAttribute('emoji', value);
  }

  attributeChangedCallback (attrName, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (attrName === 'rate') {
        this.updateRate();
      }

      if (attrName === 'emoji') {
        this.updateEmoji();
      }
    }
  }

  connectedCallback () {
    this.$emojiThumb.addEventListener('mousedown', this.handleSlideStart);

    this.updateEmoji();
    this.updateRate();
    this.updateTheme();
    this.observeStyleChange();

    setTimeout(() => {
      this.applyState('started');
    }, 100);
  }

  observeStyleChange () {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        this.updateTheme();
      });
    });

    var observerConfig = {
      attributes: true,
      attributeFilter: ['style', 'class']
    };

    this.observer.observe(this, observerConfig);
  }

  stopObservingStyleChanges () {
    this.observer.disconnect();
  }

  applyState (state) {
    this.$root.classList.add(`root_${state}`);
  }

  removeState (state) {
    this.$root.classList.remove(`root_${state}`);
  }

  applyTheme (theme) {
    this.$root.classList.add(`root_theme_${theme}`);
  }

  removeTheme (theme) {
    this.$root.classList.remove(`root_theme_${theme}`);
  }

  updateTheme () {
    const bgColor = window.getComputedStyle(this, null)
      .getPropertyValue('background-color');

    const luminance = getLuminance(bgColor);

    THEMES.forEach(this.removeTheme.bind(this));

    if (luminance < 95) {
      this.applyTheme('dark');
    } else if (luminance < 190) {
      this.applyTheme('light');
    } else {
      this.applyTheme('white');
    }
  }

  updateEmoji () {
    this.$emojiFixed.innerHTML = this.emoji;
    this.$emojiScale.innerHTML = this.emoji;
  }

  updateRate () {
    this.$emojiThumb.style = '';
    this.$emojiThumb.style.left = `${this.rate}%`;

    this.$emojiScale.style = '';
    this.$emojiScale.style.fontSize = `${32 + this.rate}px`;

    this.$sliderLeft.style.clipPath =
      `polygon(0 0, ${this.rate}% 0, ${this.rate}% 100%, 0% 100%)`;

    this.$sliderRight.style.clipPath =
      `polygon(${this.rate}% 0, 100% 0, 100% 100%, ${this.rate}% 100%)`;
  }

  dispatchEventAndMethod (evtName, detail) {
    const event = new CustomEvent(evtName, {
      bubbles: true,
      detail
    });

    const method = this[`on${evtName}`];

    this.dispatchEvent(event);

    if (typeof method === 'function') {
      method(event);
    }
  }

  handleSlideStart (evt) {
    this.startX = evt.pageX;
    this.startRate = this.rate;

    this.applyState('active');
    document.addEventListener('mousemove', this.handleSlide);
    document.addEventListener('mouseup', this.handleSlideEnd);
  }

  handleSlide (evt) {
    const maxRangeInPixels = this.$root.offsetWidth;

    const rate = this.startRate +
      (100 * (evt.pageX - this.startX) / maxRangeInPixels);

    this.rate = Math.min(100, Math.max(0, rate)).toFixed(1);
  }

  handleSlideEnd (evt) {
    this.removeState('active');
    this.dispatchEventAndMethod('rate', { rate: this.rate });
    document.removeEventListener('mouseup', this.handleSlideEnd);
    document.removeEventListener('mousemove', this.handleSlide);
  }

  disconnectedCallback () {
    this.removeState('started');
    this.stopObservingStyleChanges();
    this.$emojiThumb.removeEventListener('mousedown', this.handleSlideStart);
    document.removeEventListener('mouseup', this.handleSlideEnd);
    document.removeEventListener('mousemove', this.handleSlide);
  }
}
