(function () {
  "use strict";

  const t = (name, note, label, code, examples) => ({ name, note, label, code, examples });
  const m = (id, title, stage, description, officialUrl, challenge, topics, shortTitle) => ({
    id, title, stage, description, officialUrl, officialLabel: "Official Python documentation", challenge, topics, shortTitle
  });

  function pythonExampleComment(item, label, code) {
    const snippet = code.trim();
    const concept = item.name.toLowerCase();

    if (/^(?:from\s+\S+\s+)?import\s+/m.test(snippet)) {
      return `The import makes the required module or name available; the following lines then use it to demonstrate ${concept}.`;
    }
    if (/^(?:async\s+)?def\s+/m.test(snippet)) {
      return `This defines a function for ${concept}; its indented body is the work that runs each time the function is called.`;
    }
    if (/^class\s+/m.test(snippet)) {
      return `This creates a class for ${concept}; the indented attributes and methods describe the behavior of its instances.`;
    }
    if (/\bawait\s+/.test(snippet)) {
      return `await pauses this coroutine without blocking the event loop until the shown asynchronous operation completes.`;
    }
    if (/^[A-Za-z_]\w*\s*=/.test(snippet)) {
      return `The assignment stores a concrete value or result under a name so the ${concept} behavior can be used on the next line.`;
    }
    if (/[A-Za-z_]\w*\.[A-Za-z_]\w*\([^\n]*\)/.test(snippet)) {
      return `This calls the shown method on a specific object, which is the concrete operation being demonstrated for ${concept}.`;
    }
    if (/[A-Za-z_]\w*\([^\n]*\)/.test(snippet)) {
      return `This calls the shown function with example inputs so you can see ${concept} in executable Python syntax.`;
    }
    return `This ${label.toLowerCase()} snippet turns ${concept} into a small piece of Python you can run and inspect.`;
  }

  const source = [
    m(1, "Python Foundations", "foundation",
      "Understand how Python runs code and learn the small syntax rules used everywhere.",
      "https://docs.python.org/3/tutorial/interpreter.html",
      "Create a small command-line script that asks for a name and prints a formatted greeting.",
      [
        t("Interpreter & REPL", "The interpreter executes Python; the REPL lets you enter one expression or statement at a time.", "REPL", "python\n>>> 2 + 3\n5"),
        t("Scripts & command line", "A .py file stores reusable code that the interpreter can execute as a program.", "SCRIPT", "python app.py"),
        t("Indentation & code blocks", "Indentation is syntax in Python and groups statements under constructs such as if, for, and def.", "INDENTATION", "ready = True\nif ready:\n    print(\"Start\")"),
        t("Names & assignment", "Assignment binds a name to an object; it does not declare a fixed storage type.", "ASSIGNMENT", "score = 90\ncourse = \"Python\""),
        t("Comments & docstrings", "A # comment explains code to people; a docstring documents a module, class, or function.", "DOCUMENTATION", "# Explain why this value matters\ndef greet():\n    \"\"\"Return a friendly greeting.\"\"\"\n    return \"Hello\""),
        t("print() & input()", "print writes text to standard output, while input reads one line from standard input as a string.", "CONSOLE I/O", "name = input(\"Name: \")\nprint(\"Hello\", name)"),
        t("Dynamic typing & identity", "A name can be rebound to different object types; id and is concern object identity, not value equality.", "IDENTITY", "value = 42\nvalue = \"forty-two\"\nmissing = None\nprint(missing is None)")
      ]),
    m(2, "Values, Types & Expressions", "foundation",
      "Work confidently with Python's core scalar values and expression rules.",
      "https://docs.python.org/3/library/stdtypes.html",
      "Parse two user-entered numbers, calculate a percentage, and format the result clearly.",
      [
        t("Integers, floats & complex numbers", "int stores whole numbers, float stores binary floating-point values, and complex stores real and imaginary parts.", "NUMBERS", "count = 12\nprice = 19.95\nsignal = 2 + 3j"),
        t("Booleans & comparisons", "Comparisons produce True or False and can be chained into one readable condition.", "BOOLEAN", "age = 24\neligible = 18 <= age < 65"),
        t("None as a sentinel", "None represents the absence of a value and should normally be checked with is or is not.", "NONE", "result = None\nif result is None:\n    print(\"Not loaded\")"),
        t("Strings & immutability", "A string is an immutable Unicode sequence; string methods return new values instead of changing the original.", "STRING", "name = \"  Ada  \"\nclean = name.strip().upper()"),
        t("Formatted string literals", "An f-string evaluates expressions inside braces and formats them directly into text.", "F-STRING", "name = \"Ada\"\nscore = 92.5\nmessage = f\"{name}: {score:.1f}%\""),
        t("Bytes & bytearray", "bytes is an immutable byte sequence; bytearray is mutable and both are distinct from Unicode text.", "BYTES", "payload = \"hello\".encode(\"utf-8\")\ntext = payload.decode(\"utf-8\")"),
        t("Operators & precedence", "Arithmetic, comparison, Boolean, membership, and identity operators follow defined precedence; parentheses make intent explicit.", "OPERATORS", "total = price * count\nvalid = total > 0 and count in range(1, 100)")
      ]),
    m(3, "Collections & Comprehensions", "foundation",
      "Choose the right built-in collection and transform data with compact, readable expressions.",
      "https://docs.python.org/3/tutorial/datastructures.html",
      "Turn a list of order records into a customer-to-total dictionary while removing duplicate tags.",
      [
        t("Lists", "A list is an ordered, mutable sequence that supports indexed access and in-place updates.", "LIST", "names = [\"Ada\", \"Linus\"]\nnames.append(\"Grace\")"),
        t("Tuples", "A tuple is an ordered, immutable sequence commonly used for fixed records and multiple return values.", "TUPLE", "point = (12, 8)\nx, y = point"),
        t("Dictionaries", "A dictionary maps unique hashable keys to values and preserves insertion order.", "DICT", "user = {\"id\": 7, \"name\": \"Ada\"}\nemail = user.get(\"email\", \"missing\")"),
        t("Sets & frozensets", "A set stores unique hashable values; frozenset is the immutable version and can itself be a dictionary key.", "SET", "skills = {\"python\", \"sql\", \"python\"}\nshared = skills & {\"sql\", \"docker\"}"),
        t("Ranges", "range represents an arithmetic sequence lazily, so it does not build a list of every number.", "RANGE", "for number in range(1, 6):\n    print(number)"),
        t("Slicing & unpacking", "Slicing selects part of a sequence, while unpacking assigns its elements to several names.", "SLICE", "items = [10, 20, 30, 40]\nfirst, *middle, last = items\nsubset = items[1:3]"),
        t("Comprehensions", "A comprehension builds a collection from an iterable with an optional transformation and filter.", "COMPREHENSION", "squares = [n * n for n in range(10) if n % 2 == 0]\nby_id = {user[\"id\"]: user for user in users}")
      ]),
    m(4, "Control Flow", "foundation",
      "Direct program execution with decisions, loops, pattern matching, and useful loop helpers.",
      "https://docs.python.org/3/tutorial/controlflow.html",
      "Validate a command, process matching records, and report when no record was found.",
      [
        t("if, elif & else", "An if chain executes the first branch whose condition is truthy and otherwise uses else.", "CONDITION", "if score >= 90:\n    grade = \"A\"\nelif score >= 75:\n    grade = \"B\"\nelse:\n    grade = \"C\""),
        t("match & case", "Structural pattern matching compares the shape and values of data and can bind matching parts to names.", "MATCH", "match command.split():\n    case [\"open\", filename]:\n        print(filename)\n    case _:\n        print(\"Unknown\")"),
        t("for loops", "A for loop asks an iterable for values one at a time instead of managing an index manually.", "FOR", "for name in names:\n    print(name)"),
        t("while loops", "A while loop repeats as long as its condition remains truthy.", "WHILE", "attempts = 3\nwhile attempts > 0:\n    attempts -= 1"),
        t("break & continue", "break exits the nearest loop; continue skips directly to its next iteration.", "LOOP CONTROL", "for value in values:\n    if value is None:\n        continue\n    if value < 0:\n        break"),
        t("Loop else", "A loop's else block runs only when the loop finishes normally without break.", "LOOP ELSE", "for user in users:\n    if user.id == wanted_id:\n        print(user)\n        break\nelse:\n    print(\"Not found\")"),
        t("enumerate() & zip()", "enumerate pairs items with indexes; zip walks multiple iterables together until the shortest ends.", "LOOP HELPERS", "for index, (name, score) in enumerate(zip(names, scores), start=1):\n    print(index, name, score)")
      ]),
    m(5, "Functions & Scope", "core",
      "Package behavior into clear functions and understand how Python binds arguments and names.",
      "https://docs.python.org/3/tutorial/controlflow.html#defining-functions",
      "Design a pricing function with safe defaults, keyword-only options, documentation, and a useful return value.",
      [
        t("def & return", "def creates a function object; return stops that call and sends a value back to its caller.", "FUNCTION", "def total(price, quantity):\n    return price * quantity"),
        t("Positional & keyword arguments", "Arguments may bind by position or by parameter name, making calls either compact or explicit.", "ARGUMENTS", "def connect(host, port):\n    return f\"{host}:{port}\"\n\nconnect(\"localhost\", port=5432)"),
        t("Default parameter values", "A default is evaluated once when def runs, so mutable defaults should usually be replaced with None.", "SAFE DEFAULT", "def add_tag(tag, tags=None):\n    tags = [] if tags is None else tags\n    tags.append(tag)\n    return tags"),
        t("Positional-only & keyword-only", "The / and * markers let an API require selected parameters to be passed by position or keyword.", "PARAMETER RULES", "def resize(width, height, /, *, quality=85):\n    return width, height, quality"),
        t("*args & **kwargs", "*args collects extra positional arguments into a tuple; **kwargs collects extra keyword arguments into a dictionary.", "VARIADIC", "def report(title, *values, **options):\n    print(title, values, options)"),
        t("LEGB scope, global & nonlocal", "Python resolves names through local, enclosing, global, and built-in scopes; nonlocal targets an enclosing function binding.", "SCOPE", "def counter():\n    count = 0\n    def increment():\n        nonlocal count\n        count += 1\n        return count\n    return increment"),
        t("Lambdas, docstrings & annotations", "A lambda is a small expression function; docstrings explain behavior and annotations describe intended types without enforcing them.", "FUNCTION METADATA", "def greet(name: str) -> str:\n    \"\"\"Return a greeting for name.\"\"\"\n    formatter = lambda value: value.strip().title()\n    return f\"Hello {formatter(name)}\"")
      ]),
    m(6, "Modules & Packages", "core",
      "Split programs into importable files and packages with predictable namespaces.",
      "https://docs.python.org/3/tutorial/modules.html",
      "Create a package with two modules, expose one public function, and run its CLI entry module safely.",
      [
        t("import statements", "import loads a module once per interpreter session and binds its module object to a name.", "IMPORT", "import math\nradius = 3\narea = math.pi * radius ** 2"),
        t("from, import & as", "from imports selected names into the current namespace; as gives an imported object a local alias.", "IMPORT NAMES", "from pathlib import Path as FilePath\nroot = FilePath.cwd()"),
        t("The __main__ guard", "The guard runs code only when the file is executed directly, not when another module imports it.", "MAIN GUARD", "def main():\n    print(\"Running\")\n\nif __name__ == \"__main__\":\n    main()"),
        t("Module search path", "Python searches built-ins and the directories in sys.path; local filenames can accidentally shadow standard modules.", "SEARCH PATH", "import sys\nfor location in sys.path:\n    print(location)"),
        t("Packages & __init__.py", "A package groups modules under a dotted namespace; __init__.py can initialize or define the package's public surface.", "PACKAGE", "shop/\n  __init__.py\n  pricing.py\n\nfrom shop.pricing import total"),
        t("Relative imports", "A leading dot imports from the current package hierarchy and should be used only inside a package.", "RELATIVE IMPORT", "# inside shop/api.py\nfrom .pricing import total\nfrom .models.order import Order"),
        t("dir(), help() & importlib", "dir reveals available names, help displays documentation, and importlib provides programmatic import utilities.", "INTROSPECTION", "import importlib\nmodule = importlib.import_module(\"json\")\nprint(dir(module))")
      ]),
    m(7, "Object-Oriented Python", "core",
      "Model state and behavior with classes while keeping Python's dynamic object model clear.",
      "https://docs.python.org/3/tutorial/classes.html",
      "Model an order hierarchy with validated properties, inherited behavior, and a dataclass value object.",
      [
        t("Classes & instances", "A class defines shared behavior; calling it creates a distinct instance with its own state.", "CLASS", "class User:\n    pass\n\nuser = User()\nuser.name = \"Ada\""),
        t("__init__ & attributes", "__init__ initializes an already-created instance and normally stores constructor values on self.", "INITIALIZER", "class User:\n    def __init__(self, name):\n        self.name = name"),
        t("Methods & self", "An instance method receives the instance as self, letting it read and update that object's attributes.", "METHOD", "class Account:\n    def deposit(self, amount):\n        self.balance += amount"),
        t("Class methods & static methods", "A class method receives cls and can build alternate constructors; a static method is a namespaced function with no automatic instance.", "METHOD TYPES", "class Temperature:\n    @classmethod\n    def from_fahrenheit(cls, value):\n        return cls((value - 32) * 5 / 9)\n\n    @staticmethod\n    def is_freezing(value):\n        return value <= 0"),
        t("Inheritance & super()", "Inheritance reuses and specializes parent behavior; super delegates to the next implementation in the method resolution order.", "INHERITANCE", "class Admin(User):\n    def __init__(self, name, permissions):\n        super().__init__(name)\n        self.permissions = permissions"),
        t("Properties", "A property exposes method-backed validation or computation through normal attribute syntax.", "PROPERTY", "class Product:\n    @property\n    def price(self):\n        return self._price\n\n    @price.setter\n    def price(self, value):\n        if value < 0:\n            raise ValueError(\"price must be positive\")\n        self._price = value"),
        t("Dataclasses", "@dataclass generates common methods for data-focused classes from annotated fields.", "DATACLASS", "from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Point:\n    x: int\n    y: int")
      ]),
    m(8, "Python's Object Protocols", "core",
      "Make custom objects behave naturally with Python syntax by implementing focused data-model protocols.",
      "https://docs.python.org/3/reference/datamodel.html",
      "Build a small collection type with useful display, length, iteration, membership, and equality behavior.",
      [
        t("Special methods", "Double-underscore methods connect objects to language operations such as addition, indexing, iteration, and context management.", "DUNDER", "class Basket:\n    def __len__(self):\n        return len(self.items)"),
        t("__repr__ & __str__", "__repr__ aims for an unambiguous developer view; __str__ supplies readable user-facing text.", "REPRESENTATION", "class User:\n    def __repr__(self):\n        return f\"User(name={self.name!r})\"\n\n    def __str__(self):\n        return self.name"),
        t("Equality, ordering & hashing", "__eq__ defines value equality; stable immutable values can implement __hash__ for set and dictionary use.", "EQUALITY", "from dataclasses import dataclass\n\n@dataclass(frozen=True, order=True)\nclass Version:\n    major: int\n    minor: int"),
        t("Container protocols", "Methods such as __len__, __iter__, __contains__, and __getitem__ let an object participate in built-in container operations.", "CONTAINER", "class Team:\n    def __iter__(self):\n        return iter(self.members)\n\n    def __contains__(self, member):\n        return member in self.members"),
        t("Context manager protocol", "__enter__ supplies a managed resource and __exit__ performs cleanup when a with block ends.", "CONTEXT PROTOCOL", "class Timer:\n    def __enter__(self):\n        self.started = time.perf_counter()\n        return self\n\n    def __exit__(self, *error):\n        self.elapsed = time.perf_counter() - self.started"),
        t("Callable objects", "Implementing __call__ lets an instance be invoked like a function while retaining configuration or state.", "CALLABLE", "class Multiplier:\n    def __init__(self, factor):\n        self.factor = factor\n\n    def __call__(self, value):\n        return value * self.factor"),
        t("Descriptors", "A descriptor controls attribute access through __get__, __set__, or __delete__ and powers features such as properties and methods.", "DESCRIPTOR", "class Positive:\n    def __set_name__(self, owner, name):\n        self.name = \"_\" + name\n\n    def __set__(self, instance, value):\n        if value <= 0:\n            raise ValueError(\"must be positive\")\n        setattr(instance, self.name, value)")
      ]),
    m(9, "Errors & Resource Management", "core",
      "Handle failures deliberately and guarantee cleanup around files, locks, and other resources.",
      "https://docs.python.org/3/tutorial/errors.html",
      "Create a parser that reports useful domain errors, preserves the original cause, and always closes its resource.",
      [
        t("Syntax errors vs exceptions", "A syntax error prevents parsing; an exception is an object raised while otherwise valid code executes.", "ERROR TYPES", "# SyntaxError: invalid grammar\n# ValueError: valid code received an unsuitable value\nnumber = int(\"not-a-number\")"),
        t("try & except", "A try block protects operations that may fail; matching except clauses handle only the failures they understand.", "HANDLE", "try:\n    value = int(raw)\nexcept ValueError:\n    value = 0"),
        t("else & finally", "else runs after a successful try; finally runs whether the operation succeeds, fails, or returns.", "CLEANUP", "try:\n    result = load()\nexcept OSError as error:\n    log(error)\nelse:\n    use(result)\nfinally:\n    release()"),
        t("raise", "raise creates or re-raises an exception when the current operation cannot satisfy its contract.", "RAISE", "def withdraw(amount):\n    if amount <= 0:\n        raise ValueError(\"amount must be positive\")"),
        t("Custom exceptions", "A domain-specific exception communicates a meaningful failure while remaining compatible with Python's exception hierarchy.", "CUSTOM ERROR", "class InsufficientFundsError(Exception):\n    \"\"\"Raised when an account cannot cover a withdrawal.\"\"\""),
        t("Exception chaining & groups", "raise ... from ... preserves a cause; ExceptionGroup carries several unrelated failures that except* can handle selectively.", "CHAIN", "try:\n    config = json.loads(raw)\nexcept json.JSONDecodeError as error:\n    raise ConfigError(\"Invalid configuration\") from error"),
        t("with & contextlib", "with guarantees a context manager's exit logic; contextlib helps create managers without a full class.", "CONTEXT MANAGER", "from contextlib import contextmanager\n\n@contextmanager\ndef opened(path):\n    file = open(path, encoding=\"utf-8\")\n    try:\n        yield file\n    finally:\n        file.close()")
      ]),
    m(10, "Iterators & Generators", "core",
      "Process streams lazily and compose memory-efficient data pipelines.",
      "https://docs.python.org/3/howto/functional.html",
      "Stream a large log file, filter matching records, and aggregate them without loading the whole file.",
      [
        t("Iterables vs iterators", "An iterable can create an iterator; an iterator remembers traversal state and produces one value at a time.", "ITERABLE", "numbers = [1, 2, 3]\niterator = iter(numbers)\nprint(next(iterator))"),
        t("iter() & next()", "iter obtains an iterator and next requests its next item, raising StopIteration when exhausted.", "ITERATION", "iterator = iter([\"a\", \"b\"])\nfirst = next(iterator, None)\nsecond = next(iterator, None)"),
        t("Generator functions & yield", "A function containing yield returns a generator that pauses after each produced value and resumes later.", "GENERATOR", "def countdown(start):\n    while start:\n        yield start\n        start -= 1"),
        t("Generator expressions", "A generator expression uses comprehension syntax but calculates each item only when requested.", "GENERATOR EXPRESSION", "total = sum(n * n for n in range(1_000_000))"),
        t("yield from", "yield from delegates iteration and value exchange to another iterable or generator.", "DELEGATION", "def flatten(groups):\n    for group in groups:\n        yield from group"),
        t("itertools", "itertools provides fast building blocks for chaining, grouping, slicing, combining, and repeating iterables.", "ITERTOOLS", "from itertools import chain, islice\nfirst_ten = list(islice(chain(source_a, source_b), 10))"),
        t("Lazy pipelines", "A lazy pipeline composes generators so only the current values occupy memory.", "PIPELINE", "lines = (line.strip() for line in file)\nerrors = (line for line in lines if \"ERROR\" in line)\nfor error in errors:\n    print(error)")
      ]),
    m(11, "Files, Paths & Serialization", "backend",
      "Read and write local data safely with explicit paths, encodings, formats, and cleanup.",
      "https://docs.python.org/3/tutorial/inputoutput.html",
      "Load a UTF-8 CSV file, convert its rows to JSON, and write the output beside the source path.",
      [
        t("open modes & encodings", "open selects text or binary mode; text files should specify the intended encoding explicitly.", "OPEN", "with open(\"notes.txt\", mode=\"r\", encoding=\"utf-8\") as file:\n    text = file.read()"),
        t("Reading & writing with with", "The file context manager closes the handle even if reading or writing raises an exception.", "FILE CONTEXT", "with open(\"output.txt\", \"w\", encoding=\"utf-8\") as file:\n    file.write(\"Ready\\n\")"),
        t("pathlib", "Path represents filesystem paths as objects and provides readable operations for joining, inspecting, reading, and writing.", "PATH", "from pathlib import Path\nreport = Path(\"reports\") / \"daily.txt\"\nreport.parent.mkdir(parents=True, exist_ok=True)\nreport.write_text(\"Ready\", encoding=\"utf-8\")"),
        t("CSV", "The csv module handles quoting and delimiters so rows are not split incorrectly by hand.", "CSV", "import csv\nwith open(\"users.csv\", newline=\"\", encoding=\"utf-8\") as file:\n    rows = list(csv.DictReader(file))"),
        t("JSON", "json converts supported Python values to interoperable text and parses JSON text back into Python values.", "JSON", "import json\npayload = {\"name\": \"Ada\", \"active\": True}\ntext = json.dumps(payload, indent=2)\nrestored = json.loads(text)"),
        t("Pickle safety", "pickle can preserve Python-specific object graphs but loading untrusted pickle data can execute arbitrary code.", "PICKLE", "import pickle\n# Only load bytes produced by a trusted source.\nwith open(\"cache.pkl\", \"rb\") as file:\n    cached = pickle.load(file)"),
        t("Temporary & compressed files", "tempfile creates race-safe temporary resources; zipfile reads and writes ZIP archives while requiring size and path validation for untrusted input.", "TEMP & ZIP", "from tempfile import TemporaryDirectory\nfrom zipfile import ZipFile\n\nwith TemporaryDirectory() as folder:\n    with ZipFile(\"bundle.zip\", \"w\") as archive:\n        archive.write(\"report.txt\")")
      ]),
    m(12, "Standard Library Essentials", "backend",
      "Recognize the batteries already included for common data, date, text, system, and CLI work.",
      "https://docs.python.org/3/library/index.html",
      "Build a small command-line report using parsed arguments, grouped records, dates, and regular expressions.",
      [
        t("collections", "collections adds specialized containers such as Counter, defaultdict, deque, and namedtuple.", "COLLECTIONS", "from collections import Counter, deque\ncounts = Counter(\"mississippi\")\nqueue = deque([\"first\", \"second\"])\nnext_item = queue.popleft()"),
        t("functools", "functools provides higher-order utilities such as caching, partial application, reduction, and singledispatch.", "FUNCTOOLS", "from functools import lru_cache\n\n@lru_cache(maxsize=256)\ndef fibonacci(n):\n    return n if n < 2 else fibonacci(n - 1) + fibonacci(n - 2)"),
        t("datetime & zoneinfo", "datetime models dates and times; zoneinfo supplies IANA time-zone rules for aware datetimes.", "DATE & TIME", "from datetime import datetime\nfrom zoneinfo import ZoneInfo\nnow = datetime.now(ZoneInfo(\"Asia/Kolkata\"))"),
        t("Regular expressions", "re searches and transforms text using patterns; plain string methods are clearer for simple operations.", "REGEX", "import re\nemails = re.findall(r\"[\\w.+-]+@[\\w.-]+\", text)"),
        t("math, statistics & decimal", "math offers numerical functions, statistics summarizes numeric data, and Decimal supports explicit base-10 arithmetic rules.", "NUMERIC TOOLS", "from decimal import Decimal\nfrom statistics import mean\nprices = [Decimal(\"10.20\"), Decimal(\"11.40\")]\naverage = mean(prices)"),
        t("os, sys & shutil", "os and sys expose process and platform facilities; shutil provides higher-level file copying, moving, and archive operations.", "SYSTEM", "import os, shutil, sys\nprint(os.environ.get(\"APP_ENV\", \"dev\"))\nshutil.copy2(\"source.txt\", \"backup.txt\")\nprint(sys.version)"),
        t("argparse", "argparse converts command-line strings into validated named values and generates help output.", "CLI", "import argparse\nparser = argparse.ArgumentParser()\nparser.add_argument(\"--port\", type=int, default=8000)\nargs = parser.parse_args()")
      ]),
    m(13, "Type Hints", "backend",
      "Describe interfaces for editors and static checkers without changing Python's runtime flexibility.",
      "https://docs.python.org/3/library/typing.html",
      "Annotate a repository interface and a reusable function while keeping optional and structured data explicit.",
      [
        t("Function annotations", "Parameter and return annotations document intended types and are stored as metadata rather than automatically enforced.", "ANNOTATIONS", "def total(values: list[float]) -> float:\n    return sum(values)"),
        t("Built-in generics", "Built-in collections accept type arguments that describe the element, key, and value types expected by static tools.", "GENERICS", "names: list[str] = []\nusers_by_id: dict[int, str] = {}\ncoordinates: tuple[float, float] = (1.5, 2.5)"),
        t("Unions & optional values", "The | operator describes alternatives; T | None means the value may be absent.", "UNION", "def find_user(user_id: int) -> User | None:\n    return users.get(user_id)"),
        t("Type aliases", "A type alias gives a meaningful reusable name to a larger type expression.", "TYPE ALIAS", "type UserId = int\ntype Headers = dict[str, str]\n\ndef load(user_id: UserId) -> Headers:\n    ..."),
        t("TypedDict", "TypedDict describes dictionaries with known string keys while values remain ordinary dictionaries at runtime.", "TYPEDDICT", "from typing import TypedDict\n\nclass UserPayload(TypedDict):\n    id: int\n    name: str"),
        t("Protocols", "A Protocol expresses structural typing: any object with the required members satisfies the interface to a checker.", "PROTOCOL", "from typing import Protocol\n\nclass Closable(Protocol):\n    def close(self) -> None: ..."),
        t("TypeVar & Generic", "A type variable preserves relationships between input and output types in reusable functions and classes.", "TYPE VARIABLE", "from typing import TypeVar\n\nT = TypeVar(\"T\")\n\ndef first(items: list[T]) -> T:\n    return items[0]")
      ]),
    m(14, "Testing, Debugging & Logging", "backend",
      "Build feedback loops that reveal regressions, inspect failures, and explain runtime behavior.",
      "https://docs.python.org/3/library/unittest.html",
      "Test a service with setup, assertions, and a mocked dependency, then investigate one failure with the debugger.",
      [
        t("unittest test cases", "A TestCase groups isolated test methods and integrates with Python's standard test runner.", "TEST CASE", "import unittest\n\nclass PriceTests(unittest.TestCase):\n    def test_total(self):\n        self.assertEqual(total(10, 3), 30)"),
        t("Assertions", "Specific assertions compare actual and expected behavior and produce useful failure messages.", "TEST ASSERTIONS", "self.assertEqual(user.name, \"Ada\")\nself.assertTrue(user.active)\nwith self.assertRaises(ValueError):\n    parse(\"bad\")"),
        t("setUp & tearDown", "setUp prepares fresh state before each test and tearDown releases resources afterward.", "FIXTURE", "def setUp(self):\n    self.database = create_test_database()\n\ndef tearDown(self):\n    self.database.close()"),
        t("unittest.mock", "A mock replaces a collaborator so a test can control its result and verify how it was called.", "MOCK", "from unittest.mock import Mock\nmailer = Mock()\nservice = SignupService(mailer)\nservice.signup(\"ada@example.com\")\nmailer.send.assert_called_once()"),
        t("doctest", "doctest executes interactive-looking examples in docstrings and checks their displayed output.", "DOCTEST", "def add(a, b):\n    \"\"\"\n    >>> add(2, 3)\n    5\n    \"\"\"\n    return a + b"),
        t("pdb & breakpoint()", "breakpoint pauses execution in the debugger so you can inspect state and step through code.", "DEBUGGER", "def calculate(order):\n    breakpoint()\n    return order.subtotal - order.discount"),
        t("logging & warnings", "logging records structured runtime events by severity; warnings report conditions users should address without immediately failing.", "OBSERVABILITY", "import logging, warnings\nlogger = logging.getLogger(__name__)\nlogger.info(\"order processed\", extra={\"order_id\": 42})\nwarnings.warn(\"old_api is deprecated\", DeprecationWarning)")
      ]),
    m(15, "Concurrency & Asyncio", "advanced",
      "Choose between threads, processes, futures, and async tasks based on where work waits or computes.",
      "https://docs.python.org/3/library/concurrency.html",
      "Fetch several independent resources concurrently with bounded timeouts and graceful cancellation.",
      [
        t("Threads & the GIL", "Threads share memory and suit many I/O-bound tasks; in standard CPython builds the GIL limits simultaneous Python bytecode execution.", "THREAD", "from threading import Thread\nworker = Thread(target=download, args=(url,))\nworker.start()\nworker.join()"),
        t("Locks & thread-safe queues", "A lock protects shared critical sections; Queue coordinates producers and consumers safely between threads.", "SYNCHRONIZATION", "from queue import Queue\nfrom threading import Lock\nwork = Queue()\nlock = Lock()\nwith lock:\n    shared_count += 1"),
        t("Multiprocessing", "Separate processes have independent memory and can use multiple CPU cores for suitable CPU-bound work.", "PROCESS", "from multiprocessing import Pool\nwith Pool() as pool:\n    results = pool.map(calculate, inputs)"),
        t("concurrent.futures", "Executors provide one Future-based API for thread or process pools and collect results as work completes.", "FUTURES", "from concurrent.futures import ThreadPoolExecutor\nwith ThreadPoolExecutor(max_workers=8) as executor:\n    results = list(executor.map(download, urls))"),
        t("async & await", "An async function returns a coroutine; await pauses it cooperatively while another task can run.", "COROUTINE", "import asyncio\n\nasync def main():\n    await asyncio.sleep(1)\n    print(\"Ready\")\n\nasyncio.run(main())"),
        t("Tasks, gather & TaskGroup", "Tasks schedule coroutines concurrently; TaskGroup provides structured lifetime and failure handling for related tasks.", "TASK GROUP", "async with asyncio.TaskGroup() as group:\n    tasks = [group.create_task(fetch(url)) for url in urls]\nresults = [task.result() for task in tasks]"),
        t("Cancellation & timeouts", "Cancellation asks cooperative tasks to stop; timeout bounds how long an awaited operation may take.", "TIMEOUT", "try:\n    async with asyncio.timeout(5):\n        result = await fetch(url)\nexcept TimeoutError:\n    result = None")
      ]),
    m(16, "SQLite & Database Access", "advanced",
      "Persist relational data locally with transactions and parameterized SQL through the standard sqlite3 module.",
      "https://docs.python.org/3/library/sqlite3.html",
      "Create a users table, insert safely, commit a transaction, and query rows by name.",
      [
        t("Connections & cursors", "A connection owns the database session; execute or a cursor sends SQL and reads result rows.", "CONNECT", "import sqlite3\nconnection = sqlite3.connect(\"app.db\")\ncursor = connection.cursor()"),
        t("Schema & execute()", "SQL data-definition statements create tables and indexes just as they do in other relational databases.", "SCHEMA", "connection.execute(\"\"\"\n    CREATE TABLE IF NOT EXISTS users (\n        id INTEGER PRIMARY KEY,\n        name TEXT NOT NULL\n    )\n\"\"\")"),
        t("Parameterized queries", "Placeholders keep values separate from SQL syntax and prevent injection caused by string concatenation.", "PARAMETERS", "connection.execute(\n    \"INSERT INTO users(name) VALUES (?)\",\n    (name,),\n)"),
        t("Transactions", "A transaction groups writes so they either commit together or roll back together after failure.", "TRANSACTION", "try:\n    connection.execute(\"UPDATE accounts SET balance = balance - ? WHERE id = ?\", (amount, source))\n    connection.execute(\"UPDATE accounts SET balance = balance + ? WHERE id = ?\", (amount, target))\n    connection.commit()\nexcept sqlite3.Error:\n    connection.rollback()\n    raise"),
        t("Connection context manager", "Using a connection with with commits on normal exit and rolls back when the block raises; close it separately afterward.", "DB CONTEXT", "with sqlite3.connect(\"app.db\") as connection:\n    connection.execute(\"DELETE FROM sessions WHERE expired = 1\")"),
        t("Row factories", "A row factory changes query rows from plain tuples into objects that can support named column access.", "ROWS", "connection.row_factory = sqlite3.Row\nrow = connection.execute(\"SELECT id, name FROM users LIMIT 1\").fetchone()\nprint(row[\"name\"])"),
        t("Backup & cleanup", "The backup API copies a live database consistently; closing connections releases file handles and locks.", "DB BACKUP", "source = sqlite3.connect(\"app.db\")\ntarget = sqlite3.connect(\"backup.db\")\nwith target:\n    source.backup(target)\nsource.close()\ntarget.close()")
      ]),
    m(17, "HTTP, APIs & Networking", "advanced",
      "Understand URLs, HTTP requests, JSON APIs, sockets, timeouts, and TLS using the standard library.",
      "https://docs.python.org/3/library/internet.html",
      "Call a JSON API with each CRUD method, handle HTTP failures, and enforce a timeout.",
      [
        t("URL parsing", "urllib.parse separates and combines URL components without fragile manual string splitting.", "URL", "from urllib.parse import urlencode, urlparse\nquery = urlencode({\"page\": 2, \"q\": \"python\"})\nparsed = urlparse(f\"https://example.com/search?{query}\")"),
        t("HTTP GET", "urlopen sends a request and returns a response context whose bytes should be decoded according to the expected format.", "GET REQUEST", "from urllib.request import urlopen\nwith urlopen(\"https://api.example.com/users\", timeout=5) as response:\n    body = response.read().decode(\"utf-8\")"),
        t("REST methods: GET, POST, PUT, PATCH & DELETE", "Request accepts an explicit HTTP method; each verb communicates a different retrieval or state-change intent.", "REST METHODS", "# See one tiny request for each HTTP method below.", [
          ["GET", "request = Request(\"https://api.example.com/users/7\", method=\"GET\")\nwith urlopen(request, timeout=5) as response:\n    user = json.load(response)", "GET asks the API to return a resource without intending to change server state."],
          ["POST", "body = json.dumps({\"name\": \"Ada\"}).encode()\nrequest = Request(url, data=body, method=\"POST\", headers={\"Content-Type\": \"application/json\"})\nwith urlopen(request, timeout=5) as response:\n    created = json.load(response)", "POST submits data so the server can create a resource or perform an action."],
          ["PUT", "body = json.dumps({\"name\": \"Ada Lovelace\"}).encode()\nrequest = Request(f\"{url}/7\", data=body, method=\"PUT\", headers={\"Content-Type\": \"application/json\"})", "PUT sends the complete replacement representation for the resource at a known URL."],
          ["PATCH", "body = json.dumps({\"active\": True}).encode()\nrequest = Request(f\"{url}/7\", data=body, method=\"PATCH\", headers={\"Content-Type\": \"application/json\"})", "PATCH sends only the fields that should change instead of replacing the whole resource."],
          ["DELETE", "request = Request(f\"{url}/7\", method=\"DELETE\")\nwith urlopen(request, timeout=5) as response:\n    print(response.status)", "DELETE asks the server to remove the resource identified by the URL."]
        ]),
        t("JSON request & response bodies", "Encode outgoing JSON to bytes and declare its media type; decode incoming JSON from the response stream.", "JSON API", "import json\nfrom urllib.request import Request, urlopen\nbody = json.dumps({\"title\": \"Python\"}).encode(\"utf-8\")\nrequest = Request(url, data=body, headers={\"Content-Type\": \"application/json\"})\nwith urlopen(request, timeout=5) as response:\n    result = json.load(response)"),
        t("HTTP errors & timeouts", "Handle expected HTTP and network failures explicitly and always apply a finite timeout to remote calls.", "HTTP FAILURE", "from urllib.error import HTTPError, URLError\ntry:\n    with urlopen(request, timeout=5) as response:\n        body = response.read()\nexcept HTTPError as error:\n    print(error.code)\nexcept URLError as error:\n    print(error.reason)"),
        t("Sockets", "A socket is a low-level network endpoint; higher-level protocol libraries are usually safer for HTTP and other standard protocols.", "SOCKET", "import socket\nwith socket.create_connection((\"example.com\", 80), timeout=5) as connection:\n    connection.sendall(b\"HEAD / HTTP/1.0\\r\\nHost: example.com\\r\\n\\r\\n\")"),
        t("TLS with ssl", "ssl wraps sockets with certificate validation and encryption; create_default_context provides secure client defaults.", "TLS", "import socket, ssl\ncontext = ssl.create_default_context()\nwith socket.create_connection((\"example.com\", 443), timeout=5) as raw:\n    with context.wrap_socket(raw, server_hostname=\"example.com\") as secure:\n        print(secure.version())")
      ]),
    m(18, "Packaging, Performance & Security", "advanced",
      "Ship isolated projects, measure before optimizing, and avoid Python's best-known unsafe defaults.",
      "https://packaging.python.org/en/latest/",
      "Package a small library, profile one workload, and document the security boundaries around its inputs.",
      [
        t("Virtual environments", "A virtual environment gives one project its own interpreter-facing package installation directory.", "VENV", "python -m venv .venv\n# Windows\n.venv\\Scripts\\activate\n# macOS/Linux\nsource .venv/bin/activate"),
        t("pip & dependency installation", "Running pip through the selected interpreter installs packages into that interpreter's active environment.", "PIP", "python -m pip install --upgrade pip\npython -m pip install requests"),
        t("pyproject.toml", "pyproject.toml declares build-system requirements and standardized project metadata for modern packaging tools.", "PYPROJECT", "[build-system]\nrequires = [\"hatchling\"]\nbuild-backend = \"hatchling.build\"\n\n[project]\nname = \"quick-example\"\nversion = \"0.1.0\""),
        t("Source distributions & wheels", "A source distribution contains source files; a wheel is a built distribution designed for faster, predictable installation.", "BUILD", "python -m pip install build\npython -m build\n# Creates dist/*.tar.gz and dist/*.whl"),
        t("TestPyPI & PyPI publishing", "TestPyPI is a practice registry for verifying built packages and installation steps before publishing the real release to the public Python Package Index.", "PUBLISH", "python -m pip install twine\npython -m twine check dist/*\npython -m twine upload --repository testpypi dist/*"),
        t("timeit, cProfile & tracemalloc", "timeit compares small operations, cProfile finds cumulative runtime hotspots, and tracemalloc traces Python memory allocations.", "PROFILE", "python -m timeit \"sum(range(1000))\"\npython -m cProfile -s cumulative app.py\npython -X tracemalloc app.py"),
        t("Secure defaults", "Secure defaults make the safest behavior automatic: keep tokens outside code, reject untrusted pickle data, avoid shell-built commands, and use production-ready servers.", "SECURITY", "import secrets, subprocess\ntoken = secrets.token_urlsafe(32)\nsubprocess.run([\"git\", \"status\"], check=True, shell=False)\n# Never unpickle untrusted bytes.")
      ])
  ];

  const modules = source.map((module) => ({
    ...module,
    topics: module.topics.map((item) => item.name)
  }));
  const quickNotes = Object.fromEntries(source.map((module) => [
    module.id,
    module.topics.map((item) => [item.note, item.code])
  ]));
  const groupedExamples = {};
  const exampleComments = {};
  source.forEach((module) => module.topics.forEach((item) => {
    groupedExamples[item.name] = item.examples || [[item.label, item.code]];
    groupedExamples[item.name].forEach(([label, code, comment]) => {
      exampleComments[label] = comment || pythonExampleComment(item, label, code);
    });
  }));

  window.QUICKDEV_COURSE = {
    key: "python",
    name: "Python",
    mark: "Py",
    modules,
    quickNotes,
    groupedExamples,
    exampleComments,
    pageTitle: "Python at a Glance | QuickDevBase",
    pageDescription: "QuickDevBase Python — fast explanations for Python essentials, with direct links to the official Python and PyPA documentation.",
    heroEyebrow: "Python knowledge, at a glance",
    heroTitle: "Python, without<br>the <em>indentation intimidation.</em>",
    heroLede: "Scan the language from your first expression to async APIs and dependable packaging. Every module points to Python's official documentation for full detail.",
    previewLabel: "PYTHON.APP",
    previewCode: [
      '<span><b class="code-pink">from</b> dataclasses <b class="code-pink">import</b> dataclass</span>',
      '<span><b class="code-blue">@dataclass</b></span>',
      '<span><b class="code-pink">class</b> Topic:</span>',
      '<span>&nbsp;&nbsp;name: str</span>',
      '<span><b class="code-blue">print</b>(Topic("Python"))</span>'
    ].join(""),
    chipOne: "✓ Script ready",
    chipTwo: "⌁ Keep exploring",
    curriculumTitle: "One glance. Every Python essential.",
    curriculumLede: "Build the mental model first, test each tiny example, then continue into the official Python docs when you need the full contract.",
    searchPlaceholder: "Search topics, e.g. generators",
    certificateTitleHtml: "Python Developer<br>Knowledge Path",
    completionNoun: "Python developer",
    trademark: "Independent educational project—not affiliated with or endorsed by the Python Software Foundation. Python and related marks belong to their respective owners.",
    stageLabels: {
      foundation: "Foundation",
      core: "Python Core",
      backend: "Practical Python",
      advanced: "Production"
    },
    fallbackNote: "A practical Python concept worth understanding before moving to the next module.",
    fallbackCode: "# Try this in a small, disposable Python script."
  };
}());
