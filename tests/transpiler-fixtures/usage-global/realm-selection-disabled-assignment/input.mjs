// A same-line opt-out applies to the whole selecting assignment.
let M;
({ Math: M } = globalThis.self ?? globalThis); // core-js-disable-line
consume(M);
