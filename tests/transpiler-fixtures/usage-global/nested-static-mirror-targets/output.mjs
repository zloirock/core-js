import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// Nested and member static targets retain their original assignment syntax.
// Global injection covers the static reads and the calls inside computed keys.
const events = [];
const pureFrom = Array.from;
const box = {};
let from, bind;
let defaults = 0;
({
  Array: {
    [(events.push('first'), 'from')]: from
  },
  Object: {
    keys: {
      [(events.push('x'.at(0)), 'bind')]: bind
    }
  }
} = globalThis);
({
  Array: {
    [(events.push('second'), 'from')]: from
  },
  Object: {
    keys: box[events.push('y'.at(0)), 'value']
  }
} = globalThis);
({
  Array: {
    [(events.push('third'), 'from')]: from
  },
  Object: {
    keys: box[events.push('z'.at(0)), 'value'] = (defaults++, null)
  }
} = globalThis);
export const result = [from([7])[0], from === pureFrom, typeof bind, typeof box.value, defaults, events];
function observe() {
  try {
    events.push(typeof boundFrom);
  } catch (error) {
    events.push(error.name);
  }
}
const {
  Array: {
    [(events.push('binding'), observe(), 'from')]: boundFrom
  },
  Object: {
    keys: {
      [(events.push('a'.at(0)), 'bind')]: boundBind
    }
  }
} = globalThis;
function read({
  Array: {
    [(events.push('parameter'), 'from')]: method
  },
  Object: {
    keys: {
      [(events.push('b'.at(0)), 'bind')]: bound
    }
  }
} = globalThis) {
  return [method([8])[0], typeof bound];
}
export const bindings = [boundFrom([7])[0], typeof boundBind, read()];