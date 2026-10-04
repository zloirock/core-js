// An own iterator getter can reassign the binding holding its receiver.
// Calling the selected method with arguments retains the original receiver as this.
let arr = ['held'];
Object.defineProperty(arr, Symbol.iterator, {
  get() {
    arr = ['swapped'];
    return function (index) { return { next: () => ({ value: this[index] }) }; };
  },
});
export const result = arr[Symbol.iterator](0).next().value;
