import re

def parse_bool_expression(expression):
    """Parse a boolean expression and return a list of boolean values."""
    # Define standard delimiters
    standard_delimiters = ['!', '&', '|', '=>', '<=>', '(', ')', 'true', 'false']
        
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
    
    print(expression)
    
    # Create the regular expression pattern
    pattern_str = '({})'.format('|'.join(re.escape(d) for d in standard_delimiters))
    pattern = re.compile(pattern_str)
    
    # Split the expression based on the pattern and return the result
    return [item.strip() for item in re.split(pattern, expression) if item.strip()]


print(parse_bool_expression('T ^ F ∨ ¬ TRUE'))