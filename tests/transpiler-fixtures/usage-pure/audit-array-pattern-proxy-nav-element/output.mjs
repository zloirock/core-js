import _globalThis from "@core-js/pure/actual/global-this";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$seal from "@core-js/pure/actual/object/seal";
import _self from "@core-js/pure/actual/self";
// Array-contained navigation keeps its native slot boundaries, including optional and stored receivers.
// Receiver defaults and other independently supported static routes retain their own claims.
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
}] = [null == _globalThis.window ? void 0 : {
  keys: _Object$keys
}];
export const [{
  entries
}] = [(n++, _self).Object];
export const [{
  values
}] = [(w = _self).Object];
// The assignment-form wrapper retains its native static read.
[{
  getPrototypeOf
}] = [_self.Object];
// An additional array level retains the same native static boundary.
export const [[{
  freeze
}]] = [[_self.Object]];
// An absent element evaluates its receiver default, whose supported static is served.
export const [{
  seal
} = {
  seal: _Object$seal
}] = [];
// A direct constructor member inside an array remains a native static source.
export const [{
  isArray
}] = [_globalThis.Array];
// The flat object-pattern twin keeps its direct static extraction.
export const getOwnPropertyNames = _Object$getOwnPropertyNames;