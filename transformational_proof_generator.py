from collections import deque
from boolean_expresion import BooleanExpression
from logic import AND, OR, NOT, IMP, IFF, VAR
from transformational_proof_rules import rules_list


class Proof:
    def __init__(self, expression, rule=None, parent=None, applied_sub_expr=None):
        self.expression = expression
        self.rule = rule
        self.parent = parent
        self.applied_sub_expr = applied_sub_expr

    def backtrack(self):
        path = []
        current = self
        while current.parent:
            path.append((current.rule, current.expression, current.applied_sub_expr))
            current = current.parent
        path.reverse()
        return path

def apply_rules_to_expr(expr, rules_list) -> set:
    '''Helper function to apply rules to an expression and its sub-expressions'''
    results = set()
    
    # Try applying rules to the current expression
    for rule in rules_list:
        if rule.can_apply(expr):
            results.add(rule.apply(expr))
    
    # If the expression has sub-expressions, try applying rules to them
    if isinstance(expr, NOT):
        for new_expr in apply_rules_to_expr(expr.expression, rules_list):
            results.add(NOT(new_expr))
    elif isinstance(expr, (AND, OR, IMP, IFF)):
        left_expr = expr.left
        right_expr = expr.right

        # Including the original expressions in the combinations
        left_options = set([left_expr]) | apply_rules_to_expr(left_expr, rules_list)
        right_options = set([right_expr]) | apply_rules_to_expr(right_expr, rules_list)

        for new_left in left_options:
            for new_right in right_options:
                results.add(type(expr)(new_left, new_right))
    
    return results

def find_transformation_path(start_expr, dest_expr, rules_list=rules_list, max_depth=15) -> list[tuple]:
    visited = set()
    queue = deque([Proof(start_expr)])

    while queue:
        current_proof = queue.popleft()
        current_expr = current_proof.expression

        if current_expr == dest_expr:
            return current_proof.backtrack()

        if hasattr(current_expr, '__len__') and len(current_expr) > max_depth:
            continue

        for new_expr in apply_rules_to_expr(current_expr, rules_list):
            if new_expr not in visited:
                visited.add(new_expr)
                queue.append(Proof(new_expr, rule=None, parent=current_proof, applied_sub_expr=current_expr))

    return None


if __name__ == "__main__":
    # You'll need to implement and add some rules to rules_list for this test to be meaningful.
    expr1 = BooleanExpression("(a => ((!c) | (b => c)))").expression
    expr2 = BooleanExpression("c | (a => (!c | ((!b) | c)))").expression
    expr2 = BooleanExpression("c | ((!a) | ((!c) | ((!b) | c)))").expression
    expr2 = BooleanExpression("!a").expression
    
    expr1 = BooleanExpression("(a => (b & (!d))) => (!!a)").expression
    expr2 = False
    
    print("="*30)
    print(expr1)
    print(expr2)

    transformations = find_transformation_path(expr1, expr2)
    if transformations:
        for rule, expression, applied_sub_expr in transformations:
            print(f"{expression} by {rule}")
        
        for rule, expression, applied_sub_expr in transformations:
            print(repr(expression) )
    else:
        print("No transformation path found.")
