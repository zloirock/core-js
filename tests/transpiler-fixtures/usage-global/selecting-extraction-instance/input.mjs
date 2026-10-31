// A sole instance read takes the complete selection; shared reads keep one receiver.
function whole(flag, left, right) {
  const { at } = flag ? left : right;
  return at;
}
function partial(flag, left, right) {
  const { includes, length } = flag ? left : right;
  return [includes, length];
}
