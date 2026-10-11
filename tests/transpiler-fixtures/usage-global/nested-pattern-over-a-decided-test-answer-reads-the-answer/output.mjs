import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a nested pattern over a selection the build decides to its test's own answer - an `&&` whose test
// fails, a `||` / `??` whose test holds - reads off that answer: the operand it skips loads nothing for
// a static read through it, at any depth, beside a sibling, under an array level or off the realm. a
// test that runs the `&&` right loads the static the pattern reads off that right
export const {
  C: {
    groupBy
  }
} = typeof Symbol == 'undefined' && {
  C: Map
};
const {
  A: {
    B: {
      isInteger
    }
  }
} = typeof Symbol == 'undefined' && {
  A: {
    B: Number
  }
};
let {
  C: {
    allSettled
  },
  D
} = typeof Symbol == 'undefined' && {
  C: Promise,
  D: 1
};
export const {
  C: [{
    fromEntries
  }]
} = typeof Symbol == 'undefined' && {
  C: [Object]
};
export const {
  Reflect: {
    ownKeys
  }
} = typeof Symbol != 'undefined' || globalThis;
export const {
  String: {
    raw
  }
} = typeof Symbol != 'undefined' ?? self;
export const {
  C: {
    trunc
  }
} = typeof Symbol != 'undefined' && {
  C: Math
};
export { isInteger, allSettled, D };