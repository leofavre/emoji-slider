const template = document.createElement('template');

template.innerHTML = `
  <style>
    :host {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-family: sans-serif;
      font-size: 19px;
      font-weight: 400;
      letter-spacing: 0.01em;
    
      display: inline-flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
    
      min-width: 11em;
      padding: 1.5em 1.625em 2.325em;
      border-radius: 0.5em;
      background: #fff;
    
      user-select: none;
    }
    
    /* wrapper */
    
    .wrapper {
      position: relative;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    
    .wrapper,
    .wrapper_theme_white {
      color: var(--emoji-slider-text-color, #909);
    }
    
    .wrapper_theme_light,
    .wrapper_theme_dark {
      color: var(--emoji-slider-text-color, #fff);
    }
    
    /* bar */
    
    .bar {
      position: relative;
      display: block;
      margin-top: 1.8em;
      width: 100%;
      height: 0.5em;
      border-radius: 0.5em;
    }
    
    .bar__area {
      position: absolute;
      top: 0;
      height: 100%;
    }
    
    .bar__area_right {
      right: 0;
      border-radius: 0 0.25em 0.25em 0;
    }
    
    .bar__area_right,
    .wrapper_theme_white .bar__area_right,
    .wrapper_theme_light .bar__area_right {
      background: rgba(0, 0, 0, 0.2);
    }
    
    .wrapper_theme_dark .bar__area_right {
      background: rgb(255, 255, 255, 0.3);
    }
    
    .bar__area_left {
      left: 0;
      border-radius: 0.25em 0 0 0.25em;
    }
    
    .wrapper_theme_white .bar__area_left {
      background: var(--emoji-slider-bar-color, #909);
    }
    
    .bar__area_left,
    .wrapper_theme_light .bar__area_left,
    .wrapper_theme_dark .bar__area_left {
      background: var(--emoji-slider-bar-color, #fff);
    }
    
    /* floater */
    
    .floater {
      position: relative;
      display: block;
      top: -20em;
      opacity: 0;
      transition: top 1s ease-in, opacity 0.3s 0.7s ease-in;
    }
    
    .wrapper_active .floater {
      top: 0;
      opacity: 1;
      animation: float 2.2s ease-in-out infinite;
      transition: top 0s;
    }
    
    @keyframes float {
      0% {
        transform: translateY(0.3em);
      }
      50% {
        transform: translateY(0em);
      }
      100% {
        transform: translateY(0.3em);
      }
    }
    
    /* emoji */
    
    .emoji {
      position: absolute;
      cursor: pointer;
      user-select: none;
    
      display: flex;
      flex-flow: row nowrap;
      justify-content: center;
    
      left: 0%; /* changed by javascript */
      width: 0;
      height: 0;
    
      font-size: 2em;
      z-index: 2;
    }
    
    .emoji__thumb {
      top: 50%;
      align-items: center;
    }
    
    .emoji__scale {
      bottom: 0.5em; /* changed by javascript */
      align-items: flex-end;
      opacity: 0;
    }
    
    .wrapper_started .emoji__scale {
      transition: opacity 0.2s 2s;
    }
    
    .wrapper_active .emoji__scale {
      opacity: 1;
      transition: opacity 0s;
    }
  </style>
  <div class="wrapper">
    <slot></slot>
    <span class="bar">
      <span class="floater">
        <span class="emoji emoji__scale"></span>
      </span>
      <span class="emoji emoji__thumb"></span>
      <span class="bar__area bar__area_left"></span>
      <span class="bar__area bar__area_right"></span>
    </span>
  </div>
`;

const parseColor = str => {
  if (typeof str === 'string' && str.slice(0, 4) === 'rgb(') {
    return str
      .slice(4, str.length - 1)
      .split(',')
      .map(value => Number(value.trim()));
  }
  return [];
};

const getLuminance = str => {
  const [red, green, blue] = parseColor(str);

  return (blue != null)
    ? (red * 3 + blue + green * 4) >> 3
    : undefined;
};

class EmojiSlider extends HTMLElement {
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

window.customElements.define('emoji-slider', EmojiSlider);
