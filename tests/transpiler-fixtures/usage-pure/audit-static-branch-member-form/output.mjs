import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _entries from "@core-js/pure/actual/instance/entries";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise from "@core-js/pure/actual/promise";
var _ref, _ref2, _ref3;
// usage-pure twin of the branching-static member forms: pure substitutes no branching static member, so
// the reads stay raw but for the bare constructor identifiers each branch substitutes on its own - with
// the whole entry, whose statics the raw read then finds - and an arm core-js ships no replacement of,
// whose static the identity guard serves off the captured selection, a key any receiver may carry as an
// instance method (`entries`) taking that dispatch in the raw branch
export const viaTernary = (_ref = _globalThis.cond ? Array : _Iterator, _ref === Array ? _Array$from([1]) : _ref.from([1]));
export const viaLogicalOr = (_globalThis.maybe || _Promise).try;
export const viaNullish = (_ref2 = _globalThis.maybe ?? Object, _ref2 === Object ? _Object$entries({}) : _entries(_ref2).call(_ref2, {}));
export const viaIn = 'groupBy' in (_globalThis.cond ? _Map : Object);
export const viaNested = (_ref3 = _globalThis.cond ? Number : _globalThis.deep ? Math : Object, _ref3 === Object ? _Object$keys : _ref3.keys);
// a zero-arg IIFE returning the branching receiver keeps its read native: a selection a call returns
// is no guard's (its arms still substitute on their own)
export const viaIife = (() => _globalThis.cond ? Array : _Iterator)().fromAsync;