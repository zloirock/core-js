declare namespace CoreJS {
  // We should use String without the matchAll method to avoid signature conflicts
  export type StringBase = Omit<String, 'matchAll'>;
}
