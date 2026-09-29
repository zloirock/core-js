// Private field writes retain their union within the declaring class.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
class Box {
  #data = [10, 20];
  change() { this.#data = "1020"; }
  read() { return this.#data.includes("02"); }
}
const box = new Box();
box.change();
export const result = box.read();
