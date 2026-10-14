// A body-extracted static alias narrows the calls through its own binding only. A parameter or a
// catch clause of the same name nested in the alias's scope holds another value, so a call through
// it dispatches generically: the static's array helper would hand a string its own missing method.
// The read of the alias itself keeps its narrow.
const { from, ...rest } = Array;
export const own = from([1, 2]).keys();
export function param(from) {
  return from('xy').at(0);
}
export function caught(error) {
  try {
    throw error;
  } catch (from) {
    return from('xy').includes('x');
  }
}
