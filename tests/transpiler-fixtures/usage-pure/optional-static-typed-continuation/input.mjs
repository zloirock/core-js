type Item = { label<T>(value: T): T };

export function read(useBuiltin: boolean, item: Item) {
  let groups: { groupBy?: typeof Map.groupBy };
  if (useBuiltin) groups = Map;
  else groups = {};
  return groups?.groupBy?.<number, Item>([item], () => 1).get(1)?.[0].label<string>('ok');
}
