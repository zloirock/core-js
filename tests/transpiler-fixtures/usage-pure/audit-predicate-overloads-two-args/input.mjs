// a predicate whose overload headers name DIFFERENT parameters: TS resolves the call to ONE
// signature - the first whose params accept the args, here the first header, since `unknown` accepts
// everything - so only the argument THAT header names narrows; the second header's argument keeps
// its union and dispatches generically
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
