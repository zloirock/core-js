import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.values";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.keys";
import "core-js/modules/web.dom-collections.values";
// the global counterpart: the pattern stays as written, so its bindings never leave the scope, and
// each later read takes the family of the write before it - an array for one, a string for the other
let [{
  w: {
    values
  }
}] = r;
values = [1, 2];
export const a = values.at(0);
let [{
  v: {
    keys
  }
}] = s;
keys = 'text';
export const b = keys.includes('x');