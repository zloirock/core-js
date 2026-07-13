// same global in an update (write target), a PRESENCE guard and a value reference: the
// update records the slot mutation and DEOPTS the name - all three surfaces stay verbatim,
// so the user's guard probes the real live binding and the reference reads whatever the
// update left there (native-faithful)
if (Map) {
  Map!++;
}
const m = new Map();