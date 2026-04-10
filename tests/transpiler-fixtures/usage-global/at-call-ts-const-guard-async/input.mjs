declare const x: string | number[];
if (typeof x === "string") {
  const fn = async function() { return x.at(-1); };
}
