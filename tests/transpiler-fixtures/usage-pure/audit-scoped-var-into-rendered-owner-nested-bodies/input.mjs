export const nestedBodies = (() => {
  const outer = [1, [2]].flat();
  return outer.length ? globalThis : null;
})()?.window?.JSON.stringify({ a: 1 });
