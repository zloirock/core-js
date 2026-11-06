// A computed key in an assignment uses its innermost binding to select the literal slot.
// The nested Map read remains native.
const k = 'k';
{
const k = 'w'; let m; ({ [k]: { Map: m } } = { w: globalThis }); use(m);
}
