import "core-js/modules/es.reflect.construct";
import "core-js/modules/es.array.at";
// @flow
// Reflect.construct uses the newTarget surface when a third argument is supplied.
declare class B {
  m(): string
}
declare class C {
  m(): number[]
}
Reflect.construct(B, [], C).m().at(0);