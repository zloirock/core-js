// user declares `_Array$from` - the canonical name the plugin would use for its Array.from
// polyfill import. ref allocator walks past the user's binding and picks `_Array$from2`
// for its own injected import, so both coexist without collision
const _Array$from = 'already taken';
Array.from(x);
console.log(_Array$from);
