type Brand<T, B> = T & { __brand: B };
type UserID = Brand<string, 'UserID'>;
declare const id: UserID;
id.at(0);
