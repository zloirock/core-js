import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.global-this";
// the pure method's output re-fed to the plugin, as a library published pre-polyfilled against @core-js/pure
// ships it: for a constructor the build is told not to inject, a rest hop keeps a sentinel in each claimed
// leaf's place beside the static's own extraction. the sentinel is our own spelling, beside a live leaf as much
// as alone, so a second pass extracts nothing again and leaves every line as it is
import _globalThis from "@core-js/pure/actual/global-this";
const {
  Promise: {
    try: _unused3,
    prototype: {
      then
    },
    ...tried
  }
} = _globalThis;
export { then };
export { tried };