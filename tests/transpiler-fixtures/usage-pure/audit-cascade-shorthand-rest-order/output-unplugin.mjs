// An assignment pattern over the realm beside an object rest: the residual keeps the rest and its
// exclusions, and the claimed static nested under it is written after the residual. A global copied
// back into its own slot (`Symbol`) takes its whole entry there, first; a constructor bound beside the
// rest takes its ponyfill, and a static read later off that binding takes the static's own entry.
import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Symbol from "@core-js/pure/actual/symbol";

var _unused, _unused2;

Symbol = _Symbol;
({ Symbol: _unused, Array: _unused2, ...rest } = _globalThis);
from = _Array$from;

export const viaShorthandRest = [from([1]), rest];

let al;
var _unused3;

al = _Iterator;
({ Iterator: _unused3, ...others } = _globalThis);

export const viaAliasedRest = [_Iterator$from([0]), others];