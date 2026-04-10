declare const x: string | number[];
function outer() {
  if (typeof x === "string") {
    function inner() { return x.at(-1); }
  }
}
