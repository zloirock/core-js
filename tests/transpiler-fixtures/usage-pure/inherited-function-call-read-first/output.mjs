import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A proven inherited toString returns a string; value and call queries keep independent caches.
const box = {
  run() {
    var _ref;
    void this.toString.at;
    const result = _atMaybeString(_ref = this.toString()).call(_ref, -1);
    return result;
  }
};
use(box.run());