// A single direct write supplies the element type at the later read.
// Mutators and escapes below keep the generic dispatcher; read-only uses stay precise.
const written = [1, 2];
written[0] = 'x';
export const viaElementWrite = written[0].at(0);
