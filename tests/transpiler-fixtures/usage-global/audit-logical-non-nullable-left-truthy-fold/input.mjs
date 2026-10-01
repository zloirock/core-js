// non-nullable control: `arr: string[]` carries no nullish-strip marker, so the
// always-truthy fold still collapses `??` to the left - only the Array shape injects
// (es.array.includes, no es.string.includes)
declare const arr: string[];
(arr ?? 'x').includes('y');
