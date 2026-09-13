// Object-rest keeps the affected loop pattern native at its original evaluation point.
// Independent reads and key/default expressions still receive their own polyfills.
declare const logCall: () => any;
for (const { Array: { from }, ...rest } = (logCall(), globalThis); false; ) {
  console.log(from, rest);
}
