// A zero-arg IIFE computed method key folds to its returned name. usage-pure relocates the key by
// DROPPING the node, so it collapses only an observably-pure IIFE (first line); an effect anywhere the
// drop would lose it keeps the native dispatch - a sequence in the body (second line) or the IIFE's own
// argument (third line). distinct method per line.
const arr = [1, 2, 3];
let log = 0;
export const pure = arr[(() => 'flat')()]();
export const bail = arr[(() => (log++, 'flatMap'))()](x => [x]);
export const argBail = arr[(x => 'at')(log++)](0);
export { log };
