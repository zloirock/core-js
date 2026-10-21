import _globalThis from "@core-js/pure/actual/global-this";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$seal from "@core-js/pure/actual/object/seal";
import _self from "@core-js/pure/actual/self";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
let n = 0;
let w;
let getPrototypeOf;
export const [{
  of
}] = [_self.Array];
export const [{
  trunc
}] = [_self.Math];
export const [{
  from
}] = [_self.Array];
export const [{
  keys
}] = [null == _globalThis.window ? void 0 : _self.Object];
export const [{
  entries
}] = [(n++, _self).Object];
export const [{
  values
}] = [(w = _self).Object];
[{
  getPrototypeOf
}] = [_self.Object];
export const [[{
  freeze
}]] = [[_self.Object]];
export const [{
  seal
} = {
  seal: _Object$seal
}] = [];
export const [{
  isArray
}] = [_globalThis.Array];
export const getOwnPropertyNames = _Object$getOwnPropertyNames;