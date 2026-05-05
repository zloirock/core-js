// Mixed proxy-global + static-object hosts in a single Program: verify that the two
// destructure-host shapes resolve independently when used side by side.
//   first  - {Array: {from}} = globalThis  - proxy-global descent: keys ['Array'], every
//            intermediate key is a known global; constructor = deepest key 'Array'
//   second - {a: {entries}} = wrapper      - static-object descent: const wrapper holds
//            ObjectExpression; walkStaticReceiverChain dereferences key 'a' -> Object leaf
// Each pair triggers its own STABLE static method (Array.from, Object.entries) so divergent
// emission shows whether either descent path mis-resolves to the other constructor's
// polyfill. Stable choice avoids the esnext-stage gating noise (`Map.of` would be skipped
// regardless of descent correctness because it's not in the `actual/` entry layer)
const { Array: { from } } = globalThis;
const wrapper = { a: Object };
const { a: { entries } } = wrapper;
const arr = from('hi');
const pairs = entries({ k: 1 });
arr.includes('h');
pairs.at(0);
