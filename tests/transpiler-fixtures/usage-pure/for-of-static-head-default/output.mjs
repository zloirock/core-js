import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
// A static default stays inside its for-of head and sees the selected element.
for (const {
  fromEntries,
  getOwnPropertyNames: viaDefault = 0
} of [{
  fromEntries: _Object$fromEntries,
  getOwnPropertyNames: _Object$getOwnPropertyNames
}]) fromEntries([[viaDefault]]);