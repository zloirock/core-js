// Differently typed tuple elements do not fold to one element type.
// The lost element order prevents choosing a conditional branch, so pure keeps generic dispatch.
type Sel<T> = T extends Array<[string, number]> ? number[] : string;
declare const v: Array<[number, string]>;
declare const r: Sel<typeof v>;
r.at(0);
