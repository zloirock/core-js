// class method with rest-param type annotation - ClassMethod node (babel) now visited by
// the extended `checkTypeAnnotations` visitor pattern. without this entry, Promise in rest
// annotation was missed on babel while unplugin picked it up via MethodDefinition wrapping
class Batcher {
  enqueue(first: Map<string, number>, ...rest: Array<Promise<unknown>>): void {}
}
