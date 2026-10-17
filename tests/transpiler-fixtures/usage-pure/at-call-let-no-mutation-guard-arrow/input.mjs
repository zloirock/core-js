let x: string | number[] = "hello";
if (typeof x === "string") {
  const fn = () => x.at(-1);
}
