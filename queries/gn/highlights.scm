(identifier) @variable
(call target: (_) @label)

[ "if" "else" ] @keyword

[
    (assign_op)
    (arithmetic_binary_op)
    (comparison_binary_op)
    (equivalence_binary_op)
    (logical_and_binary_op)
    (logical_or_binary_op)
    (negation_unary_op)
] @operator

[ "(" ")" "[" "]" "{" "}" ] @punctuation.bracket
[ "." "," ] @punctuation.delimiter

(string) @string
(string_escape) @string.escape
(string_expansion [ "$" "${" "}" ] @string.escape)
[ (integer) (hex) ] @number
(boolean) @boolean

(comment) @comment
(ERROR) @error
