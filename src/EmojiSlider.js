import template from './template.js';

export class EmojiSlider extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.$wrapper = this.shadowRoot.querySelector('.wrapper');
    this.$emojiThumb = this.shadowRoot.querySelector('.emoji_thumb');
    this.$emojiScale = this.shadowRoot.querySelector('.emoji_scale');
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

    this.$emojiScale.style.transition = 'opacity 0s';

    this.setTimeout(() => {
      this.$emojiScale.style = '';
    }, 50);
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
    this.$emojiScale.style.bottom = `${0.35 - (0.35 * this.rate / 100)}em`;
    this.$emojiScale.style.fontSize = `${2 + this.rate / 25}em`;

    this.$barLeft.style.width = `${this.rate}%`;
    this.$barRight.style.width = `${100 - this.rate}%`;
  }

  handleSlideStart (evt) {
    this.startX = evt.pageX;
    this.startRate = this.rate;

    this.$emojiScale.classList.add('emoji_active');
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
    this.$emojiScale.classList.remove('emoji_active');
    document.removeEventListener('mouseup', this.handleSlideEnd);
    document.removeEventListener('mousemove', this.handleSlide);
  }

  disconnectedCallback () {
    this.$emojiThumb.removeEventListener('mousedown', this.handleSlideStart);
    document.removeEventListener('mouseup', this.handleSlideEnd);
    document.removeEventListener('mousemove', this.handleSlide);
  }
}
