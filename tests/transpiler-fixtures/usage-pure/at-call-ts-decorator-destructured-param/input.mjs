function dec(v: any) { return (_: any) => _; }

@dec((({ items }: { items: number[] }) => items.at(0))({ items: [1, 2] }))
class A {}
