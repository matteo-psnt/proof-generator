from logic.expression_constructor import construct_ast
from logic.expression_parser import parse_bool_expression, add_parentheses

def get_expr_from_str(expression_string):
    parsed_expression = parse_bool_expression(expression_string)
    ordered_parsed_expression = add_parentheses(parsed_expression)
    bool_expression = construct_ast(ordered_parsed_expression)
    return bool_expression