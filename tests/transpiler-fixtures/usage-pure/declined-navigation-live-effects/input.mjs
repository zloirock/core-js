// The declined leaf keeps both the receiver-prefix and computed-key claims live.
const root = () => globalThis;
export function read(effects) {
  return (effects.push('outer'), (effects.push(Array.from('i').at(0)), root()))
    .self.window[(effects.push([7].includes(7)), 'declinedNavigationMissing')];
}
