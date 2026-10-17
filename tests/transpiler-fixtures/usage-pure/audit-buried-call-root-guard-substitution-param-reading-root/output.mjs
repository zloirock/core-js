const reads = x => x;
export const paramReadingRoot = reads({
  window: {
    Set: {
      prototype: null
    }
  }
})?.window?.Set.prototype;