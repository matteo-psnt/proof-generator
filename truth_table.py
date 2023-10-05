from itertools import product
from logic.logic import AND, OR, NOT, IMP, IFF, VAR
from logic.boolean_expression import get_expr_from_str
import argparse

def _extract_variables(expr):
    '''Recursively extract unique variables from the expression.'''
    if isinstance(expr, VAR):
        return {expr.name}
    elif isinstance(expr, NOT):
        return _extract_variables(expr.expression)
    elif isinstance(expr, (AND, OR, IMP, IFF)):
        return _extract_variables(expr.left) | _extract_variables(expr.right)
    return set()

def generate_truth_table(expression):
    '''Generate a truth table for the BooleanExpression.'''

    variables = list(_extract_variables(expression))
    truth_table = []

    # Generate all possible assignments for these variables
    for values in product([False, True], repeat=len(variables)):
        assignment = dict(zip(variables, values))
        result = expression.evaluate(assignment)
        truth_table.append((assignment, result))

    return truth_table

def print_truth_table(truth_table):
    '''Print the truth table in a readable format.'''
    if not truth_table:
        return
    separator = " "
    # Print header
    variables = sorted(list(truth_table[0][0].keys()))
    print(*variables, "OUT", sep=separator)
    # Print each row
    for assignment, result in truth_table:
        values = ['T' if assignment[var] else 'F' for var in variables]
        result_str = 'T' if result else 'F'
        print(*values, result_str, sep=separator)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate a truth table for a Boolean expression.')
    parser.add_argument('expression', metavar='expression', type=str, help='a Boolean expression')
    args = parser.parse_args()
    expr = get_expr_from_str(args.expression)
    print(expr)
    truth_table = generate_truth_table(expr)
    print_truth_table(truth_table)