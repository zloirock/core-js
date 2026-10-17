// dereferenced-only targets and slots keep the narrow
const [localPattern] = [{ data: ['y'], read() { return this.data.at(5); } }];
localPattern.read();
