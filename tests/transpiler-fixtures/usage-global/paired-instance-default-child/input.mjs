// A parameter default keeps its child static read.
// The instance dispatch must still use the supplied or defaulted receiver.
export function read({ k: { includes } } = { k: Array.from([4, 9]) }) {
  return includes;
}
