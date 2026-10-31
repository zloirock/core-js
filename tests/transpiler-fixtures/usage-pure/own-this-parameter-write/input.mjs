// A parameter default can replace a field before the method body runs.
const holder = { rows: [], touch(value = this.rows = "abc") { return value; } };
holder.touch();
holder.rows.at(0);
