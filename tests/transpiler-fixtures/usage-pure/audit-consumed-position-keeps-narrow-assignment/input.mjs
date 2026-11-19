const assignedThenDropped = {
  slots: [1, 2],
  read() {
    return this.slots.includes(1);
  }
};
let sink1;
sink1 = assignedThenDropped;
