// A folded computed key reassigns the receiver. The method read still selects
// the method on the receiver value evaluated before that key.
let arr = [1, 2];
export const method = arr[(() => (arr = { at: () => 'swapped' }, 'at'))()];
