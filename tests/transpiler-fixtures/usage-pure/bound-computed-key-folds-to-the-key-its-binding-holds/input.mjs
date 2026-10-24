// a computed key a const binding holds names that key: a flat pattern extracts as under the literal key - a
// realm constructor, an instance method off a literal, a static - and the constructor handed to a call takes its
// whole entry, its key read the same way
{
const k = 'Map'; const { [k]: m } = globalThis; use(m);
}
{
const k = 'at'; const { [k]: m } = [1, 2]; use(m);
}
{
const k = 'of'; const { [k]: f } = Array; use(f);
}
