// Cross assignments inside a callback preserve the last container value seen by destructuring.
// The nested from read remains native.
function invoke(callback) {
  return callback();
}
export const result = invoke(() => {
  let first = { x: Number };
  let second = { x: Array };
  first = second;
  second = first;
  const { x: { from } } = first;
  return from({ 0: 'callback', length: 1 });
});
