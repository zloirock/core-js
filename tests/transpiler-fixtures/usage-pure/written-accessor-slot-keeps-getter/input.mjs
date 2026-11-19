// A setter does not erase the getter belonging to the same property descriptor.
// Writing Map may leave the getter returning Object; keep the read and its original candidate.
// Pure guards the observed value, and global injects Object.groupBy as well as Map's statics.
const effects = [];
const source = {
  get value() { effects.push('get'); return Object; },
  set value(ctor) { effects.push('set'); },
};
source.value = Map;
export const { value: { groupBy } } = source;
export { effects };
