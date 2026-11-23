import _globalThis from "@core-js/pure/actual/global-this";
// The array wrapper retains the selected receiver and its own from method.
const userObj = {
  Array: {
    from: () => []
  }
};
const useGlobal = false;
const [, {
  Array: {
    from
  }
}] = [0, useGlobal ? _globalThis : userObj];
typeof from;