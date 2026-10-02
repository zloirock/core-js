// The key runs before the receiver exists and cannot expose that receiver.
// Its unresolved value leaves the explicitly named rows type intact.
const holder = { rows: [], [sink(this)]() {} };
holder.rows.at(0);
