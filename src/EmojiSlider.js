import template from './template.js';

import {
  getLuminance,
  getRotationInDeg,
  removeClassesStartingWith
} from './helpers.js';

export class EmojiSlider extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    const select = str => this.shadowRoot.querySelector(`.${str}`);

    this.$root = select('root');
    this.$slider = select('input');
    this.$emojiThumb = select('thumb');
    this.$emojiFixed = select('emoji_fixed');
    this.$emojiScale = select('emoji_scaled');
    this.$sliderLeft = select('area_left');
    this.$sliderRight = select('area_right');

    this.handleSlide = this.handleSlide.bind(this);
    this.handleSlideEnd = this.handleSlideEnd.bind(this);
  }

  static get observedAttributes () {
    return ['rate', 'emoji', 'style', 'class'];
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

      if (attrName === 'style' || attrName === 'class') {
        this.updateAppearance();
      }
    }
  }

  connectedCallback () {
    this.$slider.addEventListener('input', this.handleSlide);
    this.$slider.addEventListener('change', this.handleSlideEnd);
    this.$slider.addEventListener('mouseout', this.handleSlideEnd);
    this.$slider.addEventListener('touchend', this.handleSlideEnd);

    this.upgradeProperty('rate');
    this.upgradeProperty('emoji');

    this.$slider.value = this.rate;

    this.updateEmoji();
    this.updateRate();
    this.updateAppearance();

    setTimeout(() => {
      this.applyState('started');
    }, 100);
  }

  upgradeProperty (propName) {
    if (this.hasOwnProperty(propName)) {
      let value = this[propName];
      delete this[propName];
      this[propName] = value;
    }
  }

  applyState (state) {
    this.$root.classList.add(`root_${state}`);
  }

  removeState (state) {
    this.$root.classList.remove(`root_${state}`);
  }

  applyTheme (theme) {
    removeClassesStartingWith('root_theme_', this.$root);
    this.$root.classList.add(`root_theme_${theme}`);
  }

  updateAppearance () {
    const computedStyles = window.getComputedStyle(this, null);

    /* update theme */

    const bgColor = computedStyles.getPropertyValue('background-color');
    const luminance = getLuminance(bgColor);

    if (luminance < 95) {
      this.applyTheme('dark');
    } else if (luminance < 170) {
      this.applyTheme('light');
    } else {
      this.applyTheme('white');
    }

    /* update rotation */

    const transform = computedStyles.getPropertyValue('transform');
    const rotation = getRotationInDeg(transform);
    this.$emojiThumb.style.transform = `rotate(${rotation * -1}deg)`;
    this.$emojiFixed.style.transform = `rotate(${rotation}deg)`;
  }

  updateEmoji () {
    this.$emojiFixed.innerHTML = this.emoji;
    this.$emojiScale.innerHTML = this.emoji;
  }

  updateRate () {
    this.$emojiThumb.style.left = `${this.rate}%`;
    this.$emojiScale.style.fontSize = `${32 + this.rate}px`;
    this.$sliderLeft.style.width = `${this.rate}%`;
    this.$sliderRight.style.width = `${100 - this.rate}%`;
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

  handleSlide (evt) {
    this.applyState('active');
    this.rate = evt.target.value;
  }

  handleSlideEnd () {
    this.removeState('active');

    if (this.rate !== this.previousRate) {
      this.dispatchEventAndMethod('rate', {
        rate: this.rate
      });
    }

    this.previousRate = this.rate;
  }

  disconnectedCallback () {
    this.$slider.removeEventListener('input', this.handleSlide);
    this.$slider.removeEventListener('change', this.handleSlideEnd);
    this.$slider.removeEventListener('mouseout', this.handleSlideEnd);
    this.$slider.removeEventListener('touchend', this.handleSlideEnd);
  }
}
