// re-aliased const chain in static-wrapper: walkStaticReceiverChain follows
// Foo -> Array (Identifier hop) AND wrapper -> { a: Foo } -> step 'a' -> Foo,
// then Identifier-hop again to 'Array'. The walker chases hops until it lands on
// either an unbound Identifier or an ObjectExpression. distinct prototype methods
// per receiver narrow array typing post-from
const Foo = Array;
const wrapper = { a: Foo };
const { a: { from } } = wrapper;
const arr = from(['x']);
arr.at(0);
arr.includes('x');
