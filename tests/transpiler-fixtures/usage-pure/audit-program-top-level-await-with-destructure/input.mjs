// The destructured method and the receiver memo both survive module suspension.
const { from } = Array;
const last = (await from([4])).at(-1);
export { last };
