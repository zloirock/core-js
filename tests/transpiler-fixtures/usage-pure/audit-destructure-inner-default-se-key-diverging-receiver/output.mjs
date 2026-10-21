import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims.
let pick = 1;
let calls = 0;
const key = () => {
  calls += 1;
  return 'from';
};
const k = tag => (calls += 1, tag);
const [,] = [_globalThis];
const {
  Array: {}
} = _globalThis;
const extracted = (key(), _Array$from);
const [,] = [_globalThis];
const {
  Array: {}
} = _globalThis;
const noDefault = (key(), _Array$from);
const {
  Array: {
    [key()]: noWrapper
  }
} = {
  Array: {
    from: _Array$from
  }
};
const {
  Array: {
    [key()]: valueDefault
  }
} = {
  Array: {
    from: _Array$from
  }
};
const {
  Array: {
    [k('from')]: viaIdentity
  }
} = {
  Array: {
    from: _Array$from
  }
};
const [,] = [_globalThis];
const {
  Array: {}
} = _globalThis;
const literalKey = (calls += 1, _Array$from);
export { extracted, noDefault, noWrapper, valueDefault, viaIdentity, literalKey, calls };