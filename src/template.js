const template = document.createElement('template');

template.innerHTML = `
  <style>
    @import url("../src/EmojiSlider.css");
  </style>
  <slot></slot>
  <div class="wrapper">
    <span class="floater">
      <span class="emoji emoji_scale"></span>
    </span>
    <span class="emoji emoji_thumb"></span>
    <span class="bar">
      <span class="bar__area bar__area_left"></span>
      <span class="bar__area bar__area_right"></span>
    </span>
  </div>
`;

export default template;
