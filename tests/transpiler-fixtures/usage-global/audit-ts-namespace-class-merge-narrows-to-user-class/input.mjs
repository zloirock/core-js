// TS declaration merging: `class MyContainer` + `namespace MyContainer { export
// function build }`. resolver must walk the merged namespace to determine the static
// `build`'s return type. result narrows to user's MyContainer<T> - call .at(0) on it
// must NOT inject array.at polyfill (user's class has no `at`, no global Array dispatch)
class MyContainer<T> {
  data: T[] = [];
}
namespace MyContainer {
  export function build<T>(arr: T[]): MyContainer<T> {
    const b = new MyContainer<T>();
    b.data = arr;
    return b;
  }
}

const c = MyContainer.build([1, 2, 3]);
c.at(0);
