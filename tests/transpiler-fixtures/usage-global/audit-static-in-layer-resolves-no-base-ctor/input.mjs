// `Array.from` IS in the default `actual` layer, so usage resolution returns its own module.
// usage-global injects just that static (es.array.from) and must NOT fall through to the base
// `Array` constructor suite - the base-ctor fallback fires only for a recognized static whose
// module is filtered out of the layer, or an unrecognized property
Array.from(src);
