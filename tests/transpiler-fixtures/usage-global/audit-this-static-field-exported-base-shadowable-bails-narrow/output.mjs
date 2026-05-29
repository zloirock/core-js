import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// an exported class can be subclassed by external code, so a subclass could shadow `items`
// with a non-array. with no in-module subclass to inspect, the `this`-rooted static read must
// conservatively bail to the general Array + String `.at` polyfill set
export class Base {
  static items: number[] = [];
  static getItems() {
    return this.items;
  }
}
Base.getItems().at(-1);