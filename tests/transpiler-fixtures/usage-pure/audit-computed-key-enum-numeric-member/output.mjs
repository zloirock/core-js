var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// numeric enum member as computed key: `resolveComputedKeyName` reads the initializer
// literal value (0) through `findEnumMember`; `Record<number, string[]>` annotation
// resolves `rec[0]` to `string[]`, so `.at(0)` picks the Array instance method
enum NumKey {
  Zero = 0,
}
const rec = {
  0: ['x']
} as Record<number, string[]>;
_atMaybeArray(_ref = rec[NumKey.Zero]).call(_ref, 0);