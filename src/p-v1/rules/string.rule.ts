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
import { StringTokenNode } from "../tokens";

export class StringRule extends AbstractRule {
  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult {
    let char = props.textReader.getChars();
    while (char !== '"') {
      char = props.textReader.moveAnchor().getChars();
    }

    props.textReader.moveAnchor();
    return {
      type: "FINISH_RULE",
    };
  }
  finish(props: ParseFinishProps): AbstractTokenNode {
    const text = props.textReader.getReadChars().slice(0, -1);

    return new StringTokenNode(text);
  }
}
