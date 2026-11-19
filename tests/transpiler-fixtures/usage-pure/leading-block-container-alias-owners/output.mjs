import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
{
  // The leading block and Program both start at zero, but their boxes are different bindings.
  // Each escaping constructor must carry its family. Keep this block first, ahead of the comment.
  const box = {
    value: _Map
  };
  hand(box.value);
}
const box = {
  value: _Promise
};
hand(box.value);