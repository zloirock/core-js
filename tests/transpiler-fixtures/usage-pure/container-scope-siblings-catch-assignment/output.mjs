import _Map from "@core-js/pure/actual/map/constructor";
const holder = {
  w: Object
};
try {
  throw {
    w: Array
  };
} catch (holder) {
  holder.w = _Map;
}