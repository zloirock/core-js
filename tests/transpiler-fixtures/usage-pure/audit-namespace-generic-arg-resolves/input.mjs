// Namespace-local type used as a GENERIC TYPE ARGUMENT (`Container<LocalArr>`). type-
// arg resolution must also find LocalArr through the same lookup-path mechanism so the
// nested element type narrows to number[] -> Array dispatch.
namespace NS {
  type LocalArr = number[];
  type Container<T> = {
    data: T;
  };
  declare const x: Container<LocalArr>;
  x.data.at(0);
}
