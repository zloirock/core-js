declare const x: string | number[];
if (typeof x === "string") {
  class C { fn() { return x.at(-1); } }
}
