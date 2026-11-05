// An object spread completes before the explicit realm slot is read by the native pattern.
{
const { w: { Map: m } } = { ...extra, w: globalThis }; use(m);
}
