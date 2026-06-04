// usage-global realistic DI: a constructor with TWO defaulted parameter-properties of different
// shapes (`public readonly cache = new Map()`, `private items = [...]`). both parse as
// TSParameterProperty wrapping an AssignmentPattern and crashed estree-toolkit's scope crawl; both
// default initializers must still be processed. regression lock
export class Service {
  constructor(public readonly cache: Map<string, number> = new Map(), private items = [1, 2, 3]) {}
}
[Service];
