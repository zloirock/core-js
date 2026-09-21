import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// A static-valued pattern reads the ponyfill, which is always defined.
// Its default stays dead; an instance-valued pattern keeps its runtime default guard.
const {
  of: [viaCtor = ")"] = []
} = {
  of: _Array$of
};
const {
  Array: {
    of: [viaHop] = []
  }
} = {
  Array: {
    of: _Array$of
  }
};
const {
  Array: {
    of: [viaOuterDefault = ")"] = []
  } = {}
} = {
  Array: {
    of: _Array$of
  }
};
let viaAssign;
[viaAssign = ")"] = _Array$of;
const {
  of: {
    foo: viaObjectLeft
  } = {}
} = {
  of: _Array$of
};
const src = [1, [2]];
const [viaInstance = 0] = (_ref = _atMaybeArray(src)) === void 0 ? [] : _ref;
const {
  Array: {
    of: [rawSlot]
  }
} = {
  Array: {
    of: _Array$of
  }
};
export { viaCtor, viaHop, viaOuterDefault, viaAssign, viaObjectLeft, viaInstance, rawSlot };