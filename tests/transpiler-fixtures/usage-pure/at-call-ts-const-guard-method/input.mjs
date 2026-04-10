declare const x: string | number[];
if (typeof x === "string") {
  const obj = { fn() { return x.at(-1); } };
}
