// Caller annotations survive legal same-slot writes.
// Nested and flat parameter reads use the caller field's declared receiver family.

const stringBox: { value: string } = { value: 'ab' };
stringBox.value = 'cd';
type StringFieldOracle = typeof stringBox.value;
const stringFieldOracle: StringFieldOracle = 'ef';
function readString({ value: { at } = 'gh' }) { return at; }
export const stringResult = readString(stringBox);

const arrayBox: { value: number[] } = { value: [1] };
arrayBox.value = [2];
type ArrayFieldOracle = typeof arrayBox.value;
const arrayFieldOracle: ArrayFieldOracle = [3];
function readArray({ value: { includes } }) { return includes; }
export const arrayResult = readArray(arrayBox);
function readFlat({ flat }) { return flat; }
export const flatResult = readFlat(arrayBox.value);
