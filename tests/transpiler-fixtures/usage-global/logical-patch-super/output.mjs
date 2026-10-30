import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A super write keeps the native reference and its getter/setter behavior.
// Super is not an expression value that an instance helper can receive.
export class Box extends Array {
  install() {
    return super.at ||= () => 'fallback';
  }
}