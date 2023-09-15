import re
from itertools import product
from logic import AND, OR, NOT, IMPLIES, IFF, Variable
from expresion_constructor import construct_ast
from expresion_parser import parse_bool_expression

class BooleanExpression:
    def __init__(self, expression):
        parsed_expression = parse_bool_expression(expression)
        self.expression = construct_ast(parsed_expression)

    def evaluate(self, assignment):
        return self.expression.evaluate(assignment)

    def __str__(self):
        return str(self.expression)
    
    def __eq__(self, object: object) -> bool:
        if not isinstance(object, BooleanExpression):
            return False
        return self.generate_truth_table == object.generate_truth_table

    def _extract_variables(self, expr):
        """Recursively extract unique variables from the expression."""
        if isinstance(expr, Variable):
            return {expr.name}
        elif isinstance(expr, NOT):
            return self._extract_variables(expr.expression)
        elif isinstance(expr, (AND, OR, IMPLIES, IFF)):
            return self._extract_variables(expr.left) | self._extract_variables(expr.right)
        return set()

    def generate_truth_table(self):
        """Generate a truth table for the BooleanExpression."""
        
        variables = list(self._extract_variables(self.expression))
        truth_table = []

        # Generate all possible assignments for these variables
        for values in product([False, True], repeat=len(variables)):
            assignment = dict(zip(variables, values))
            # Evaluate the expression for each assignment and store the results
            result = self.evaluate(assignment)
            truth_table.append((assignment, result))

        return truth_table

    def print_truth_table(self):
        truth_table = self.generate_truth_table()
        if not truth_table:
            return
        seperator = " "
        # Print header
        variables = sorted(list(truth_table[0][0].keys()))
        print(*variables, "OUT", sep=seperator)
        # Print each row
        for assignment, result in truth_table:
            values = ['T' if assignment[var] else 'F' for var in variables]
            result_str = 'T' if result else 'F'
            print(*values, result_str, sep=seperator)
    
    
if __name__ == '__main__':
    boolean_expressions = [
    "A & B",
    "!A | C",
    "A <=> B",
    "A & (B | C)",
    "!A & B => C",
    "(A | B) & (!C | D)",
    "!A => B & C",
    "(A & B) => !D",
    "A | B & C | !D",
    "!(A & B) => C | D"
    ]
    for expr in boolean_expressions:
        print(expr)
        bool_expresion = BooleanExpression(expr)
        bool_expresion.simplify()
        print(bool_expresion)
        print("-"*50)
       