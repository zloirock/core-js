class A extends Promise { static async f() { return await super.resolve(1); } }
