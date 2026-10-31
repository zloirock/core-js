async function fetchData() {
  return Promise.resolve([1, 2, 3]);
}

async function main() {
  const items = await fetchData();
  items.at(-1);
}
