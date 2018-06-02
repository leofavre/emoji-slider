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
    this.$input = select('input');
    this.$emojiThumb = select('thumb');
    this.$emojiFixed = select('emoji_fixed');
    this.$emojiScale = select('emoji_scaled');
    this.$sliderLeft = select('area_left');
    this.$sliderRight = select('area_right');
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
    this.$input.addEventListener('mousedown', this.handleSlideStart.bind(this));
    this.$input.addEventListener('input', this.handleSlide.bind(this));
    this.$input.addEventListener('mouseup', this.handleSlideEnd.bind(this));
    this.$input.value = this.rate;

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
      this.applyTheme(THEMES[2]);
    } else if (luminance < 190) {
      this.applyTheme(THEMES[1]);
    } else {
      this.applyTheme(THEMES[0]);
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
    this.applyState('active');
  }

  handleSlide (evt) {
    this.rate = evt.target.value;
  }

  handleSlideEnd (evt) {
    this.removeState('active');
    this.dispatchEventAndMethod('rate', { rate: evt.target.value });
  }

  disconnectedCallback () {
    this.stopObservingStyleChanges();
    this.$input.removeEventListener('mousedown', this.handleSlideEnd);
    this.$input.removeEventListener('input', this.handleSlide);
    this.$input.removeEventListener('mouseup', this.handleSlideEnd);
  }
}
