import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
// a realm member the source WRITES - assigns, deletes, destructures into, iterates into - names the slot the
// operator lands on, not the realm read through it: its receiver stays spelled whether the write runs or sits in
// an arm this build never takes, as the member claim keeps it. collapsing the receiver assigned an import
if (typeof _self == 'undefined') _globalThis.self = _globalThis;
if (typeof _self == 'undefined') _globalThis.self ||= _globalThis;
if (typeof _self == 'undefined') delete _globalThis.self;
if (typeof _self == 'undefined') [_globalThis.self] = [_globalThis];
if (typeof _self == 'undefined') ({
  s: _globalThis.self = _globalThis
} = {});
if (typeof _self == 'undefined') for (_globalThis.self of [_globalThis]);
if (typeof _self == 'undefined') _globalThis['self'] = _globalThis;
if (typeof _self == 'undefined') _self.self = _globalThis;
if (typeof _globalThis == 'undefined') _self.globalThis = _self;
export const after = _Map$groupBy(list, fn);