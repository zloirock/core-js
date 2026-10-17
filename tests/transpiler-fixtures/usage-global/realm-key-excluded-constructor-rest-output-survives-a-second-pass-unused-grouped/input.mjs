// the pure method's output re-fed to the plugin, as a library published pre-polyfilled against @core-js/pure
// ships it: for a constructor the build is told not to inject, a rest hop keeps a sentinel in each claimed
// leaf's place beside the static's own extraction. the sentinel is our own spelling, beside a live leaf as much
// as alone, so a second pass extracts nothing again and leaves every line as it is
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
const {
  Map: {
    groupBy: _unused,
    ...grouped
  } = _Set
} = _globalThis;
export { grouped };
