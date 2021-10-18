(identifier) @variable
(call target: (_) @label)

[
    "if"
    "else"
] @keyword

[
    (true)
    (false)
] @boolean

[
    (assignOp)
    (arithmeticBinaryOp)
    (comparisonBinaryOp)
    (equivalenceBinaryOp)
    (logicalAndBinaryOp)
    (logicalOrBinaryOp)
    (negationUnaryOp)
] @operator

[ "(" ")" "[" "]" "{" "}" ] @punctuation.bracket
[ "." "," ] @punctuation.delimiter

(string) @string
(stringEscape "\\" @string.escape ["\\" "$" "\""] @string)
(stringExpansion ["$" "{" "}"] @string.escape)
[ (integer) (stringHex) ] @number

(comment) @comment
(ERROR) @error
