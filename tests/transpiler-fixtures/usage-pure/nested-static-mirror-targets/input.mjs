// Identifier slots receive pure statics; a nested pattern under a static rides the MIRROR SLOT where
// the host holds more than that one prop - the statement stands and no key effect crosses another -
// while member assignment targets retain native slots. The slot DESCENDS where a leaf under the
// pattern carries a claim of its own, spelling it off the static's ponyfill. Only a host the pattern
// occupies ALONE is lifted out as an extraction. Computed keys and target effects stay live on both
// paths, and both legs print the same shape.
const events = [];
const pureFrom = Array.from;
const box = {};
let from, bind;
let defaults = 0;
({ Array: { [(events.push('first'), 'from')]: from },
  Object: { keys: { [(events.push('x'.at(0)), 'bind')]: bind } } } = globalThis);
({ Array: { [(events.push('second'), 'from')]: from },
  Object: { keys: box[(events.push('y'.at(0)), 'value')] } } = globalThis);
({ Array: { [(events.push('third'), 'from')]: from },
  Object: { keys: box[(events.push('z'.at(0)), 'value')] = (defaults++, null) } } = globalThis);
export const result = [from([7])[0], from === pureFrom, typeof bind, typeof box.value, defaults, events];

function observe() {
  try { events.push(typeof boundFrom); } catch (error) { events.push(error.name); }
}
const { Array: { [(events.push('binding'), observe(), 'from')]: boundFrom },
  Object: { keys: { [(events.push('a'.at(0)), 'bind')]: boundBind } } } = globalThis;
function read({ Array: { [(events.push('parameter'), 'from')]: method },
  Object: { keys: { [(events.push('b'.at(0)), 'bind')]: bound } } } = globalThis) {
  return [method([8])[0], typeof bound];
}
export const bindings = [boundFrom([7])[0], typeof boundBind, read()];
