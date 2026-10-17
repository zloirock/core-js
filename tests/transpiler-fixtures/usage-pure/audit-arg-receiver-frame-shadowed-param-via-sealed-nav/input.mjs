// ... and a node the channel SYNTHESIZES off that receiver inherits the frame the same way: the
// sealed-nav probe is planned on the pristine tree and its guard object is a CLONE, so an unstamped
// copy tested `globalThis.window` through the parameter and shipped a raw global read
const viaSealedNav = (function ({ from } = Object, globalThis) {
  return from;
})((globalThis.window?.self).Array);
export { viaSealedNav };
