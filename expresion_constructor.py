from logic import AND, OR, NOT, IMPLIES, IFF, Variable

def construct_ast(tokens):
    """
    Construct an Abstract Syntax Tree (AST) from the list of tokens.
    """
    if not tokens:
        return None
    
    if tokens[0] == '(':
        # Find the matching closing parenthesis for this opening parenthesis
        counter = 1
        right_paren_index = 1
        while counter != 0:
            if tokens[right_paren_index] == '(':
                counter += 1
            elif tokens[right_paren_index] == ')':
                counter -= 1
            right_paren_index += 1

        # Recurse into the contents of the parenthesis
        inner_expression = construct_ast(tokens[1:right_paren_index - 1])

        # Process the rest after the parenthesis
        rest_expression = tokens[right_paren_index:]
        if rest_expression:
            return construct_ast([inner_expression] + rest_expression)
        else:
            return inner_expression

    # Process unary operators first
    if tokens[0] == '!':
        return NOT(construct_ast(tokens[1:]))

    # Process binary operators
    for op, cls in [('<=>', IFF), ('=>', IMPLIES), ('&', AND), ('|', OR)]:
        if op in tokens:
            i = tokens.index(op)
            left = construct_ast(tokens[:i])
            right = construct_ast(tokens[i + 1:])
            return cls(left, right)

    # Check if it's a binary operator class
    if isinstance(tokens[0], (NOT, AND, OR, IMPLIES, IFF)):
        return tokens[0]

    # If we reach here, then it's a variable (leaf node)
    return Variable(tokens[0])