function getValue<T extends { data: number[] }>(obj: T): T["data"] {
  return obj.data;
}
getValue<{ data: number[] }>({ data: [1, 2] }).at(0);
