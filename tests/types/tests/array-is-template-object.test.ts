const t: boolean = Array.isTemplateObject([]);
Array.isTemplateObject({});
Array.isTemplateObject(["a", "b"]);
Array.isTemplateObject(Object.freeze(["foo", "bar"]));
Array.isTemplateObject(123);
Array.isTemplateObject("str");
Array.isTemplateObject(Symbol());

declare const x: unknown;
if (Array.isTemplateObject(x)) {
  x.raw;
  const _: readonly string[] = x.raw;
}
