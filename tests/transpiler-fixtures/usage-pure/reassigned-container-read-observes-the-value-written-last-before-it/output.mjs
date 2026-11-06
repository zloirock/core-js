import _Map from "@core-js/pure/actual/map/constructor";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Reflect from "@core-js/pure/actual/reflect";
import _Symbol from "@core-js/pure/actual/symbol";
// Each container read observes the last preceding write, including self and cross assignments.
// Native nested reads keep full constructor surfaces; direct static reads retain independent claims.
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
  k: _Reflect
};
const {
  k: {
    ownKeys: viaIdentityThenReal
  }
} = wIR;
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
} = wSh;
export { beforeWrite, viaSelfAssign, viaCrossWrite, viaIdentityThenReal, viaShadowClean };