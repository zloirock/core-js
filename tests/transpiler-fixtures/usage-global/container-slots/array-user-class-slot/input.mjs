// A user class held in an array slot retains its own static method.
const classInSlotStaysNative = (function () {
  const { 0: { make } } = [class Holder { static make() { return 1; } }];
  return make;
})();
export { classInSlotStaysNative };
