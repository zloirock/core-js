// Either method can reach the call when the enum member is conditionally assigned.
enum Methods { Name = 'map' }
if (flag) (Methods as any).Name = 'filter';
export const selected = [1, 2, 3][Methods.Name](value => value % 2);
