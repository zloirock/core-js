// a pattern over an alias of a literal container reads the container: the static leaf's mirror lands in a
// fresh literal in place of the alias, which stays declared as written
{
const _r = { w: Object }; let { w: { keys } } = _r; keys;
}
