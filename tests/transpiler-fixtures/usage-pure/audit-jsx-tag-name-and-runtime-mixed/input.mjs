// A JSX tag keeps its source binding. It does not hand out the constructor binding
// pure substitutes at the ordinary runtime reference, so that binding stays narrow.
// Global injection still supplies the family the renderer can read through the tag.
const el = <Map data={x} />;
const m = new Map();
