// Each selected receiver contributes its own static family; dead operands stay unobserved.
export function read(pick, nested) {
  const log = [];
  const { from, of, missing = (log.push('default'), 9) } = (log.push('before'), pick
    // The selected leaf registers before its dead right is removed.
    ? nested ? (log.push('array'), Array) || (log.push('dead'), Object)
      : (() => { log.push('call'); return globalThis.Iterator; })()
    : { from: value => value, of: value => [value] });
  return [from([7])[0], of(8)[0], missing, log];
}
