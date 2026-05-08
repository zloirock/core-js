// computed key inside a static-wrapper ObjectExpression: `{ [dynamicKey]: Array }` where
// `dynamicKey` is a const-bound string literal. the destructure path must fold the key
// to its static value so descent into `Array` resolves and `from` dispatches statically
const dynamicKey = 'a';
const wrapper = { [dynamicKey]: Array };
const { a: { from } } = wrapper;
from;
[1].at(0);
