function f<T extends { id: string }>(obj: T): T['id'] {
  return obj.id;
}
const r = f({ id: 'x' });
r.at(0);
