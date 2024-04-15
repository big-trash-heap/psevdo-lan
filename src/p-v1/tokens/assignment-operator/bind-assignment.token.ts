import { AbstractTokenNode } from "../../parser";
import { AssignmentTokenNode } from "./assignment.token";

export class BindAssignmentTokenNode extends AbstractTokenNode {
  constructor(public readonly assignment: AssignmentTokenNode) {
    super();
  }
}
