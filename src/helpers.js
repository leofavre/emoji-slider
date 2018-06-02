const parseColor = str => {
  if (typeof str === 'string' && str.slice(0, 4) === 'rgb(') {
    return str
      .slice(4, str.length - 1)
      .split(',')
      .map(value => Number(value.trim()));
  }
  return [];
};

export const getLuminance = str => {
  const [red, green, blue] = parseColor(str);

  return (blue != null)
    ? (red * 3 + blue + green * 4) >> 3
    : undefined;
};
