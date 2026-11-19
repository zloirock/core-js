// An ambient self still exposes the statics the target needs.
declare const self: any;
export const value = self.Promise.withResolvers;
