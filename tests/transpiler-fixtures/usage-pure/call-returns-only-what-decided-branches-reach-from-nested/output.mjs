import _Promise from "@core-js/pure/actual/promise/constructor";
function nested(source) {
  {
    if (typeof _Promise != 'undefined') {
      return 'abc';
    }
  }
  return source;
}
export const fromNested = nested(input).concat('d');