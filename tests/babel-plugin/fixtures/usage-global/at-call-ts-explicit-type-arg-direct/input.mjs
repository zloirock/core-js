function cast<T>(x: unknown): T {
  return x as T;
}
cast<string>(0).at(0);
cast<string>(1).includes('x');
