// A computed key can hand the enclosing receiver to external code.
const holder = { rows: [], touch() { return { [sink(this)]() {} }; } };
holder.touch();
holder.rows.at(0);
