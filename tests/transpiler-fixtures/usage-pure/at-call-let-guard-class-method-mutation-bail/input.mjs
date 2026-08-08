let x: string | number[] = "hello";
if (typeof x === "string") {
  class C { m() { return x.at(-1); } }
}
x = [1];
