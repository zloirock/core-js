// an identity self-assign writes the alias's own current value back, so it is not a write of the
// binding: both destructure forms keep exactly one real write and still fold on both emitters
var selfAssigned;
({ iterator: selfAssigned } = Symbol);
selfAssigned = selfAssigned;
export const viaAssignSelfAssign = [][selfAssigned];
