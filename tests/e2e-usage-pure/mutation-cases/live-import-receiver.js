export let receiver;

export function resetReceiver() {
  receiver = ['held'];
  Object.defineProperty(receiver, 'at', {
    get() {
      receiver = ['swapped'];
      return function (index) { return this[index]; };
    },
  });
}
