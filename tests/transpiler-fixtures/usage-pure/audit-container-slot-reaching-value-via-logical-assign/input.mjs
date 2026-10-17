// a logical assign is a write like any other for the bail
const cl = { q: Object };
cl.q ||= Promise;
const { q: { try: viaLogicalAssign } } = cl;
export { viaLogicalAssign };
