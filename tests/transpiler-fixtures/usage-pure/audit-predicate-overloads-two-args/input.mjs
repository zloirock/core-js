// a predicate whose overload headers name DIFFERENT parameters: the truthy branch narrows
// each named argument via its own header - the first arg to the string variant, the second
// to the array variant
declare function pick(x: unknown, y: unknown): x is string;
declare function pick(x: unknown, y: unknown): y is number[];
declare const e: string | string[];
declare const f: string | number[];
let r1;
let r2;
if (pick(e, f)) {
  r1 = e.at(2);
  r2 = f.includes(3);
}
export { r1, r2 };
