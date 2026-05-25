// passthrough recognition for `{[K in keyof T]: (T[K])}`: oxc preserves the paren as
// TSParenthesizedType on `node.typeAnnotation`, babel parser drops it. without the
// peel in `unwrapMappedTypePassthrough` the oxc path bypasses the cheap passthrough
// and walks per-key via `expandMappedTypeMembers` (semantically equivalent but slower).
// validates both adapters reach the same narrow through the paren-wrapped passthrough
type Container<T> = { [K in keyof T]: (T[K]) };
type Items = Container<{ items: number[] }>['items'];
const x: Items = [];
x.at(-1);
