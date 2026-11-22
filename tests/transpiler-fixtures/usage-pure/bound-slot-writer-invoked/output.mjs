import _Map from "@core-js/pure/actual/map";
function fill(target) {
  target.C = _Map;
}
export function read() {
  const box = {
    C: Object
  };
  const held = fill.bind(null, box);
  held();
  const {
    C: {
      groupBy
    }
  } = box;
  return groupBy;
}