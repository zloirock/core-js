import _Promise from "@core-js/pure/actual/promise/constructor";
export function arms() {
  let value;
  if (typeof _Promise != 'undefined') {
    value = 'abc';
  } else {
    value = [1];
  }
  return value.concat('d');
}