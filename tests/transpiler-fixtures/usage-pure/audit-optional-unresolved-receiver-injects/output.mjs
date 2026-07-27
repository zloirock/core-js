import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// the other side of the same boundary: when the receiver type is NOT decided, pure still has to
// emit, and the entry it picks is the proof of which way the lookup went. an unresolvable receiver
// takes the type-agnostic dispatcher, a union whose arms agree on one family narrows to that
// family's helper, and a union mixing a matching and a foreign arm keeps the type-aware dispatcher
// because the foreign arm could be the runtime receiver. `at` and `includes` are the only methods
// carrying both variants, so the three outcomes are readable off the emitted names
declare const unresolvable: any;
unresolvable == null ? void 0 : _at(unresolvable).call(unresolvable, 0);
declare const matching: number[] | string[];
matching == null ? void 0 : _includesMaybeArray(matching).call(matching, 1);
declare const partial: number[] | Date;
partial == null ? void 0 : _at(partial).call(partial, 0);