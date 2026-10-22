// Child claims in the initializer and computed key remain live until extraction.
// Sibling initializers retain their source order around the claimed pattern.
const effects = [];
const before = (effects.push('before'), 0),
      { [(effects.push(Array.from('k')[0]), 'at')]: method } = (effects.push('init'), Array.from([4, 7])),
      after = (effects.push('after'), 1);
export { before, method, after, effects };
