// Direct mapped type passthrough WITHOUT alias: `{ [K in keyof T]: T[K] }` directly in annotation position,
// not via `type Copy<T> = ...`. resolveTypeAnnotation TSMappedType branch (line 1828) calls
// unwrapMappedTypePassthrough then resolveTypeAnnotation on the passthrough.
declare const x: { [K in keyof { data: number[] }]: { data: number[] }[K] };
x.data.at(0);
