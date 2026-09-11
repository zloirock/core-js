import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `import IE = NS` - TSImportEqualsDeclaration namespace alias. type resolution must
// recognise the form, collect the moduleReference's segments, and re-walk through the
// aliased namespace so `IE.Items` resolves. The external `import X = require('m')` form
// bails: its TSExternalModuleReference is not an Identifier-qualified-name chain.
namespace NS {
  export type Items = string[];
}
import IE = NS;
declare const r: IE.Items;
_atMaybeArray(r).call(r, 0);