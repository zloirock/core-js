class Target { item = [7]; }
class NewTarget { get item() { return "text"; } }
class Methods { item() { return "target"; } }
class Other { item() { return [9]; } }
export const field = Reflect.construct(Target, [], NewTarget).item.at(0);
export const method = Reflect.construct(Methods, ...[[], Other]).item().at(0);
