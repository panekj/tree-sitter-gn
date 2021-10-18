// grammar.js - grammar file for GN

// Helper function for binary expressions
function binaryExpr($, spec) {
    // All binary operators in GN are left-associative
    return prec.left(spec.prec, seq(
        field('lhs', $._expr),
        field('op', spec.op),
        field('rhs', $._expr),
    ));
}

module.exports = grammar({
    name: 'gn',

    extras: $ => [' ', '\t', '\r', '\n', $.comment ],

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
        assignment: $ => seq(
            field('target', $._lValue),
            field('op', $.assignOp),
            field('expr', $._expr),
        ),

        call: $ => seq(
            field('target', $.identifier),
            '(', field('arg_exprs', optional($._exprList)), ')',
            field('block', optional($.block)),
        ),

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
        arithmeticBinaryExpr: $ => binaryExpr($, {prec: 5, op: $.arithmeticBinaryOp}),
        comparisonBinaryExpr: $ => binaryExpr($, {prec: 4, op: $.comparisonBinaryOp}),
        equivalenceBinaryExpr: $ => binaryExpr($, {prec: 3, op: $.equivalenceBinaryOp}),
        logicalAndBinaryExpr: $ => binaryExpr($, {prec: 2, op: $.logicalAndBinaryOp}),
        logicalOrBinaryExpr: $ => binaryExpr($, {prec: 1, op: $.logicalOrBinaryOp}),
        // Note: This allows trailing commas everwhere, unlike Google GN
        _exprList: $ => seq(
            field('head', $._expr),
            field('next', optional(seq(',', optional($._exprList)))),
        ),
        _expr: $ => choice(
            $.unaryExpr,
            $.arithmeticBinaryExpr,
            $.comparisonBinaryExpr,
            $.equivalenceBinaryExpr,
            $.logicalAndBinaryExpr,
            $.logicalOrBinaryExpr,
        ),

        negationUnaryOp: $ => '!',
        unaryExpr: $ => seq(
            field('negation', repeat($.negationUnaryOp)),
            field('expr', $._primaryExpr),
        ),

        _primaryExpr: $ => choice(
            $.identifier,
            $.integer,
            $.true,
            $.false,
            $.string,
            $.call,
            $.arrayAccess,
            $.scopeAccess,
            $.block,
            $.parenExpr,
            $.arrayExpr,
        ),

        arrayAccess: $ => seq(
            field('target', $.identifier),
            '[',
            field('index', $._expr),
            ']',
        ),
        scopeAccess: $ => seq(
            field('target', $.identifier),
            '.',
            field('field', $.identifier),
        ),
        parenExpr: $ => seq(
            '(',
            field('expr', $._expr),
            ')',
        ),
        arrayExpr: $ => seq(
            '[',
            field('exprs', optional($._exprList)),
            ']',
        ),

        condition: $ => seq(
            'if', '(', field('cond_expr', $._expr), ')',
            field('body', $.block),
            optional(seq(
                'else',
                choice(
                    field('else_if', $.condition),
                    field('else_body', $.block),
                )
            ))
        ),
        block: $ => seq(
            '{',
            field('statements', repeat($._statement)),
            '}',
        ),
        identifier: $ => /[a-zA-Z_]+[a-zA-Z_0-9]*/,
        // Note: Maybe should accept "incorrect" integers and then reject them
        // in the interpreter. "incorrect" being like: -0 or 0001
        integer: $ => /0|(-?[1-9]+[0-9]*)/,
        true: $ => 'true',
        false: $ => 'false',
        string: $ => seq('"', repeat(choice(
            $._stringChar,
            $.stringEscape,
            $.stringExpansion,
        )), '"'),
        _stringChar: $ => /[^\\\$"\n]/, // Any character but: '\', '$', '"', or newline
        stringEscape: $ => seq('\\', choice('\\', '$', '"')), // Written like this to support syntax highlighting
        stringExpansion: $ => seq('$', choice(
            $.identifier,
            seq('{', choice(
                $.identifier,
                $.arrayAccess,
                $.scopeAccess,
            ), '}'),
            $.stringHex,
        )),
        stringHex: $ => /0x[0-9a-fA-F][0-9a-fA-F]/,
        comment: $ => /#.*\n/,
    }
});
