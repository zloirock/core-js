import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// TSImportType inside an intersection: `import('foo').Bar & { extra: number }`.
// TSIntersectionType is already in the structural-annotation set so the bail
// fires through the intersection branch - the import-type member sits inside
// the intersection's types list. body inference returning null primitive must
// not poison the cross-module shape; the polyfill on the leaf method survives.
function wrapped(): import("foo").Bar & {
  extra: number;
} {
  return null as any;
}
const x = wrapped();
x.at(0);