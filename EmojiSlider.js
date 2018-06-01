export class EmojiSlider extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes () {
    return ['rate'];
  }
};
