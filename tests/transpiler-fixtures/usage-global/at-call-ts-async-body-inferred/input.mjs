async function fetchItems() {
  return [1, 2, 3];
}

const promise = fetchItems();
promise.at(-1);
