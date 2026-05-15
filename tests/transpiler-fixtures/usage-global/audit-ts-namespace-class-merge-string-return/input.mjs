// symmetric to array-return: namespace exports a fn returning `string`. downstream
// `.at(0)` must narrow to string-receiver dispatch -> es.string.at polyfill (not
// array.at). exercises non-array primitive narrowing through the namespace lookup
class StrWrapper {}
namespace StrWrapper {
  export function make(): string {
    return '';
  }
}

const s = StrWrapper.make();
s.at(0);
