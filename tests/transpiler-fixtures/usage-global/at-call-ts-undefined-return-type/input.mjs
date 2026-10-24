function getData(): undefined {
  return undefined;
}
// @ts-expect-error a read off a null or undefined type is the probe
getData().at(-1);
