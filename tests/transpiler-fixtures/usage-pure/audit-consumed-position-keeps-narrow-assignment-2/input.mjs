const assignedThenHandedOut = {
  items: [1, 2],
  read() {
    return this.items.includes(1);
  }
};
let sink2;
sink(sink2 = assignedThenHandedOut);
