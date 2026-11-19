// A literal computed string key preserves the native nested Map read of its object slot.
{
const { ['w']: { Map: m } } = { w: globalThis }; use(m);
}
