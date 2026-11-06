// Conditional `T extends Promise<infer U> ? U[] : never` - infer capture in extendsType,
// trueType references the captured U wrapped in Array. the array-infer pattern match only
// matches `(infer U)[]` / `Array<infer U>` / `Container<infer U>` shapes for the EXTENDS side -
// here extends is `Promise<infer U>` (a recognized infer container) but trueType is `U[]` not
// `U`. probe whether plugin synthesizes Array<U> correctly.
type Wrap<T> = T extends Promise<infer U> ? U[] : never;
type R = Wrap<Promise<number>>;
declare const arr: R;
const head = arr.at(0);
const idx = arr.findIndex(n => n > 0);
export { head, idx };
