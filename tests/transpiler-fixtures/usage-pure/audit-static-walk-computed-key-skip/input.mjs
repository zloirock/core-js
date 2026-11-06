// A bound computed key selects the same literal-object slot as a plain key.
// The nested static read stays native while the independent at call is served.
const dynamicKey = 'a';
const wrapper = { [dynamicKey]: Array };
const { a: { from } } = wrapper;
from;
[1].at(0);
