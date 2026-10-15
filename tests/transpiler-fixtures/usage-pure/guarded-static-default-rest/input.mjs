// Object rest over an uncertain constructor retains its native named reads.
// Its exclusions and the user's default remain in the original pattern.
let M = pickConstructor();
if (!M) M = Array;
const { from, of: method = 1, ...rest } = M;
export { from, method, rest };
