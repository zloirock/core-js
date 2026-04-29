export default interface Data {
  items: string[];
  counts: number[];
}

function foo(d: Data) {
  // user-defined-type member access path
  d.items.at(-1).padEnd(5);
  // user-defined-type destructuring path
  const { counts } = d;
  counts.at(-1).toFixed(2);
}
