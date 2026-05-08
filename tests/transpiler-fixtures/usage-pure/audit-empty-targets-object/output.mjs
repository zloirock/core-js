// `targets: {}` is a truthy-but-empty object: it must skip browserslist fallback and
// emit no polyfills, since iteration over zero engines never matches any feature.
'str'.at(-1);
[1, 2].at(0);