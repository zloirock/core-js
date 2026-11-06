import _Map from "@core-js/pure/actual/map";
// A prefix runs before the container store that follows it.
// Native nested static reads consume that same stored object.
var one, two;
export const {
  C: {
    groupBy
  }
} = (setup(), one = {
  C: _Map
});
export const {
  C: {
    from
  },
  D: {
    of
  }
} = (setup(), two = {
  C: Array,
  D: Array
});
export { one, two };