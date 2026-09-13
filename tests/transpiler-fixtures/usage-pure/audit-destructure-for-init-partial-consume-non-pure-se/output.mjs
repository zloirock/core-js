// Object-rest keeps the affected loop pattern native at its original evaluation point.
// Independent reads and key/default expressions still receive their own polyfills.
declare const log: () => void;
const userGlobal = {
  Array
};
for (const {
  Array: {
    from
  },
  ...rest
} = (log(), userGlobal); false;) {
  console.log(from, rest);
}