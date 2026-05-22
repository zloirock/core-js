import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// generator declared as `Generator<typeof import('foo').Bar>` - the yield type is the
// same TSTypeQuery-over-TSImportType structural-opaque nesting that the return-type bail
// recognises. resolveReturnType's generator branch resolves yieldType via
// resolveTypeAnnotation; when that returns null (TSImportType keyword), the iterator
// inner falls back to null. for-of over the generator yields a value whose receiver type
// is the unresolved yield - the polyfill on the leaf method must NOT be silently dropped.
function* gen(): Generator<typeof import("foo").Bar> {
  yield null as any;
}
for (const x of gen()) {
  x.at(0);
}