// A computed instance assignment evaluates its receiver, then the key, then the method read.
// The key and getter each run once; the assignment still yields the unchanged receiver.
let m;
({ [(effectful(), 'flat')]: m } = arr);
const probe = [1, 2].includes(2);
