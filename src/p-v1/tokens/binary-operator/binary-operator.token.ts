import { AbstractTokenNode } from "../../parser";
import { ExpressionNode } from "../types";

export class BinaryOperatorTokenNode extends AbstractTokenNode {
  public readonly chars!: string;
  public readonly left!: ExpressionNode;
  public readonly right!: ExpressionNode;

  constructor(props: {
    chars: string;
    left: ExpressionNode;
    right: ExpressionNode;
  }) {
    super();

    this.chars = props.chars;
    this.left = props.left;
    this.right = props.right;
  }
}
