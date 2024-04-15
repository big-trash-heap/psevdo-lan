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
import { NumberTokenNode } from "../tokens";

export class NumberRule extends AbstractRule {
  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult {
    let reader = props.textReader;

    const readNumbers = () => {
      let char = reader.getChars();
      while (/[0-9]/.test(char)) {
        char = reader.moveAnchor(1).getChars();
      }

      return char;
    };

    if (readNumbers() === ".") {
      reader.moveAnchor(1);
      readNumbers();
    }

    return {
      type: "FINISH_RULE",
    };
  }

  finish(props: ParseFinishProps): AbstractTokenNode {
    const number = Number(props.textReader.getReadChars());
    return new NumberTokenNode(number);
  }
}
