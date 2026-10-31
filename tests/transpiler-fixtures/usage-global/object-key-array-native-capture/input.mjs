// A named object key selects an array before native iteration selects its receiver.
// Preserve both selections and inject the instance method for the captured value.
export const { w: [{ at }] } = { w: [[4, 8]] };
