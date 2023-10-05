from collections import deque
from logic.boolean_expression import get_expr_from_str
from logic.logic import AND, OR, NOT, IMP, IFF, VAR
from rules.TP_rules import rules_list


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

def _apply_rules_to_expr(expr, rules_list) -> set:
    '''Helper function to apply rules to an expression and its sub-expressions'''
    results = set()
    
    for rule in rules_list:
        if rule.can_apply(expr):
            results.add((rule.rule_name, rule.apply(expr)))
    
    if isinstance(expr, NOT):
        for rule_name, new_expr in _apply_rules_to_expr(expr.expression, rules_list):
            results.add((rule_name, NOT(new_expr)))
            
    elif isinstance(expr, (AND, OR, IMP, IFF)):
        left_expr = expr.left
        right_expr = expr.right

        left_options = set()
        right_options = set()
        
        for new_rule, new_expr in _apply_rules_to_expr(left_expr, rules_list):
            left_options.add((new_rule, new_expr))
        
        for new_rule, new_expr in _apply_rules_to_expr(right_expr, rules_list):
            right_options.add((new_rule, new_expr))

        for new_rule, new_left in left_options:
            results.add((new_rule, type(expr)(new_left, right_expr)))
            
        for new_rule, new_right in right_options:
            results.add((new_rule, type(expr)(left_expr, new_right)))
    
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

        for rule_name, new_expr in _apply_rules_to_expr(current_expr, rules_list):
            if new_expr not in visited:
                visited.add(new_expr)
                queue.append(Proof(new_expr, rule=rule_name, parent=current_proof, applied_sub_expr=current_expr))

    return None


if __name__ == "__main__":    
    expr1 = get_expr_from_str("(!(a => (b => c))) & ((!b | !(d | a)) & !d)")
    expr2 = get_expr_from_str("false")
    print(expr1)
    print(expr2)

    transformations = find_transformation_path(expr1, expr2)
    if transformations:
        print("1)", expr1)
        for i, (rule, expression, applied_sub_expr) in enumerate(transformations):
            print(f"{i + 2}) {expression} by {rule}")
        
    else:
        print("No transformation path found.")
