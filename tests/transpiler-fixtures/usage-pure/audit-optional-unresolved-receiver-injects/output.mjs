import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// the other side of the same boundary: when the receiver type is NOT decided, pure still has to
// emit, and the entry it picks is the proof of which way the lookup went. an unresolvable receiver
// takes the type-agnostic dispatcher, a union whose arms all hold the method narrows to the
// arm-specific helper, and a union with one matching and one foreign arm keeps the type-aware
// dispatcher because the foreign arm could be the runtime receiver. distinct method per line
declare const unresolvable: any;
unresolvable == null ? void 0 : _at(unresolvable).call(unresolvable, 0);
declare const matching: number[] | string;
matching == null ? void 0 : _flatMapMaybeArray(matching).call(matching, f);
declare const partial: number[] | Date;
partial == null ? void 0 : _includes(partial).call(partial, 1);