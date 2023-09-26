from logic.logic import AND, OR, NOT, IMP, IFF, VAR
from rules.transformational_proof_rules import rules_list


# Takes in a boolean statment and then creates a list of all the possible forms of that statment
def possible_forms(expr, max_depth=15, max_len=15, rules_list=rules_list, depth=0, forms=None) -> set:
    if forms is None:
        forms = set()

    # Ensure termination
    if depth > max_depth or (hasattr(expr, '__len__') and len(expr) > max_len):
        return forms

    new_forms = set()

    # Apply all rules from the rules list
    for rule in rules_list:
        if rule.can_apply(expr):
            new_form = rule.apply(expr)
            if new_form not in forms:
                new_forms.add(new_form)
                new_forms.update(possible_forms(new_form, max_depth, max_len, rules_list, depth + 1))

    # Generate forms for the sub-expressions
    if isinstance(expr, NOT):
        for form in possible_forms(expr.expression, max_depth, max_len, rules_list, depth + 1):
            new_forms.add(NOT(form))

    elif isinstance(expr, (AND, OR, IMP, IFF)):
        left_exprs = possible_forms(expr.left, max_depth, max_len, rules_list, depth + 1)
        right_exprs = possible_forms(expr.right, max_depth, max_len, rules_list, depth + 1)
        left_exprs.add(expr.left)
        right_exprs.add(expr.right)
        for left in left_exprs:
            for right in right_exprs:
                new_forms.add(type(expr)(left, right))

    forms.update(new_forms)
    return forms