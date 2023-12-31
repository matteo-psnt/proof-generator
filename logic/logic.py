class VAR:
    '''VAR(name) == name'''
    def __init__(self, name):
        self.name = name

    def __str__(self):
        return str(self.name)
    
    def __repr__(self):
        return "VAR({})".format(str(self.name))
    
    def comma_format(self):
        return str(self.name)
    
    def evaluate(self, assignment):
        return assignment[self.name]
    
    def __eq__(self, other):
        return isinstance(other, VAR) and self.name == other.name
    
    def __hash__(self):
        return hash(self.name)
    
    def __len__(self):
        return 1
    
class NOT:
    '''NOT(expression) == (!expression)'''
    def __init__(self, expression):
        self.expression = expression

    def __str__(self):
        if isinstance(self.expression, VAR) or isinstance(self.expression, NOT):
            return "!{}".format(str(self.expression))
        elif isinstance(self.expression, bool):
            return "!({})".format(str(self.expression))
        else:
            return "!({})".format(str(self.expression))
    
    def __repr__(self):
        return "NOT({})".format(repr(self.expression))
    
    def comma_format(self):
        return "(!{})".format(self.expression.comma_format())
    
    def evaluate(self, assignment):
        return not self.expression.evaluate(assignment)
    
    def __eq__(self, other):
        return isinstance(other, NOT) and self.expression == other.expression
    
    def __hash__(self):
        return hash(self.expression)
    
    def __len__(self):
        if isinstance(self.expression, bool):
            return 2
        else:
            return len(self.expression) + 1


class AND:
    '''AND(left, right) == (left & right)'''
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def __str__(self):
        if isinstance(self.left, VAR) or isinstance(self.left, bool) or isinstance(self.left, NOT) and isinstance(self.right, bool) or isinstance(self.right, VAR) or isinstance(self.right, NOT):
            return "{} & {}".format(str(self.left), str(self.right))
        elif isinstance(self.left, VAR) or isinstance(self.left, bool):
            return "{} & ({})".format(str(self.left), str(self.right))
        elif isinstance(self.right, VAR or isinstance(self.right, bool)):
            return "({}) & {}".format(str(self.left), str(self.right))
        else:
            return "({}) & ({})".format(str(self.left), str(self.right))
    
    def __repr__(self):
        return "AND({}, {})".format(repr(self.left), repr(self.right))
    
    def comma_format(self):
        return "({} & {})".format(self.left.comma_format(), self.right.comma_format())
    
    def evaluate(self, assignment):
        return self.left.evaluate(assignment) and self.right.evaluate(assignment)
    
    def __eq__(self, other):
        return isinstance(other, AND) and self.left == other.left and self.right == other.right
    
    def __hash__(self):
        return hash((self.left, self.right))
    
    def __len__(self):
        if isinstance(self.left, bool) and isinstance(self.right, bool):
            return 3
        elif isinstance(self.left, bool):
            return len(self.right) + 2
        elif isinstance(self.right, bool):
            return len(self.left) + 2
        else:
            return len(self.left) + len(self.right) + 1
        

class OR:
    '''OR(left, right) == (left | right)'''
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def __str__(self):
        if isinstance(self.left, VAR) or isinstance(self.left, bool) or isinstance(self.left, NOT) and isinstance(self.right, bool) or isinstance(self.right, VAR) or isinstance(self.right, NOT):
            return "{} | {}".format(str(self.left), str(self.right))
        elif isinstance(self.left, VAR) or isinstance(self.left, bool):
            return "{} | ({})".format(str(self.left), str(self.right))
        elif isinstance(self.right, VAR or isinstance(self.right, bool)):
            return "({}) | {}".format(str(self.left), str(self.right))
        else:
            return "({}) | ({})".format(str(self.left), str(self.right))
    
    def __repr__(self):
        return "OR({}, {})".format(repr(self.left), repr(self.right))
    
    def comma_format(self):
        return "({} | {})".format(self.left.comma_format(), self.right.comma_format())
    
    def evaluate(self, assignment):
        return self.left.evaluate(assignment) or self.right.evaluate(assignment)

    def __eq__(self, other):
        return isinstance(other, OR) and self.left == other.left and self.right == other.right
    
    def __hash__(self):
        return hash((self.left, self.right))
    
    def __len__(self):
        if isinstance(self.left, bool) and isinstance(self.right, bool):
            return 3
        elif isinstance(self.left, bool):
            return len(self.right) + 2
        elif isinstance(self.right, bool):
            return len(self.left) + 2
        else:
            return len(self.left) + len(self.right) + 1
    
class IMP:
    '''IMP(left, right) == (left => right)'''
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def __str__(self):
        if isinstance(self.left, VAR) or isinstance(self.left, bool) or isinstance(self.left, NOT) and isinstance(self.right, bool) or isinstance(self.right, VAR) or isinstance(self.right, NOT):
            return "{} => {}".format(str(self.left), str(self.right))
        elif isinstance(self.left, VAR) or isinstance(self.left, bool):
            return "{} => ({})".format(str(self.left), str(self.right))
        elif isinstance(self.right, VAR or isinstance(self.right, bool)):
            return "({}) => {}".format(str(self.left), str(self.right))
        else:
            return "({}) => ({})".format(str(self.left), str(self.right))
    
    def __repr__(self):
        return "IMP({}, {})".format(repr(self.left), repr(self.right))
    
    def comma_format(self):
        return "({} => {})".format(self.left.comma_format(), self.right.comma_format())
    
    def evaluate(self, assignment):
        return (not self.left.evaluate(assignment)) or self.right.evaluate(assignment)
    
    def __eq__(self, other):
        return isinstance(other, IMP) and self.left == other.left and self.right == other.right
    
    def __hash__(self):
        return hash((self.left, self.right))
    
    def __len__(self):
        if isinstance(self.left, bool) and isinstance(self.right, bool):
            return 3
        elif isinstance(self.left, bool):
            return len(self.right) + 2
        elif isinstance(self.right, bool):
            return len(self.left) + 2
        else:
            return len(self.left) + len(self.right) + 1

class IFF:
    '''IFF(left, right) == (left <=> right)'''
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def __str__(self):
        if isinstance(self.left, VAR) or isinstance(self.left, bool) or isinstance(self.left, NOT) and isinstance(self.right, bool) or isinstance(self.right, VAR) or isinstance(self.right, NOT):
            return "{} <=> {}".format(str(self.left), str(self.right))
        elif isinstance(self.left, VAR) or isinstance(self.left, bool):
            return "{} <=> ({})".format(str(self.left), str(self.right))
        elif isinstance(self.right, VAR or isinstance(self.right, bool)):
            return "({}) <=> {}".format(str(self.left), str(self.right))
        else:
            return "({}) <=> ({})".format(str(self.left), str(self.right))
    
    def __repr__(self):
        return "IFF({}, {})".format(repr(self.left), repr(self.right))
    
    def comma_format(self):
        return "({} <=> {})".format(self.left.comma_format(), self.right.comma_format())
    
    def evaluate(self, assignment):
        return (self.left.evaluate(assignment) and self.right.evaluate(assignment)) or (not self.left.evaluate(assignment) and not self.right.evaluate(assignment))
    
    def __eq__(self, other):
        return isinstance(other, IFF) and self.left == other.left and self.right == other.right
    
    def __hash__(self):
        return hash((self.left, self.right))
    
    def __len__(self):
        if isinstance(self.left, bool) and isinstance(self.right, bool):
            return 3
        elif isinstance(self.left, bool):
            return len(self.right) + 2
        elif isinstance(self.right, bool):
            return len(self.left) + 2
        else:
            return len(self.left) + len(self.right) + 1

