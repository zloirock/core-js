// An unproven computed key keeps the selecting parameter default native.
// The key itself still receives its global polyfill.
const cond = true;
function pick({ from, [Set]: ctor } = cond ? Array : Iterator) {
  return [from, ctor];
}
pick();
