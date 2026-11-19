// a BOUND root is the user's own binding whatever its name - raw reads only
function take(self) {
  const { inner: { [Symbol.iterator]: shadowed } } = self;
  return shadowed;
}
export { take };
