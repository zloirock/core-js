// Removing the static pattern keeps both initializer effects in source order.
// Its property default stays dead; the nested claim in the prefix remains live.
const events = [];
const { from: read = (events.push('default'), () => []) } =
  (events.push('outer'), (events.push(Array.of('inner')[0]), Array));
export { read, events };
