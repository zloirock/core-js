import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set";
// a method destructured off a literal is the callee a call of the name runs, so a static read off
// its result is served - unless the file wrote that slot before the capture, which then holds no
// one certain function and keeps the read native. a write after the capture changes nothing
const early = {
  make() {
    return _Map;
  }
};
early.make = () => _Set;
const {
  make
} = early;
make().groupBy(src, fn);
const late = {
  build() {
    return _Promise;
  }
};
const {
  build
} = late;
late.build = () => _Set;
_Promise$try(fn);