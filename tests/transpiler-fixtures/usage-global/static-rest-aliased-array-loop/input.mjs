// The loop captures its element without changing the stored container.
const source = [Array];
let result;
for (const [{ from, ...rest }] of [source]) result = from([1]);
export { result };
