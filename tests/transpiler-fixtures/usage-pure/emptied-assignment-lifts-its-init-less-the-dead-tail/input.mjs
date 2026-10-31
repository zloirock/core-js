// an assignment its claims empty lifts what its init still runs as one statement, less the dead tail: the
// literal the pattern read does no work, and of a selection the build decides only the part that runs lifts
let at, flat;
({ C: { at } } = (log('at'), { C: [] }));
({ D: { flat } } = typeof Symbol != 'undefined' ? (log('flat'), { D: [] }) : other);
export { at, flat };
