// a Flow cross-family union receiver derives the same exact hint set as the TS twin:
// only the union's variants inject (es.array.includes + es.string.includes)
declare var r: Array<number> | string;
(r ?? 'f').includes('x');
