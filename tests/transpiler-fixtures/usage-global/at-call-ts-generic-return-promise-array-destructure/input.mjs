async function fetchItems<T>(item: T): Promise<T[]> {
  return [item];
}
const [first] = await fetchItems('hello');
first.at(0);
