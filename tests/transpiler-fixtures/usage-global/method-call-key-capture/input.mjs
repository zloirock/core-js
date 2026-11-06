// The receiver is captured before a computed key, and the lookup precedes arguments.
// A nested claim in the key remains live when the outer call consumes the member.
export function read(getReceiver, key, argument) {
  return getReceiver()[key(), ['x'].includes('x'), 'at'](argument());
}
