// destructure with a `&&` init whose left the build serves: the left always passes, so the right is
// the receiver alone and the left names no static - `Promise` has no `from`, the read stays native
const { from } = Array && Promise;
