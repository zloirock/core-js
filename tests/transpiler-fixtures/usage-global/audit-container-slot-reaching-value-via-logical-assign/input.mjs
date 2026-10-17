// a logical assign installs its right operand only sometimes - still reachable
const cl = { q: Object };
cl.q ||= Promise;
const { q: { try: viaLogicalAssign } } = cl;
export { viaLogicalAssign };
