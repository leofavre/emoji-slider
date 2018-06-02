const template = document.createElement('template');

template.innerHTML = `
  <style>
    @import url("../src/EmojiSlider.css");
  </style>
  <div class="root">
    <slot></slot>
    <div class="bar">
      <div class="thumb">
        <div class="floater">
          <div class="emoji emoji_scaled"></div>
        </div>
        <div class="emoji emoji_fixed"></div>
      </div>
      <div class="slider slider_left"></div>
      <div class="slider slider_right"></div>
    </div>
  </div>
`;

export default template;