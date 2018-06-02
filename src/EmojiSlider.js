import template from './template.js';
import { getLuminance } from './helpers.js';

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

    setTimeout(() => {
      this.$root.classList.add('root_started');
      this.setTheme();
    }, 100);
  }

  setTheme () {
    const bgColor = window.getComputedStyle(this, null)
      .getPropertyValue('background-color');

    const luminance = getLuminance(bgColor);

    let theme;

    if (luminance < 112) {
      theme = 'root_theme_dark';
    } else if (luminance < 224) {
      theme = 'root_theme_light';
    } else {
      theme = 'root_theme_white';
    }

    this.$root.classList.add(theme);
  }

  updateEmoji () {
    const emoji = this.getAttribute('emoji') || '😍';
    this.$emojiFixed.innerHTML = emoji;
    this.$emojiScale.innerHTML = emoji;
  }

  updateRate () {
    this.$emojiThumb.style = '';
    this.$emojiThumb.style.left = `${this.rate}%`;

    this.$emojiScale.style = '';
    this.$emojiScale.style.fontSize = `${32 + this.rate}px`;

    this.$sliderLeft.style.clipPath = `polygon(0 0, ${this.rate}% 0, ${this.rate}% 100%, 0% 100%)`;
    this.$sliderRight.style.clipPath = `polygon(${this.rate}% 0, 100% 0, 100% 100%, ${this.rate}% 100%)`;
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

    this.$root.classList.add('root_active');
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
    this.$root.classList.remove('root_active');
    this.dispatchEventAndMethod('rate', { rate: this.rate });

    document.removeEventListener('mouseup', this.handleSlideEnd);
    document.removeEventListener('mousemove', this.handleSlide);
  }

  disconnectedCallback () {
    this.$root.classList.remove('root_started');
    this.$emojiThumb.removeEventListener('mousedown', this.handleSlideStart);
    document.removeEventListener('mouseup', this.handleSlideEnd);
    document.removeEventListener('mousemove', this.handleSlide);
  }
}
