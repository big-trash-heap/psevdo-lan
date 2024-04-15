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
import { AssignmentTokenNode, IdentifierTokenNode } from "../tokens";
import { ExpressionRule } from "./expression.rule";
import { IdentifierRule } from "./identifier.rule";

export class AssignmentRule extends AbstractRule {
  private stage: "name" | "assignment" | "expression" = "name";

  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult {
    if (this.stage === "name") {
      this.stage = "assignment";

      return {
        type: "CHANGE_RULE",
        tokenName: "name",
        factoryRule: () => new IdentifierRule(),
      };
    } else if (this.stage === "assignment") {
      const char = props.textReader.getChars();
      props.textReader.moveAnchor(1);

      if (/[ \t]/.test(char)) {
        return {
          type: "SKIP_CHARS",
        };
      }

      if (char === "=") {
        this.stage = "expression";
        return {
          type: "CHANGE_RULE",
          tokenName: "expression",
          factoryRule: () => new ExpressionRule(),
        };
      }

      throw new Error(`Unexpected character ${char}`);
    } else {
      return {
        type: "FINISH_RULE",
      };
    }
  }
  finish(props: ParseFinishProps): AbstractTokenNode {
    const identifier = props.tokens["name"] as IdentifierTokenNode;

    return new AssignmentTokenNode({
      identifier: identifier.name,
      value: props.tokens["expression"] as any,
    });
  }
}
