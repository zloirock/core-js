import "core-js/modules/es.string.at";
// when class has a real `static method` AND merged namespace exports a fn with the
// same name, the class member takes precedence (matches TS semantics). probe: class's
// `make` returns `string` (would trigger string.at), namespace's `make` returns `number[]`
// (would trigger array.at). only string.at appears -> class won the precedence race
class Container {
  static make(): string {
    return '';
  }
}
namespace Container {
  export function make(): number[] {
    return [];
  }
}
Container.make().at(0);