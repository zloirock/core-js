import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// the mutation census pairs the pattern at the same positions: the element an alias re-homes
// escapes through the inline spread as it does through the flat literal, and every element from a
// binding spread on escapes into any later slot (`values` / `entries` are the carriers)
const box = [[1]];
const [viaCensus] = [...[box]];
_pushMaybeArray(viaCensus).call(viaCensus, 's');
for (const item of box) _at(item).call(item, 0);
export { viaCensus };