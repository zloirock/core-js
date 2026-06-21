import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// TS `as` cast around a bare proxy-global as the combined-chain method receiver:
// `(globalThis as any).flat?.().includes(1)`. the receiver is substituted THROUGH the cast to
// `_globalThis` - keeping it verbatim would strand a raw global after TS strip (ReferenceError
// on engines lacking globalThis). both plugins peel Paren / Chain / TS and substitute it the same way
null == (_ref2 = _flatMaybeArray(_ref = _globalThis)) ? void 0 : _includes(_ref3 = _ref2.call(_ref)).call(_ref3, 1);