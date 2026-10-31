// A nested pattern keeps the full pure index as its source.
// Its method identity survives container selection and later pattern processing.
import P from "@core-js/pure/actual/promise";
const box = { value: P };
export const { value: { all } } = box;
