declare const x: string | number[];
if (typeof x === "string") {
  const fn = () => () => x.at(-1);
}
