// the other side of the same boundary: when the receiver type is NOT decided, pure still has to
// emit, and the entry it picks is the proof of which way the lookup went. an unresolvable receiver
// takes the type-agnostic dispatcher, a union whose arms all hold the method narrows to the
// arm-specific helper, and a union with one matching and one foreign arm keeps the type-aware
// dispatcher because the foreign arm could be the runtime receiver. distinct method per line
declare const unresolvable: any;
unresolvable?.at(0);
declare const matching: number[] | string;
matching?.flatMap(f);
declare const partial: number[] | Date;
partial?.includes(1);
