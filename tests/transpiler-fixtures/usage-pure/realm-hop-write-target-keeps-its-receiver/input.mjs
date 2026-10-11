// a realm member the source WRITES - assigns, deletes, destructures into, iterates into - names the slot the
// operator lands on, not the realm read through it: its receiver stays spelled whether the write runs or sits in
// an arm this build never takes, as the member claim keeps it. collapsing the receiver assigned an import
if (typeof self == 'undefined') globalThis.self = globalThis;
if (typeof self == 'undefined') globalThis.self ||= globalThis;
if (typeof self == 'undefined') delete globalThis.self;
if (typeof self == 'undefined') [globalThis.self] = [globalThis];
if (typeof self == 'undefined') ({ s: globalThis.self = globalThis } = {});
if (typeof self == 'undefined') for (globalThis.self of [globalThis]);
if (typeof self == 'undefined') globalThis['self'] = globalThis;
if (typeof self == 'undefined') globalThis.self.self = globalThis;
if (typeof globalThis == 'undefined') self.globalThis = self;
export const after = self.Map.groupBy(list, fn);
