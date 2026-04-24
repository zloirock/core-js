// `let _ref` inside a nested block is lexically scoped and doesn't hoist - a program-level
// name-lookup on `_ref` won't see it. but name reservation for plugin-generated refs
// walks all scopes so that nested user names don't get reused. reserving over-broadly
// is safe (avoids collision), under-reservation would let the plugin clobber user state
{
  let _ref = 'nested';
  console.log(_ref);
}
[1, 2, 3].at(0);
