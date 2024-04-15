import { AbstractTokenNode } from "../parser";

export class IdentifierTokenNode extends AbstractTokenNode {
  constructor(public readonly name: string) {
    super();
  }
}
