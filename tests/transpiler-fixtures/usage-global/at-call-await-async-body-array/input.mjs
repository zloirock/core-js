async function getData() {
  return [1, 2, 3];
}
(await getData()).at(-1);
