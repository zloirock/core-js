import _globalThis from "@core-js/pure/actual/global-this";
// the optional-call twin drives the guarded-combine emission through the same guard
let y2 = {};
switch (_globalThis.findLast?.([1, 2], v => v > 1)) {
  case 1:
    let globalThis = y2;
    break;
}
export { y2 };