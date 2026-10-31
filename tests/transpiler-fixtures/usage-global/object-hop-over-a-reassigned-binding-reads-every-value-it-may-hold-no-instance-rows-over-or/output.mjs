import "core-js/modules/es.global-this";
let orRealm = globalThis;
orRealm = window || globalThis;
const {
  w: {
    toSorted: noInstanceRowsOverOr
  }
} = {
  w: orRealm
};
export default [noInstanceRowsOverOr];