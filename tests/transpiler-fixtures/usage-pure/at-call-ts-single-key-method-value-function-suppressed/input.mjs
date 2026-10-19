// single-key indexed access whose value is a method (`T["a"]` where `a(): number[]`): the value
// type is a function, which has no at method, so no polyfill is injected
interface T { a(): number[]; }
declare const v: T["a"];
// @ts-expect-error the member read is the probe, and the right answer is a type without it
const r = v.at(0);
export { r };
