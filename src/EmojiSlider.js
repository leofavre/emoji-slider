import template from './template.js';
import { getLuminance } from './helpers.js';

export class EmojiSlider extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.$wrapper = this.shadowRoot.querySelector('.wrapper');
    this.$emojiThumb = this.shadowRoot.querySelector('.emoji__thumb');
    this.$emojiScale = this.shadowRoot.querySelector('.emoji__scale');
    this.$barLeft = this.shadowRoot.querySelector('.bar__area_left');
    this.$barRight = this.shadowRoot.querySelector('.bar__area_right');

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
      this.$wrapper.classList.add('wrapper_started');
      this.setTheme();
    }, 100);
  }

  setTheme () {
    const bgColor = window.getComputedStyle(this, null)
      .getPropertyValue('background-color');

    const luminance = getLuminance(bgColor);

    let theme;

    if (luminance < 112) {
      theme = 'wrapper_theme_dark';
    } else if (luminance < 234) {
      theme = 'wrapper_theme_light';
    } else {
      theme = 'wrapper_theme_white';
    }

    this.$wrapper.classList.add(theme);
  }

  updateEmoji () {
    const emoji = this.getAttribute('emoji') || '😍';
    this.$emojiThumb.innerHTML = emoji;
    this.$emojiScale.innerHTML = emoji;
  }

  updateRate () {
    this.$emojiThumb.style = '';
    this.$emojiThumb.style.left = `${this.rate}%`;

    this.$emojiScale.style = '';
    this.$emojiScale.style.left = `${this.rate}%`;
    this.$emojiScale.style.bottom = `${0.5 - (0.5 * this.rate / 100)}em`;
    this.$emojiScale.style.fontSize = `${2 + this.rate / 20}em`;

    this.$barLeft.style.width = `${this.rate}%`;
    this.$barRight.style.width = `${100 - this.rate}%`;
  }

  handleSlideStart (evt) {
    this.startX = evt.pageX;
    this.startRate = this.rate;

    this.$wrapper.classList.add('wrapper_active');
    document.addEventListener('mousemove', this.handleSlide);
    document.addEventListener('mouseup', this.handleSlideEnd);
  }

  handleSlide (evt) {
    const maxRangeInPixels = this.$wrapper.offsetWidth;

    const rate = this.startRate +
      (100 * (evt.pageX - this.startX) / maxRangeInPixels);

    this.rate = Math.min(100, Math.max(0, rate)).toFixed(1);
  }

  handleSlideEnd (evt) {
    this.$wrapper.classList.remove('wrapper_active');
    document.removeEventListener('mouseup', this.handleSlideEnd);
    document.removeEventListener('mousemove', this.handleSlide);
  }

  disconnectedCallback () {
    this.$wrapper.classList.remove('wrapper_started');
    this.$emojiThumb.removeEventListener('mousedown', this.handleSlideStart);
    document.removeEventListener('mouseup', this.handleSlideEnd);
    document.removeEventListener('mousemove', this.handleSlide);
  }
}
