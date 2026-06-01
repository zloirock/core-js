// single-key indexed access whose value is a method (`T["a"]` where `a(): number[]`): the value
// type is a function, which has no at method, so no polyfill is injected
interface T { a(): number[]; }
declare const v: T["a"];
const r = v.at(0);
export { r };
