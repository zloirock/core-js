// multi-declarator nested-proxy destructure with SequenceExpression init in the first
// declarator. flatten must lift the SE prefix as a standalone statement (the comma-tail
// `globalThis` becomes the dropped receiver), then emit `const from = _Array$from` for the
// extracted polyfill key, then preserve the sibling `x = 1` declarator. without SE-lift the
// `se()` side-effect would be silently dropped together with the spliced-out original
let traced = 0;
function se() { traced++; return globalThis; }
const { Array: { from } } = (se(), globalThis), x = 1;
from([1, 2, 3]);
console.log(x, traced);
