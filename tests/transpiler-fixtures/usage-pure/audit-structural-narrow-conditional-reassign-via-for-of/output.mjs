import _includes from "@core-js/pure/actual/instance/includes";
export function viaForOf(c, items) {
  for (let x of items) {
    if (c) x = 'hello';
    return _includes(x).call(x, 2);
  }
}