import {
  AbstractRule,
  AbstractTokenNode,
  ParseFinishProps,
  ParseRuleChangeRuleResult,
  ParseRuleFinishRuleResult,
  ParseRuleProps,
  ParseRuleSkipCharsResult,
  ParseRuleFinishIterationResult,
  Parser,
} from "./p-v1/parser";

class CharTokenNode extends AbstractTokenNode {
  constructor(public char: string) {
    super();
  }
}

class NodesTokenNode extends AbstractTokenNode {
  constructor(public nodes: Record<string, AbstractTokenNode>) {
    super();
  }
}

class MainRule extends AbstractRule {
  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleFinishRuleResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishIterationResult {
    const char = props.textReader.getChars();
    const position = props.textReader.position;

    props.textReader.moveAnchorByChars(char);

    if (/[a-z]/.test(char)) {
      return {
        type: "FINISH_ITERATION",
        tokenName: `${position}`,
        factoryToken: () => new CharTokenNode(char),
      };
    }

    return {
      type: "SKIP_CHARS",
    };
  }
  finish(props: ParseFinishProps): AbstractTokenNode {
    return new NodesTokenNode(props.tokens);
  }
}

const main = async () => {
  const text = `
  abs  zz
    \n ool 
  `;

  const token = Parser.parse({
    text,
    factoryRule: () => new MainRule(),
  });

  console.log(token);
};

main();
