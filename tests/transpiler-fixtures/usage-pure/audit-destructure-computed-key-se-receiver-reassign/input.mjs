// Capture the RHS receiver before the computed key reassigns its binding.
// The key effect then runs before the instance method is read from that original receiver,
// so the reassignment cannot redirect the read to a different array.
let arr = [[1], [2]];
const { [(arr = [[9]], 'flat')]: m } = arr;
const probe = [3].includes(3);
