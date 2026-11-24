// Stable reads after top-level await keep their receiver.
const data = await fetchData();
const arr = [data];
const last = arr.at(-1);
const found = arr.findLast(x => x);
export { last, found };
