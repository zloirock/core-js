// A computed key can hand the enclosing receiver to external code.
const holder = { rows: [], touch() { return { [(() => { const self = this; return sink(self); })()]() {} }; } };
holder.touch();
holder.rows.at(0);
