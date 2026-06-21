// raw regex source as string include: `es\.(array|string)\.at` does not begin with `es.`
// (literal dot-escape), so it is not treated as a module pattern. classified as a literal
// entry-path, matches no module, surfaces "didn't match any polyfill". users wanting
// alternation must pass an actual RegExp object, not a regex source string. by design
'str'.at(-1);
