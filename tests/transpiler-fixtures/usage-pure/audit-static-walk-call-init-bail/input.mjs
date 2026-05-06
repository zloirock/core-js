// static-receiver chain through const Identifier whose initializer is a CallExpression -
// walkStaticReceiverChain dereferences `wrapper` to the call result; with walkPath length
// > 0 and current.type !== 'ObjectExpression' the walker returns null and the inner
// destructure must NOT register a static dispatch. bare Array.from polyfill should not
// fire on this destructure - kind/object/placement combination falls through to typeless
const wrapper = makeWrapper();
const { a: { from } } = wrapper;
from;
