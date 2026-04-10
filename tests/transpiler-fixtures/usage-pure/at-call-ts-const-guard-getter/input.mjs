declare const x: string | number[];
const obj = { get val() { if (typeof x === "string") return x.at(-1); } };
