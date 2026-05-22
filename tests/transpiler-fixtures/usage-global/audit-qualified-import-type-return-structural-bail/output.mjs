import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// qualified inner segment on TSImportType: `import('foo').NS.Bar` (NS.Bar, not bare Bar).
// the outer node is still TSImportType - the qualifier sits in the `qualifier` slot of
// the import-type node - so the flat structural-bail set hits the same path it does for
// bare `import('foo').Bar`. without the bail, body inference on `return null as any`
// would poison the cross-module shape with the null primitive and silently drop the
// polyfill on the leaf method call.
function getNested(): import("foo").NS.Bar {
  return null as any;
}
const x = getNested();
x.at(0);