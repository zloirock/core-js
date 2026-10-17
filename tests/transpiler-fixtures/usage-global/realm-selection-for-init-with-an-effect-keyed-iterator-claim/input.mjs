// An iterator claim keyed by an effect beside a plain slot, in a for-init over a realm selection: the
// iterator key loads its symbol beside both realm roots.
for (const { [(e(), Symbol.iterator)]: it, z } = c ? globalThis : self; ;) break;
