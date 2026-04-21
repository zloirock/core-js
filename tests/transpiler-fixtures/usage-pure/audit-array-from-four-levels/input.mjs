// four nested Array.from — stresses compose loop's nth accounting when the same needle
// is swallowed level by level (each outer substitution absorbs one copy of `Array.from`)
Array.from(Array.from(Array.from(Array.from(s))));
