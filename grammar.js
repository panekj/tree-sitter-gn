// grammar.js - grammar file for GN

const IDENTIFIER_REGEX = /[a-zA-Z_][a-zA-Z_0-9]*/;
const INTEGER_REGEX = /0|(-?[1-9][0-9]*)/;
const HEX_REGEX = /0[xX][0-9a-fA-F][0-9a-fA-F]/;

// Helper function for binary expressions
function binary_expr($, spec) {
    // All binary operators in GN are left-associative
    return prec.left(spec.prec, seq(
        field('lhs', $._expr),
        field('op', spec.op),
        field('rhs', $._expr),
    ));
}

module.exports = grammar({
    name: 'gn',

    word: $ => $.identifier,

    extras: $ => [ /[ \t\r\n]+/, $.comment ],

    rules: {
        source_file: $ => repeat($._statement),
        _statement: $ => choice(
            $.assignment,
            $.call,
            $.condition,
        ),

        assign_op: $ => choice(
            '=',
            '+=',
            '-=',
        ),
        _lvalue: $ => choice(
            $.identifier,
            $.array_access,
            $.scope_access,
        ),
        assignment: $ => seq(
            field('target', $._lvalue),
            field('op', $.assign_op),
            field('expr', $._expr),
        ),

        call: $ => seq(
            field('target', $.identifier),
            '(', field('args', optional($._expr_list)), ')',
            field('block', optional($.block)),
        ),

        negation_unary_op: $ => '!',
        unary_expr: $ => seq(
            repeat($.negation_unary_op),
            $._primary_expr,
        ),

        arithmetic_binary_op: $ => choice(
            '+',
            '-',
        ),
        comparison_binary_op: $ => choice(
            '<',
            '<=',
            '>',
            '>=',
        ),
        equivalence_binary_op: $ => choice(
            '==',
            '!=',
        ),
        logical_and_binary_op: $ => '&&',
        logical_or_binary_op: $ => '||',
        arithmetic_binary_expr: $ => binary_expr($, {prec: 5, op: $.arithmetic_binary_op}),
        comparison_binary_expr: $ => binary_expr($, {prec: 4, op: $.comparison_binary_op}),
        equivalence_binary_expr: $ => binary_expr($, {prec: 3, op: $.equivalence_binary_op}),
        logical_and_binary_expr: $ => binary_expr($, {prec: 2, op: $.logical_and_binary_op}),
        logical_or_binary_expr: $ => binary_expr($, {prec: 1, op: $.logical_or_binary_op}),
        _expr: $ => choice(
            $.unary_expr,
            $.arithmetic_binary_expr,
            $.comparison_binary_expr,
            $.equivalence_binary_expr,
            $.logical_and_binary_expr,
            $.logical_or_binary_expr,
        ),

        // Note: This allows trailing commas everwhere, unlike Google GN
        _expr_list: $ => seq(
            $._expr,
            optional(seq(',', optional($._expr_list))),
        ),

        _primary_expr: $ => choice(
            $.integer,
            $.boolean,
            $.identifier,
            $.string,
            $.call,
            $.array_access,
            $.scope_access,
            $.block,
            $.paren_expr,
            $.array_expr,
        ),

        array_access: $ => seq(
            field('target', $.identifier),
            '[',
            field('index', $._expr),
            ']',
        ),
        scope_access: $ => seq(
            field('target', $.identifier),
            '.',
            field('field', $.identifier),
        ),
        paren_expr: $ => seq('(', $._expr, ')'),
        array_expr: $ => seq('[', optional($._expr_list), ']'),

        condition: $ => seq(
            'if', '(', field('cond', $._expr), ')',
            field('body', $.block),
            optional(seq(
                'else',
                choice(
                    field('else_if', $.condition),
                    field('else_body', $.block),
                )
            ))
        ),
        block: $ => seq('{', repeat($._statement), '}'),
        identifier: $ => IDENTIFIER_REGEX,
        integer: $ => INTEGER_REGEX,
        boolean: $ => choice('true', 'false'),
        string: $ => seq('"', optional($.string_content), '"'),
        string_content: $ => repeat1(choice(
            /[^\\\$"\n]+/, // Any character but: '\', '$', '"', or newline
            $.string_escape,
            $._string_backslash,
            $.string_expansion,
        )),
        string_escape: $ => token.immediate(/\\[\\|\$|"]/),
        _string_backslash: $ => token.immediate(/\\[^\\|\$|"]/),

        string_expansion: $ => choice(
            seq('$', alias(token.immediate(IDENTIFIER_REGEX), $.identifier)),
            seq('$', alias(token.immediate(HEX_REGEX), $.hex)),
            seq('${', choice(
                $.identifier,
                $.array_access,
                $.scope_access,
            ), '}'),
        ),
        comment: $ => token(prec(-1, /#.*\n/)),
    }
});
