export class Pending {
  static make({ Promise: { withResolvers } = Number } = globalThis) {
    return withResolvers;
  }
}
