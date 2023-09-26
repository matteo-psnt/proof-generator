import re

def parse_bool_expression(expression):
    '''Parse a boolean expression and return a list of boolean values.'''
    # Define standard delimiters
    standard_delimiters = ['!', '&', '|', '=>', '<=>', '(', ')', 'true', 'false', ',']
        
    # Define a mapping of various versions of delimiters to the standard version
    delimiter_mapping = {
        '∧': '&', 
        '∨': '|',
        '¬': '!',
        '→': '=>',
        '↔': '<=>',
        '^': '&',
        'v': '|',
        '&&': '&',
        '||': '|',
        'TRUE' : 'true',
        'FALSE' : 'false',
        'True' : 'true',
        'False' : 'false',
        'NOT' : '!',
        'AND' : '&',
        'OR' : '|',
        'IMP' : '=>',
        'IFF' : '<=>',
        'not' : '!',
        'and' : '&',
        'or' : '|',
        'imp' : '=>',
        'iff' : '<=>',
        'implies' : '=>',
        'equiv' : '<=>',
        '*': '&',
        '~': '!',
        '.': '&',
        '+': '|',
        '->': '=>',
        '<->': '<=>',
        ' T ' : ' true ',
        ' F ' : ' false ',
        ' t ' : ' true ',
        ' f ' : ' false ',
        ' 1 ' : ' true ',
        ' 0 ' : ' false ',
        '(T ' : '(true ',
        ' T)' : ' true)',
        '!T ' : '!true ',
        '(F ' : '(false ',
        ' F)' : ' false)',
        '!F ' : '!false ',
        '(t ' : '(true ',
        ' t)' : ' true)',
        '!t ' : '!true ',
        '(f ' : '(false ',
        ' f)' : ' false)',
        '!F ' : '!false ',
        '(1 ' : '(true ',
        ' 1)' : ' true)',
        '!1 ' : '!true ',
        '(0 ' : '(false ',
        ' 0)' : ' false)',
        '!0 ' : '!false '
    }
    
    expression = ' ' + expression + ' '
        
    # Apply the mapping to standardize delimiters in the expression
    for variant, standard in delimiter_mapping.items():
        expression = expression.replace(variant, standard)
    
    # Create the regular expression pattern
    pattern_str = '({})'.format('|'.join(re.escape(d) for d in standard_delimiters))
    pattern = re.compile(pattern_str)
    
    # Split the expression based on the pattern and return the result
    return [item.strip() for item in re.split(pattern, expression) if item.strip()]


def _add_opp_parentheses(tokens, op):
    indices = reversed([i for i in range(len(tokens)) if tokens[i] == op])
    for i in indices:
        if i + 1 >= len(tokens):
            raise ValueError(f"Missing right opperand for {op}")
        if i - 1 < 0:
            raise ValueError(f"Missing left opperand for {op}")
        
        if tokens[i + 1] == '(':
            counter = 1
            right_paren_index = i + 2
            while counter != 0:
                if right_paren_index >= len(tokens):
                    raise ValueError("Unbalanced parentheses")
                if tokens[right_paren_index] == '(':
                    counter += 1
                elif tokens[right_paren_index] == ')':
                    counter -= 1
                right_paren_index += 1
            
            tokens.insert(right_paren_index, ')')
        else:
            tokens.insert(i + 2, ')')
        if tokens[i - 1] == ')':
            counter = 1
            left_paren_index = i - 2
            while counter != 0:
                if left_paren_index < 0:
                    raise ValueError("Unbalanced parentheses")
                if tokens[left_paren_index] == ')':
                    counter += 1
                elif tokens[left_paren_index] == '(':
                    counter -= 1
                left_paren_index -= 1
            
            tokens.insert(left_paren_index + 1, '(')
        else:
            tokens.insert(i - 1, '(')
    return tokens

def add_parentheses(tokens):
    """Add parentheses to a list of tokens to ensure correct order."""
    if not tokens:
        raise ValueError("Expression cannot be empty")
    
    # create copy of tokens
    tokens = tokens[:]

    # check for unbalanced parentheses
    counter = 0
    for token in tokens:
        if token == '(':
            counter += 1
        elif token == ')':
            counter -= 1
        if counter < 0:
            raise ValueError("Unbalanced parentheses")
    if counter != 0:
        raise ValueError("Unbalanced parentheses")
    
    index = 0
    n = len(tokens)
    # Add parentheses around each negation
    while index < n:
        if tokens[index] == '!':
            if tokens[index + 1] == '(':
                counter = 1
                right_paren_index = index + 2
                while counter != 0:
                    if right_paren_index >= len(tokens):
                        raise ValueError("Unbalanced parentheses")
                    if tokens[right_paren_index] == '(':
                        counter += 1
                    elif tokens[right_paren_index] == ')':
                        counter -= 1
                    right_paren_index += 1
                
                tokens.insert(right_paren_index, ')')
                tokens.insert(index, '(')
            else:
                tokens.insert(index + 2, ')')
                tokens.insert(index, '(')
            index += 1
            n += 2
        
        index += 1
    
    for opperand in ['&', '|', '=>', '<=>']:
        tokens = _add_opp_parentheses(tokens, opperand)
    
    return tokens