// grammar.js - grammar file for GN

// Helper function for binary expressions
function binaryExpr($, spec) {
    // All binary operators in GN are left-associative
    return prec.left(spec.prec, seq($._expr, spec.op, $._expr));
}

module.exports = grammar({
  name: 'gn',

  rules: {
    source_file: $ => repeat($._statement),
    _statement: $ => choice(
        $.assignment,
        $.call,
        $.condition,
    ),

    assignOp: $ => choice(
        '=',
        '+=',
        '-=',
    ),
    _lValue: $ => choice(
        $.identifier,
        $.arrayAccess,
        $.scopeAccess,
    ),
    assignment: $ => seq($._lValue, $.assignOp, $._expr),

    call: $ => seq($.identifier, '(', optional($._exprList), ')', optional($.block)),

    arithmeticBinaryOp: $ => choice(
        '+',
        '-',
    ),
    comparisonBinaryOp: $ => choice(
        '<',
        '<=',
        '>',
        '>=',
    ),
    equivalenceBinaryOp: $ => choice(
        '==',
        '!=',
    ),
    logicalAndBinaryOp: $ => '&&',
    logicalOrBinaryOp: $ => '||',
    // Note: This allows trailing commas everwhere, unlike Google GN
    _exprList: $ => seq($._expr, optional(seq(',', optional($._exprList)))),
    _expr: $ => choice(
        $.unaryExpr,
        $.arithmeticBinaryExpr,
        $.comparisonBinaryExpr,
        $.equivalenceBinaryExpr,
        $.logicalAndBinaryExpr,
        $.logicalOrBinaryExpr,
    ),
    arithmeticBinaryExpr: $ => binaryExpr($, {prec: 5, op: $.arithmeticBinaryOp}),
    comparisonBinaryExpr: $ => binaryExpr($, {prec: 4, op: $.comparisonBinaryOp}),
    equivalenceBinaryExpr: $ => binaryExpr($, {prec: 3, op: $.equivalenceBinaryOp}),
    logicalAndBinaryExpr: $ => binaryExpr($, {prec: 2, op: $.logicalAndBinaryOp}),
    logicalOrBinaryExpr: $ => binaryExpr($, {prec: 1, op: $.logicalOrBinaryOp}),

    unaryOp: $ => '!',
    unaryExpr: $ => seq(repeat($.unaryOp), $._primaryExpr),

    _primaryExpr: $ => choice(
        $.identifier,
        $.integer,
        $.string,
        $.call,
        $.arrayAccess,
        $.scopeAccess,
        $.block,
        $.parenExpr,
        $.arrayExpr,
    ),

    arrayAccess: $ => seq($.identifier, '[', $._expr, ']'),
    scopeAccess: $ => seq($.identifier, '.', $.identifier),
    parenExpr: $ => seq('(', $._expr, ')'),
    arrayExpr: $ => seq('[', optional($._exprList), ']'),

    condition: $ => seq('if', '(', $._expr, ')', $.block, optional(seq('else', choice($.condition, $.block)))),
    block: $ => seq('{', repeat($._statement), '}'),
    identifier: $ => /[a-z|A-Z]+[a-z|A-Z|0-9]*/,
    // Note: Maybe want to accept "incorrect" integers and then reject them
    // in the interpreter. "incorrect" being like: -0 or 0001
    integer: $ => /0|(-?[1-9]+[0-9]*)/,
    string: $ => /".*"/, // TODO: Implement this correctly
  }
});
