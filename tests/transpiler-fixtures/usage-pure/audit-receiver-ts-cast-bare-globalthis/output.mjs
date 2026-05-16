import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// `(globalThis as any).flat?.(0);` - TS `as` cast around bare proxy-global Identifier.
// receiver source dispatch must peel TS_EXPR_WRAPPERS (alongside Paren / Chain) at the
// top of receiverObj so the direct-Identifier path resolves through the cast. parallel
// shape to the paren-wrapped bare case but with a different transparent-wrapper type.
_flatMaybeArray(_ref = _globalThis)?.call(_ref, 0);