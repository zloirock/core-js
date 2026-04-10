let x: string | number[] = "hello";
let fn;
if (typeof x === "string") {
  fn = () => x.at(-1);
}
x = [1, 2, 3];
