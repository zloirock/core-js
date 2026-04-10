declare const x: string | number[];
if (typeof x === "string") {
  const fn = function() { return x.at(-1); };
}
