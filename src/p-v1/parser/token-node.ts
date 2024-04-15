export abstract class AbstractTokenNode {
  static assertInstanceof<C extends new (...args: any[]) => any>(
    object: any,
    constructor: C
  ): asserts object is InstanceType<C> {
    if (object instanceof constructor) {
      return;
    }
    throw new Error(`node is not instance of ${constructor.name}`);
  }
}
