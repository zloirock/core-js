import "core-js/modules/es.string.at";
// An object member preserves its string receiver type for a method shared with arrays.
const host = {
  value: 'abc'
};
const {
  'at': at
} = host.value;
export { at };