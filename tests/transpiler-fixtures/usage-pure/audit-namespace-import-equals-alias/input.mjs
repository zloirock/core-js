// `import IE = NS` - TSImportEqualsDeclaration namespace alias. walkStatementsForDecl
// previously didn't recognise the form, so `IE.Foo` lookup failed and the type was
// unresolvable. added a branch that collects the moduleReference's segments and re-walks
// with [...refSegments, ...rest] - external `import X = require('m')` form bails via
// `collectQualifiedSegments` rejecting TSExternalModuleReference (non-Identifier slot)
namespace NS {
  export type Items = string[];
}
import IE = NS;
declare const r: IE.Items;
r.at(0);
