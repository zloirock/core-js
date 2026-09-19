import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// qualified inner segment on TSImportType: `import('foo').NS.Bar` (NS.Bar, not bare Bar). the
// outer node is still TSImportType (the qualifier sits in its `qualifier` slot), so the
// structural bail must fire as it does for bare `import('foo').Bar`; without it the
// `return null as any` body poisons the cross-module shape and drops the leaf-call polyfill.
function getNested(): import("foo").NS.Bar {
  return null as any;
}
const x = getNested();
x.at(0);