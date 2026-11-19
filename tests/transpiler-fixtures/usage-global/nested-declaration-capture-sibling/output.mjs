import "core-js/modules/es.array.at";
import "core-js/modules/es.array.push";
// A surviving sibling shares the computed root with the nested dispatch.
// The receiver and its getter run once, after preceding declarators.
const effects = [];
function source() {
  effects.push('source');
  return {
    get data() {
      effects.push('data');
      return [1, 2];
    },
    other: 3
  };
}
const lead = (effects.push('lead'), 1),
  {
    data: {
      at
    },
    other
  } = source();
export { lead, at, other, effects };