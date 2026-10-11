// a write in a method's computed key writes the binding around the class, even where the method names a
// parameter after it: the key runs outside the method
let key = 'from';
export class Lists {
  [(key = 'of', 'make')](key) {
    return key;
  }
}
export const made = Array[key](1);
