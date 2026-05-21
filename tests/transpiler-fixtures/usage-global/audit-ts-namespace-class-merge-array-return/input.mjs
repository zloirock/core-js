// Declaration-merged class + namespace where the namespace's exported function
// returns a real `number[]`. `Wrapper.getItems().at(0)` must therefore emit the
// Array#at polyfill. Symmetric positive control to the user-class-narrowing
// case: when the merged-namespace return type IS Array, the polyfill fires.
class Wrapper {}
namespace Wrapper {
  export function getItems(): number[] {
    return [];
  }
}

const arr = Wrapper.getItems();
arr.at(0);
