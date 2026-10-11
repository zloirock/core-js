// same global in an update (write target), a PRESENCE guard and a value reference: the
// update records the slot mutation and DEOPTS the name for what runs after it - the operand
// and the reference stay verbatim, the reference reading whatever the update left there,
// while the guard runs ahead of the update and probes the pure import
if (Map) {
  Map!++;
}
const m = new Map();
