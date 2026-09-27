// This definition uses another receiver, so the rows remain an array.
const holder = { rows: [], touch() { return class { static { sink(this); } }; } };
holder.touch();
holder.rows.at(0);
