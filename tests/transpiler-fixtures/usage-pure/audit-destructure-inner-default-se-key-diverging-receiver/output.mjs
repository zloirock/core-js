import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// SE computed key under an inner-default wrapper, with a diverging conditional receiver. the outer
// receiver resolution must see THROUGH the inner default (`= {}`) to the ternary - so the SE-key gate
// reads the real divergence, keeps the key in the pattern (it runs once) and adds the inline polyfill
let pick = 1;
let calls = 0;
const key = () => {
  calls += 1;
  return 'from';
};
const [{
  Array: {
    [key()]: extracted
  }
} = {}] = [pick ? _globalThis : _Set];