import "core-js/modules/es.string.at";
// A single direct write replaces the element before its read.
// The installed string needs only the string variant of at.
const written = [1, 2];
written[0] = 'x';
export const viaElementWrite = written[0].at(0);