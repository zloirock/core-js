// A write through an instance field's this cannot replace an unrelated container's slot.
const box = { values: [1, 2] };
class C { value = this.values = 'abc'; }
consume(new C(), box.values.at(-1));
