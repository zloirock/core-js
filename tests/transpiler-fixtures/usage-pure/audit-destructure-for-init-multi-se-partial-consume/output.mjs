import _globalThis from "@core-js/pure/actual/global-this";
// Object-rest keeps the affected loop pattern native at its original evaluation point.
// Independent reads and key/default expressions still receive their own polyfills.
declare const a: () => void;
declare const b: () => void;
for (const {
  Array: {
    from
  },
  ...rest
} = (a(), b(), _globalThis); false;) {
  console.log(from, rest);
}