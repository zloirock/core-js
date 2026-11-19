// A nested effectful key runs once before the served from binding.
// The independent flat call keeps its own array helper.
{
const { x: { [(effectful(), 'from')]: f2 } } = { x: Array }; const doubled = [1, [2]].flat();
}
