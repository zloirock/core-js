function isStr(x: any): x is string { return typeof x === "string"; }
declare const x: string | number[];
if (!isStr(x)) throw new Error();
x.at(-1);
