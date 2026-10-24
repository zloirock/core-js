function nested(source) {
  {
    if (typeof Promise != 'undefined') {
      return 'abc';
    }
  }
  return source;
}
export const fromNested = nested(input).concat('d');
