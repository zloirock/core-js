// optional tuple element inside Awaited: `Awaited<[A, B?]>` - TSOptionalType wrapping
// the inner Promise must be peeled while keeping the optional structure intact
type T = Awaited<[Promise<number[]>, Promise<string[]>?]>;
declare const t: T;
t[0].at(0);
