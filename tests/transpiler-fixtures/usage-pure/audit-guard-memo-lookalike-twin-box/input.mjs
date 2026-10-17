export class Box {
  items = [];
  trim(fn) {
    return this.items?.flat(this.items.findIndex(fn));
  }
}
