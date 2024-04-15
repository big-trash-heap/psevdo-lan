import prettier from "prettier";

import { Parser } from "./parser";
import { ProgramRule } from "./rules/program.rule";
import {
  AssignmentTokenNode,
  BinaryOperatorTokenNode,
  BindAssignmentTokenNode,
  ExpressionNode,
  FunCallTokenNode,
  IdentifierTokenNode,
  NumberTokenNode,
  ProgramTokenNode,
  StringTokenNode,
} from "./tokens";

const code = `

fun sum(a, b) {
  return a + b
}

// This is main program

fun main() {
  let x = 5
  let s = sum(
    // first argument
    3 * 
    3 * 2,
    // second argument
    1 + x / 2.5,
  )

  x = 77

  print("Hello" + " " + "world!", 1 + 2 - x, s + x)
}

`;

const codemin = `fun random_code(a, zza) 
{
  let x = 2
  y = 4

  print(x, y, max())

  let z = y + x
  print(z)
}`;
// (((4 + (1 * 3)) + (2 / 3)) - 9)

async function main() {
  const token = Parser.parse({
    text: code,
    factoryRule: () => new ProgramRule(),
  }) as ProgramTokenNode;

  const buildStack = [] as string[];

  const expressionToString = (expr: ExpressionNode): string => {
    if (expr instanceof StringTokenNode) {
      return `"${expr.string}"`;
    }
    if (expr instanceof NumberTokenNode) {
      return expr.number.toString();
    }
    if (expr instanceof IdentifierTokenNode) {
      return expr.name;
    }
    if (expr instanceof FunCallTokenNode) {
      const buildStack = [] as string[];
      {
        buildStack.push(`${expr.name === "print" ? "console.log" : expr.name}`);
        buildStack.push(`(`);
        {
          for (const arg of expr.args) {
            buildStack.push(expressionToString(arg));
            buildStack.push(",");
          }
        }
        buildStack.push(`)`);
      }
      return buildStack.join("");
    }

    return `(${expressionToString(expr.left)} ${
      expr.chars
    } ${expressionToString(expr.right)})`;
  };

  for (const func of Object.values(token.funcs)) {
    buildStack.push(`function ${func.name}`);

    buildStack.push("(");
    {
      buildStack.push(func.args.join(", "));
    }
    buildStack.push(")");

    buildStack.push("{");
    {
      for (const expr of func.body) {
        if (expr instanceof FunCallTokenNode) {
          buildStack.push(expressionToString(expr));
        } else if (expr instanceof BindAssignmentTokenNode) {
          buildStack.push(
            `let ${expr.assignment.identifier} = ${expressionToString(
              expr.assignment.value
            )}`
          );
        } else if (expr instanceof AssignmentTokenNode) {
          buildStack.push(
            `${expr.identifier} = ${expressionToString(expr.value)}`
          );
        } else {
          buildStack.push(`return ${expressionToString(expr.token)}`);
        }
      }
    }
    buildStack.push("}");
  }

  buildStack.push("main()");

  const codeNotPretty = buildStack.join("\n");
  const codePretty = await prettier.format(codeNotPretty, {
    parser: "babel",
  });

  console.log("/// -----");
  console.log(codePretty);
  console.log("/// -----");

  const result = Function(codePretty)();
  console.log(`result: ${result}`);
}

main();
