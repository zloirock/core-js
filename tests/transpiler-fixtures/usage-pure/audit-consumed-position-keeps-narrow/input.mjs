// a value sitting in a position that CONSUMES it opens no write channel: a bare statement and an
// untagged template's coercion evaluate it and leave nothing able to reach it, so the narrow holds.
// a TAGGED template is the boundary - the tag function receives the raw value. an assignment forwards
// the value on from its OWN position as well, so it keeps the narrow only while that position
// consumes it too. one row per verdict so each helper name is attributable
const statementPosition = {
  rows: [1, 2],
  read() {
    return this.rows.at(0);
  }
};
statementPosition;
const taggedSubstitution = {
  cells: [1, 2],
  read() {
    return this.cells.at(0);
  }
};
tag`${ taggedSubstitution }`;
const assignedThenDropped = {
  slots: [1, 2],
  read() {
    return this.slots.includes(1);
  }
};
let sink1;
sink1 = assignedThenDropped;
const assignedThenHandedOut = {
  items: [1, 2],
  read() {
    return this.items.includes(1);
  }
};
let sink2;
sink(sink2 = assignedThenHandedOut);
