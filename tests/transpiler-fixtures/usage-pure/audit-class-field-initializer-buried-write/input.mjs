// a NON-fn field initializer runs at construction with `this` = instance: a buried
// `this.<field>` write inside it mutates the field-flow surface exactly like a
// constructor write, so the narrowed field bails to generic
class Poisoned {
  items = [1, 2, 3];
  poison = this.items = 'string';
  read() {
    return this.items.at(0);
  }
}
export const viaBuriedWrite = new Poisoned().read();

// the write-free field keeps its narrow
class Clean {
  items = [1, 2, 3];
  read() {
    return this.items.includes(1);
  }
}
export const viaCleanField = new Clean().read();
