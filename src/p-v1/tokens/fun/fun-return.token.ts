import { AbstractTokenNode } from "../../parser";
import { ExpressionNode } from "../types";

export class FunReturnTokenNode extends AbstractTokenNode {
  constructor(public readonly token: ExpressionNode) {
    super();
  }
}
