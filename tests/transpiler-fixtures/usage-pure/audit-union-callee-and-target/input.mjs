// a union CALLEE is one value with several signatures: convergent arms keep the narrow
declare const convergent: (() => number[]) | (() => number[]);
convergent().includes(1);

// divergent arms cannot name one family, so the generic helper serves them
declare const divergent: (() => number[]) | (() => string);
divergent().at(0);

// an Extract / Exclude TARGET that is a union distributes arm by arm
type Kept = Exclude<number[] | string | symbol, string | symbol>;
declare const kept: Kept;
kept.find(z => z === 1);

// a target whose written arguments are all TOP keywords constrains no element
type Picked = Extract<number[] | string, readonly unknown[]>;
declare const picked: Picked;
picked.filter(z => z === 1);
