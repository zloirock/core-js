abstract class Container {
  abstract fields: string[];
  abstract accessor label: string;
  abstract values(): number[];
}

export function readSlots(value: Container) {
  return [value.fields.at(0), value.label.at(0), value.values().includes(1)];
}
