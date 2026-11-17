import _Promise from "@core-js/pure/actual/promise";
// Reading the same hop as a whole value retains that value beside its static.
const {
  C: {
    withResolvers
  },
  C: held
} = flag ? {
  C: _Promise
} : {
  C: Object
};
export const readTwice = () => [withResolvers(), held];