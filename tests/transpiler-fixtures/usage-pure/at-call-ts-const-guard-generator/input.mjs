declare const x: string | number[];
if (typeof x === "string") {
  const gen = function*() { yield x.at(-1); };
}
