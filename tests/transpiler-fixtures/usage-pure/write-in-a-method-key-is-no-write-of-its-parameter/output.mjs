import _Array$of from "@core-js/pure/actual/array/of";
// a write in a method's computed key writes the binding around the class, even where the method names a
// parameter after it: the key runs outside the method
let key = 'from';
export class Lists {
  [(key = 'of', 'make')](key) {
    return key;
  }
}
export const made = _Array$of(1);