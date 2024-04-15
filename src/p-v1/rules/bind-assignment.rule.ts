import {
  AbstractRule,
  AbstractTokenNode,
  ParseFinishProps,
  ParseRuleChangeRuleResult,
  ParseRuleFinishIterationResult,
  ParseRuleFinishRuleResult,
  ParseRuleProps,
  ParseRuleSkipCharsResult,
} from "../parser";
import { BindAssignmentTokenNode } from "../tokens";
import { AssignmentRule } from "./assignment.rule";

export class BindAssignmentRule extends AbstractRule {
  private isEndof = false;

  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult {
    if (this.isEndof) {
      return {
        type: "FINISH_RULE",
      };
    }

    const modificator = props.textReader.getChars(3);
    props.textReader.moveAnchorByChars(modificator);

    if (modificator !== "let") {
      throw new Error(`Expected 'let' but got ${modificator}`);
    }

    const char = props.textReader.getChars();
    props.textReader.moveAnchor();

    if (char !== " ") {
      throw new Error(`Expected ' ' but got ${char}`);
    }

    this.isEndof = true;
    return {
      type: "CHANGE_RULE",
      tokenName: "assignment",
      factoryRule: () => new AssignmentRule(),
    };
  }
  finish(props: ParseFinishProps): AbstractTokenNode {
    return new BindAssignmentTokenNode(props.tokens["assignment"] as any);
  }
}
