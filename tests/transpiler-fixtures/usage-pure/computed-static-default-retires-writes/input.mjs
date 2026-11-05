// The computed key still runs before the extracted static. Its default cannot run
// once pure supplies the method, so a write in that default cannot widen a later
// array read into a generic array-or-string dispatch.
let list = [1, 2];
const { [(effect(), 'from')]: from = (list = 'ab', 0) } = Array;
export const last = list.at(-1);
export { from };
