// a bound computed key names its slot under a hop as on a flat pattern: a mirror lands in the literal's slot
// for a realm constructor, a nested static or a bound leaf key, a sibling beside it included, and an
// instance leaf dispatches off the slot's value - captured where a wrapper or a spread stands beside it. a
// constructor handed to a call takes its whole entry, its key read the same way
{
const k = 'Map'; const { w: { [k]: m } } = { w: globalThis }; use(m);
}
{
const k = 'w'; const [{ [k]: { at: m } }] = [{ w: [1, 2] }]; use(m);
}
{
const k = 'w'; const { [k]: [{ at: m }] } = { w: [[1, 2]] }; use(m);
}
{
const k = 'w'; const { [k]: { Array: { of: m } } } = { w: globalThis }; use(m);
}
{
const k = 'w'; const { [k]: { Map: m } } = { w: globalThis }; use(m);
}
{
const k = 'w'; const { [k]: { Map: m } } = { w: globalThis, z: other }; use(m);
}
{
const k = 'w'; const { [k]: { at: m } } = { ...spread, w: [1, 2] }; use(m);
}
{
const k = 'w'; const { [k]: { at: m } } = { w: [1, 2] }; use(m);
}
