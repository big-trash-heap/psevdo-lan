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
import { IdentifierTokenNode } from "../tokens";

export class IdentifierRule extends AbstractRule {
  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult {
    let char = props.textReader.getChars();
    while (/[a-z_]/.test(char)) {
      char = props.textReader.moveAnchor(1).getChars();
    }

    return {
      type: "FINISH_RULE",
    };
  }
  finish(props: ParseFinishProps): AbstractTokenNode {
    const text = props.textReader.getReadChars();

    if (text.length === 0) {
      throw new Error("Empty identifier");
    }

    return new IdentifierTokenNode(text);
  }
}
