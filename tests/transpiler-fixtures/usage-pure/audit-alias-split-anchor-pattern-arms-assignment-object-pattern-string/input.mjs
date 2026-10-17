// a later SLOT write of the hint's global deopts the whole name: the registration must not
// outlive it - both the alias member and the bare global stay verbatim
let SW;
({ String: SW } = globalThis);
