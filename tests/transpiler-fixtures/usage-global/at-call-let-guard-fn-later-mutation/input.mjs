let x: string | number[] = "hello";
if (typeof x === "string") {
  const fn = function() { return x.at(-1); };
}
x = [1, 2, 3];
