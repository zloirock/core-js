// A computed instance assignment captures its receiver, then runs the key before the method read.
// The key and getter each run once; the assignment still yields the captured receiver.
let m;
({ [(effectful(), 'flat')]: m } = arr);
const probe = [1, 2].includes(2);
