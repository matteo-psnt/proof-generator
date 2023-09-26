from logic.logic import AND, OR, NOT, IMP, IFF, VAR

def construct_ast(tokens):
    """Construct an Abstract Syntax Tree (AST) from the list of tokens."""
    if not tokens:
        raise ValueError("Expression cannot be empty")
    
    if tokens[0] == '(':
        counter = 1
        right_paren_index = 1
        while counter != 0:
            if right_paren_index >= len(tokens):
                raise ValueError("Unbalanced parentheses")
            if tokens[right_paren_index] == '(':
                counter += 1
            elif tokens[right_paren_index] == ')':
                counter -= 1
            right_paren_index += 1
            
        inner_expression = construct_ast(tokens[1:right_paren_index - 1])
        rest_expression = tokens[right_paren_index:]
        
        if rest_expression:
            return construct_ast([inner_expression] + rest_expression)
        else:
            return inner_expression
        
    if tokens[0] == '!':
        return NOT(construct_ast(tokens[1:]))

    comma_hierarchy = 0
    for op, cls in [('&', AND), ('|', OR), ('=>', IMP), ('<=>', IFF)]:
        for token in tokens:
            if token == '(':
                comma_hierarchy += 1
            elif token == ')':
                comma_hierarchy -= 1
            elif token == op and comma_hierarchy == 0:
                i = tokens.index(op)
                left = construct_ast(tokens[:i])
                right = construct_ast(tokens[i + 1:])
                return cls(left, right)

    if isinstance(tokens[0], (NOT, AND, OR, IMP, IFF)):
        return tokens[0]

    if tokens[0] == 'true':
        return True
    
    if tokens[0] == 'false':
        return False

    return VAR(tokens[0])