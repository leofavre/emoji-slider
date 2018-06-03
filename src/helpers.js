const parseCSSProp = (str, method) => {
  const slice = `${method}(`;
  const len = slice.length;

  if (typeof str === 'string' && str.slice(0, len) === slice) {
    return str
      .slice(len, str.length - 1)
      .split(',')
      .map(value => Number(value.trim()));
  }
  return [];
};

const parseColor = str => parseCSSProp(str, 'rgb');

const parseTransform = str => parseCSSProp(str, 'matrix');

export const getLuminance = str => {
  const [red, green, blue] = parseColor(str);

  return (blue != null)
    ? (red * 3 + blue + green * 4) >> 3
    : undefined;
};

export const getRotationInDeg = str => {
  const [argA = 0, argB = 0] = parseTransform(str);
  return Math.round(Math.atan2(argB, argA) * (180 / Math.PI));
};

export const removeClassesStartingWith = (str, element) => {
  const pattern = new RegExp(`( |^)${str}_.*?( |$)`, 'gm');
  element.className = element.className.replace(pattern, '$1');
};
