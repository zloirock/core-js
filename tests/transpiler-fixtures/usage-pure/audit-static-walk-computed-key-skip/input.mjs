// computed key inside static-wrapper ObjectExpression resolved via const binding:
// `[dynamicKey]: Array` where `const dynamicKey = 'a'`. walkStaticReceiverChain delegates
// key extraction to the shared `resolveKey` which walks identifier bindings AND folds
// StringLiteral / Literal / `+`-concat to a static string. resolved key 'a' matches the
// destructure walkPath[0], descent continues into `Array` -> static-method dispatch fires.
// dynamic / non-statically-resolvable computed keys still return null and skip safely.
// distinct methods on subsequent prototype calls test that arr typing remains intact
const dynamicKey = 'a';
const wrapper = { [dynamicKey]: Array };
const { a: { from } } = wrapper;
from;
[1].at(0);
