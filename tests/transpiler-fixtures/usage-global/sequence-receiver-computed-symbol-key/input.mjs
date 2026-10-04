// Nested receiver prefixes evaluate before its tail is captured.
// A later computed symbol-key write cannot replace the selected iterator receiver.
let arr;
const log = [];
export const result = (log.push('first'), (log.push('second'), arr = ['held'], arr))[
  Symbol[(log.push('key'), arr = ['swapped'], 'iterator')]
]().next().value;
