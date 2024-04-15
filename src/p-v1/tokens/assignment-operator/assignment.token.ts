import { AbstractTokenNode } from "../../parser";
import { ExpressionNode } from "../types";

export class AssignmentTokenNode extends AbstractTokenNode {
  public readonly identifier!: string;
  public readonly value!: ExpressionNode;

  constructor(props: { identifier: string; value: ExpressionNode }) {
    super();

    this.identifier = props.identifier;
    this.value = props.value;
  }
}
