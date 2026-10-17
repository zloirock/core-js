{
function g({ a: { hasOwn }, b: { keys } } = { a: Object, b: Object }) { return [hasOwn, keys]; }
}
