import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// a known static that writes none of its arguments and hands none on keeps the methods of a holder
// in place (`Object.hasOwn` only reads a key); a static writing one argument copies the others'
// methods onto it (`Object.assign`), so its source loses the this-field narrow
export function viaKeyRead() {
  const holder = {
    items: [1, 2],
    read() {
      return this.items.at(0);
    }
  };
  Object.hasOwn(holder, 'items');
  return holder.read();
}
export function viaCopy(target) {
  const holder = {
    items: [1, 2],
    read() {
      return this.items.includes(1);
    }
  };
  Object.assign(target, holder);
  return holder.read();
}