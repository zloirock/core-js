import _Map from "@core-js/pure/actual/map/constructor";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
import _Reflect from "@core-js/pure/actual/reflect";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _String$raw from "@core-js/pure/actual/string/raw";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// a reassigned container's read observes the value written last before it: a write after the read leaves
// the init, an identity self-assign is no write, a cross-write captures what it reads at its own assignment,
// an identity write beside a real one leaves the real one dominating, and an inner shadow's write never
// reaches the outer binding - pure resolves each read to that one value
let rw4 = {
  a: Object
};
const beforeWrite = _Object$keys;
rw4 = {
  a: _Map
};
let rw8 = {
  m: Object
};
rw8 = rw8;
const {
  m: {
    values: viaSelfAssign
  }
} = {
  m: {
    values: _Object$values
  }
};
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
} = {
  x: {
    raw: _String$raw
  }
};
let wIR = {
  k: Object
};
wIR = wIR;
wIR = {
  k: _Reflect
};
const {
  k: {
    ownKeys: viaIdentityThenReal
  }
} = {
  k: {
    ownKeys: _Reflect$ownKeys
  }
};
let wSh = {
  y: _Symbol
};
{
  let wSh = null;
  void wSh;
}
const {
  y: {
    asyncIterator: viaShadowClean
  }
} = {
  y: {
    asyncIterator: _Symbol$asyncIterator
  }
};
export { beforeWrite, viaSelfAssign, viaCrossWrite, viaIdentityThenReal, viaShadowClean };