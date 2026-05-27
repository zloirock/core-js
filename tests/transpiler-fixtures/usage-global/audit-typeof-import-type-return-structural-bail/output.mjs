import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// the declared return type is `typeof import('x').Bar` and the body is the
// stub `return null as any` (typical of declaration-only helpers). without a
// structural bail on TSTypeQuery wrapping TSImportType, body inference would
// resolve to the null primitive and the resolver would silently drop the
// instance polyfill for `.includes(0)` despite the cross-module type being
// structurally opaque (and runtime values not known to be null).
function getDirect(): import("foo").Bar {
  return null as any;
}
function getTypeofWrapped(): typeof import("foo").Bar {
  return null as any;
}
const a = getDirect();
const b = getTypeofWrapped();
a.at(-1);
b.includes(0);