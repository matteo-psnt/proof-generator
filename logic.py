

class NOT:
    def __init__(self, expression):
        self.expression = expression

    def evaluate(self, assignment):
        return not self.expression.evaluate(assignment)

    def __str__(self):
        return "(!{})".format(str(self.expression))
    
    def __repr__(self):
        return "NOT({})".format(repr(self.expression))
    
    def __eq__(self, other):
        return isinstance(other, NOT) and self.expression == other.expression


class AND:
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def evaluate(self, assignment):
        return self.left.evaluate(assignment) and self.right.evaluate(assignment)

    def __str__(self):
        return "({} & {})".format(str(self.left), str(self.right))
    
    def __repr__(self):
        return "AND({}, {})".format(repr(self.left), repr(self.right))
    
    def __eq__(self, other):
        return isinstance(other, AND) and self.left == other.left and self.right == other.right
        

class OR:
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def evaluate(self, assignment):
        return self.left.evaluate(assignment) or self.right.evaluate(assignment)

    def __str__(self):
        return "({} | {})".format(str(self.left), str(self.right))
    
    def __repr__(self):
        return "OR({}, {})".format(repr(self.left), repr(self.right))

    def __eq__(self, other):
        return isinstance(other, OR) and self.left == other.left and self.right == other.right
    
class IMPLIES:
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def evaluate(self, assignment):
        return not self.left.evaluate(assignment) or self.right.evaluate(assignment)

    def __str__(self):
        return "({} => {})".format(str(self.left), str(self.right))
    
    def __repr__(self):
        return "IMPLIES({}, {})".format(repr(self.left), repr(self.right))
    
    def __eq__(self, other):
        return isinstance(other, IMPLIES) and self.left == other.left and self.right == other.right

class IFF:
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def evaluate(self, assignment):
        return self.left.evaluate(assignment) == self.right.evaluate(assignment)

    def __str__(self):
        return "({} <=> {})".format(str(self.left), str(self.right))
    
    def __repr__(self):
        return "IFF({}, {})".format(repr(self.left), repr(self.right))
    
    def __eq__(self, other):
        return isinstance(other, IFF) and self.left == other.left and self.right == other.right

class Variable:
    def __init__(self, name):
        self.name = name

    def evaluate(self, assignment):
        return assignment[self.name]

    def __str__(self):
        return str(self.name)
    
    def __repr__(self):
        return str(self.name)
    
    def __eq__(self, other):
        return isinstance(other, Variable) and self.name == other.name
