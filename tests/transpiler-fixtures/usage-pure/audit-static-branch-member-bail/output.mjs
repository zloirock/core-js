import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// usage-pure twin of the branching-static member forms: the branch enumeration is a
// usage-global side-effect-import mechanism; pure keeps its bail (substituting a branching
// static member is a separate design decision), so the reads stay raw except the bare
// constructor identifiers each branch substitutes on its own
export const viaTernary = (_globalThis.cond ? Array : _Iterator).from([1]);
export const viaLogicalOr = (_globalThis.maybe || _Promise).try;
export const viaIn = 'groupBy' in (_globalThis.cond ? _Map : Object);