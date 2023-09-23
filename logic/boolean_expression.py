from itertools import product
from logic.logic import AND, OR, NOT, IMP, IFF, VAR
from logic.expression_constructor import construct_ast
from logic.expresion_parser import parse_bool_expression

class Expression:
    def __init__(self, expression):
        parsed_expression = parse_bool_expression(expression)
        self.expression = construct_ast(parsed_expression)

    def evaluate(self, assignment):
        return self.expression.evaluate(assignment)

    def __str__(self):
        return str(self.expression)
    
    def __repr__(self):
        return repr(self.expression)
    
    def __eq__(self, object: object) -> bool:
        if not isinstance(object, Expression):
            return False
        return self.expression == object.expression

    def __getattr__(self, name):
        return getattr(self.expression, name)