declare const logCall: () => any;
for (const { Array: { from }, ...rest } = (logCall(), globalThis); false; ) {
  console.log(from, rest);
}
