import {
  AbstractRule,
  AbstractTokenNode,
  ParseFinishProps,
  ParseRuleChangeRuleResult,
  ParseRuleFinishIterationResult,
  ParseRuleFinishRuleResult,
  ParseRuleProps,
  ParseRuleSkipCharsResult,
  ParseRuleTryChangeRuleResult,
} from "../parser";
import {
  BlockExpressionNode,
  FunDefineTokenNode,
  IdentifierTokenNode,
} from "../tokens";
import { AssignmentRule } from "./assignment.rule";
import { BindAssignmentRule } from "./bind-assignment.rule";
import { FunCallRule } from "./fun-call.rule";
import { FunReturnRule } from "./fun-return.rule";
import { IdentifierRule } from "./identifier.rule";

export class FunDefineRule extends AbstractRule {
  private stage: "identifier" | "args" | "body" | "finish" = "identifier";

  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult {
    if (this.stage === "finish") {
      return {
        type: "FINISH_RULE",
      };
    } else if (this.stage === "identifier") {
      const define = props.textReader.getChars("fun ".length);
      props.textReader.moveAnchorByChars(define);

      if (define !== "fun ") {
        throw new Error(`Expected 'fun' but got ${define}`);
      }

      let char = props.textReader.getChars();
      while (char === " ") {
        char = props.textReader.moveAnchor(1).getChars();
      }

      this.stage = "args";
      return {
        type: "CHANGE_RULE",
        tokenName: "identifier",
        factoryRule: () => new IdentifierRule(),
      };
    } else if (this.stage === "args") {
      const char = props.textReader.getChars();
      props.textReader.moveAnchor();

      if (/[ \t\n]/.test(char)) {
        return {
          type: "SKIP_CHARS",
        };
      }

      if (char === "(") {
        this.stage = "body";
        return {
          type: "CHANGE_RULE",
          tokenName: "args",
          factoryRule: () => new FunDefineArgsRule(),
        };
      }

      throw new Error(`Expected '(' but got ${char}`);
    } else {
      const char = props.textReader.getChars();
      props.textReader.moveAnchor();

      if (/[ \t\n]/.test(char)) {
        return {
          type: "SKIP_CHARS",
        };
      }

      if (char === "{") {
        this.stage = "finish";
        return {
          type: "CHANGE_RULE",
          tokenName: "body",
          factoryRule: () => new FunDefineBodyRule(),
        };
      }

      throw new Error(`Expected '{' but got ${char}`);
    }
  }

  finish(props: ParseFinishProps): AbstractTokenNode {
    return new FunDefineTokenNode({
      name: (props.tokens["identifier"] as IdentifierTokenNode).name,
      args: (props.tokens["args"] as FunDefineArgsTokenNode).args,
      body: (props.tokens["body"] as FunDefineBodyTokenNode).body,
    });
  }
}

///

class FunDefineArgsTokenNode extends AbstractTokenNode {
  constructor(public readonly args: string[]) {
    super();
  }
}

export class FunDefineArgsRule extends AbstractRule {
  private iteration = 0;
  private isNeedParseArgument = true;

  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult {
    const char = props.textReader.getChars();

    if (/[ \t\n]/.test(char)) {
      props.textReader.moveAnchor();
      return {
        type: "SKIP_CHARS",
      };
    }

    if (props.textReader.getChars(2) === "//") {
      props.textReader.moveAnchor(2);

      while (!/[\n]/.test(props.textReader.getChars())) {
        props.textReader.moveAnchor(1);
      }

      props.textReader.moveAnchor(1);
      return {
        type: "SKIP_CHARS",
      };
    }

    if (char === ")") {
      props.textReader.moveAnchor();
      return {
        type: "FINISH_RULE",
      };
    }

    if (char === ",") {
      props.textReader.moveAnchor();

      if (this.isNeedParseArgument) {
        throw new Error(`Expected identifier but got ,`);
      }
      this.isNeedParseArgument = true;

      return {
        type: "SKIP_CHARS",
      };
    }

    if (/[a-z_]/.test(char) && this.isNeedParseArgument) {
      this.isNeedParseArgument = false;
      return {
        type: "CHANGE_RULE",
        tokenName: `${++this.iteration}`,
        factoryRule: () => new IdentifierRule(),
      };
    }

    throw new Error(`Expected expression or ')' but got ${char}`);
  }

  finish(props: ParseFinishProps): AbstractTokenNode {
    const args = Object.entries(props.tokens)
      .map(([key, value]) => [+key, value] as const)
      .sort((a, b) => a[0] - b[0])
      .map((a) => a[1] as IdentifierTokenNode)
      .map((a) => a.name);

    return new FunDefineArgsTokenNode(args);
  }
}

///

class FunDefineBodyTokenNode extends AbstractTokenNode {
  constructor(public readonly body: BlockExpressionNode[]) {
    super();
  }
}

export class FunDefineBlockExpressionRule extends AbstractRule {
  private stage: "start" | "identifier" | "finish" = "start";
  private tryedAssignment = false;

  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult
    | ParseRuleTryChangeRuleResult {
    if (this.stage === "finish") {
      return {
        type: "FINISH_RULE",
      };
    } else if (this.stage === "start") {
      const char = props.textReader.getChars();

      if (/[ \t\n]/.test(char)) {
        props.textReader.moveAnchor();
        return {
          type: "SKIP_CHARS",
        };
      }

      if ("let " === props.textReader.getChars("let ".length)) {
        this.stage = "finish";
        return {
          type: "CHANGE_RULE",
          tokenName: "token",
          factoryRule: () => new BindAssignmentRule(),
        };
      }

      if ("return " === props.textReader.getChars("return ".length)) {
        this.stage = "finish";
        return {
          type: "CHANGE_RULE",
          tokenName: "token",
          factoryRule: () => new FunReturnRule(),
        };
      }

      if (!this.tryedAssignment) {
        this.stage = "finish";
        this.tryedAssignment = true;
        return {
          type: "TRY_CHANGE_RULE",
          tokenName: "token",
          factoryRule: () => new AssignmentRule(),
          callbackFail: () => {
            this.stage = "start";
          },
        };
      }

      this.stage = "identifier";

      return {
        type: "CHANGE_RULE",
        tokenName: "identifier",
        factoryRule: () => new IdentifierRule(),
      };
    } else {
      const char = props.textReader.getChars();

      if (/[ \t]/.test(char)) {
        props.textReader.moveAnchor();
        return {
          type: "SKIP_CHARS",
        };
      }

      const identifier = props.tokens["identifier"] as IdentifierTokenNode;

      if (char === "(") {
        props.textReader.moveAnchor();
        this.stage = "finish";
        return {
          type: "CHANGE_RULE",
          tokenName: "token",
          factoryRule: () => new FunCallRule(identifier.name),
        };
      }

      throw new Error(`Expected '(' but got ${char}`);
    }
  }

  finish(props: ParseFinishProps): AbstractTokenNode {
    return props.tokens["token"];
  }
}

export class FunDefineBodyRule extends AbstractRule {
  private iteration = 0;

  parse(
    props: ParseRuleProps
  ):
    | ParseRuleSkipCharsResult
    | ParseRuleChangeRuleResult
    | ParseRuleFinishRuleResult
    | ParseRuleFinishIterationResult {
    const char = props.textReader.getChars();

    if (/[ \t\n]/.test(char)) {
      props.textReader.moveAnchor();
      return {
        type: "SKIP_CHARS",
      };
    }

    if (char === "}") {
      props.textReader.moveAnchor();
      return {
        type: "FINISH_RULE",
      };
    }

    return {
      type: "CHANGE_RULE",
      tokenName: `${++this.iteration}`,
      factoryRule: () => new FunDefineBlockExpressionRule(),
    };
  }
  finish(props: ParseFinishProps): AbstractTokenNode {
    const tokens = Object.entries(props.tokens)
      .map(([key, value]) => [+key, value] as const)
      .sort((a, b) => a[0] - b[0])
      .map((a) => a[1]);

    return new FunDefineBodyTokenNode(tokens as any);
  }
}
