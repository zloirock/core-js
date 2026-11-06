import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A paired computed getter supplies the prefix of an inner setter-only default.
// The getter runs once, and only the array default supplies includes.
const key = "wrap";
for (const {
  wrap: {
    data: {
      includes
    } = [8, 9]
  }
} of [{
  get [key]() {
    return {
      set data(value) {}
    };
  },
  set wrap(value) {}
}]) {
  use(includes.call([8, 9], 9));
}