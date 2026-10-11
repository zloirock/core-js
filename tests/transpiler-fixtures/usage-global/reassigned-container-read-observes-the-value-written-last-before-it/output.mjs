import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// a reassigned container's read observes the value written last before it: a write after the read leaves
// the init, an identity self-assign is no write, a cross-write captures what it reads at its own assignment,
// an identity write beside a real one leaves the real one dominating, and an inner shadow's write never
// reaches the outer binding - each static loads for that one value alone
let rw4 = {
  a: Object
};
const {
  keys: beforeWrite
} = rw4.a;
rw4 = {
  a: Map
};
let rw8 = {
  m: Object
};
rw8 = rw8;
const {
  m: {
    values: viaSelfAssign
  }
} = rw8;
let ma = {
  x: Object
};
let mb = {
  x: String
};
ma = mb;
mb = ma;
const {
  x: {
    raw: viaCrossWrite
  }
} = ma;
let wIR = {
  k: Object
};
wIR = wIR;
wIR = {
  k: Reflect
};
const {
  k: {
    ownKeys: viaIdentityThenReal
  }
} = wIR;
let wSh = {
  y: Symbol
};
{
  let wSh = null;
  void wSh;
}
const {
  y: {
    asyncIterator: viaShadowClean
  }
} = wSh;
export { beforeWrite, viaSelfAssign, viaCrossWrite, viaIdentityThenReal, viaShadowClean };