// raw regex source as string include: `es\.(array|string)\.at` does not begin with `es.`
// (literal dot-escape) so isModulePattern rejects it. classified as entry-path, fails
// `lookupEntryModules`, surfaces "didn't match any polyfill". users wanting alternation
// must pass an actual RegExp object, not a regex source string. design boundary, not bug
'str'.at(-1);
