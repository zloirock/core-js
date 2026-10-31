// Symmetric primitive-return variant of the array-return case: the merged
// namespace's function returns `string`. `StrWrapper.make().at(0)` must emit
// only `es.string.at` (not Array#at) - non-array primitive narrowing through a
// merged namespace.
class StrWrapper {}
namespace StrWrapper {
  export function make(): string {
    return '';
  }
}

const s = StrWrapper.make();
s.at(0);
