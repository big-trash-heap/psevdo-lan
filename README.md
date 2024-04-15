# Попытка (ради практики) написать свой лексер

1. Разбиваем текст на токены получая дерево
2. Генерируем JS код на основе полученного дерева

### Исходный код

```
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
```

### Результирующий код

```js
function sum(a, b) {
  return a + b;
}
function main() {
  let x = 5;
  let s = sum(3 * 3 * 2, 1 + x / 2.5);
  x = 77;
  console.log("Hello" + " " + "world!", 1 + 2 - x, s + x);
}
main();
```
