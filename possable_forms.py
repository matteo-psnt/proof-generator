from boolean_expresion import BooleanExpression
from logic import AND, OR, NOT, IMPLIES, IFF, Variable
from proof_rules import rules_list


# Takes in a boolean statment and then creates a list of all the possible forms of that statment
def possible_forms(expr, max_depth=25, rules_list=rules_list, depth=0, forms=None) -> set:
    if forms == None:
        forms = set()

    if not isinstance(expr, bool) and len(expr) > 35:
        return forms
    
    if isinstance(expr, Variable):
        return forms
    
    if depth > max_depth:
        return forms
    
    forms_with_rule = set()
    for rule in rules_list:
        if rule.can_apply(expr):
            if rule.apply(expr) not in forms:
                forms_with_rule.add(rule.apply(expr))
    
    psbl_forms = set()
    for form in forms_with_rule:
        if form not in forms:
            psbl_forms.update(possible_forms(form, max_depth, rules_list, depth+1, forms))
    
    forms.update(psbl_forms)
    forms.update(forms_with_rule)
                
    
    new_forms = set()
    more_forms = set()
    
    if isinstance(expr, NOT):
        psbl_forms = possible_forms(expr.expression, max_depth, rules_list, depth+1)
        new_forms = {NOT(exresion) for exresion in psbl_forms}
    
    elif isinstance(expr, (AND, OR, IMPLIES, IFF)):
        top_type = type(expr)
        psbl_forms_left = possible_forms(expr.left, max_depth, rules_list, depth+1)
        psbl_forms_right = possible_forms(expr.right, max_depth, rules_list, depth+1)
        
        for left_form in psbl_forms_left:
            for right_form in psbl_forms_right:
                form = top_type(left_form, right_form)
                new_forms.add(form)
                    
    for exresion in new_forms:
        if exresion not in forms:
            more_forms.update(possible_forms(expr, max_depth, rules_list, depth+1))
    
    forms.update(more_forms)
    forms.update(new_forms)
        
                
    return forms


if __name__ == "__main__":
    expr = BooleanExpression("!(a <=> b)").expression
    print(expr)
    print(repr(expr))
    forms = possible_forms(expr, max_depth=5)
    for form in forms:
        print(form)

'''
((c | a) => (((!c) | b) => c))
!(a => !((!c) => a) | d)
'''