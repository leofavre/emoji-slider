const template = document.createElement('template');

template.innerHTML = `
  <style>
    @import url("../src/EmojiSlider.css");
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

export default template;
