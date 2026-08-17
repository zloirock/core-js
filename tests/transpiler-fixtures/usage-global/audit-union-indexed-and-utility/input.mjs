// an indexed access distributes over a union OBJECT, and a self `keyof` index travels with its arm
type Src = { v: number[] } | { v: number[] };
declare const byKey: Src["v"];
byKey.at(0);
declare const bySelfKeyof: Src[keyof Src];
bySelfKeyof.includes(1);

// the naked-conditional utilities distribute over a union argument too
declare class Holder { items: number[] }
declare const instance: InstanceType<typeof Holder | typeof Holder>["items"];
instance.find(z => z === 1);

// every receiver above is an array, so no other family may be injected - that IS the observable
// here, and it needs the whole file to agree: the divergent twin lives in its own fixture, since
// one unresolved site would drag the string family back in and mask all three
