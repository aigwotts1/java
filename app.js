const javaModules = [
  {
    id: 1,
    title: "Java Basics",
    stage: "foundation",
    description: "Build the vocabulary every Java program uses, from variables to exceptions.",
    topics: [
      "Syntax, structure & comments",
      "Keywords & identifiers",
      "Primitive & non-primitive data types",
      "Variables & constants",
      "Type casting & promotion",
      "Operators",
      "Decision making & loops",
      "Console input and output",
      "Arrays & strings",
      "Methods & varargs",
      "Exception handling"
    ],
    challenge: "Create a console program that reads a name and score, assigns a grade with control flow, and safely handles invalid input."
  },
  {
    id: 2,
    title: "Object-Oriented Programming",
    shortTitle: "OOP Essentials",
    stage: "foundation",
    description: "Model real things with classes, reusable behavior, and clean boundaries.",
    topics: [
      "Classes & objects",
      "Default & parameterized constructors",
      "this keyword",
      "Inheritance patterns",
      "Method overloading vs overriding",
      "Compile-time & runtime polymorphism",
      "Abstract classes & interfaces",
      "Encapsulation",
      "Packages & access modifiers"
    ],
    challenge: "Model a small library with Book and Member classes, then use an interface to support multiple borrowing policies."
  },
  {
    id: 3,
    title: "Collections Framework",
    stage: "foundation",
    description: "Choose the right structure for ordered, unique, mapped, or queued data.",
    topics: [
      "Collection hierarchy",
      "ArrayList, LinkedList, Vector & Stack",
      "HashSet, LinkedHashSet & TreeSet",
      "HashMap, LinkedHashMap & TreeMap",
      "PriorityQueue & ArrayDeque",
      "Iterator & ListIterator",
      "Comparable vs Comparator"
    ],
    challenge: "Build a leaderboard that stores players, prevents duplicates, and supports sorting by score or player name."
  },
  {
    id: 4,
    title: "Multithreading & Concurrency",
    shortTitle: "Concurrency",
    stage: "foundation",
    description: "Understand how Java coordinates multiple tasks without corrupting shared state.",
    topics: [
      "Processes vs threads",
      "Thread lifecycle",
      "Thread class & Runnable",
      "Synchronization",
      "wait, notify & notifyAll",
      "Deadlocks",
      "Executor framework",
      "Concurrent collections"
    ],
    challenge: "Create a thread-safe ticket counter and run several buyers through an ExecutorService without overselling."
  },
  {
    id: 5,
    title: "Java I/O & NIO",
    stage: "foundation",
    description: "Read, write, buffer, serialize, and move data efficiently.",
    topics: [
      "File class",
      "Byte streams",
      "Character streams",
      "Buffered streams",
      "Object streams & serialization",
      "Scanner",
      "NIO channels, buffers, selectors & paths"
    ],
    challenge: "Read a CSV file, summarize its rows, and write the result to a new file using buffered resources safely."
  },
  {
    id: 6,
    title: "Java 8 Features",
    stage: "core",
    description: "Write expressive modern Java with functions, stream pipelines, async work, and a better date API.",
    topics: [
      "Lambda expressions",
      "Functional interfaces",
      "Built-in functional interfaces",
      "Method references",
      "Stream API",
      "Stream intermediate & terminal operations",
      "Collectors, grouping & partitioning",
      "Parallel streams",
      "Optional",
      "Default & static interface methods",
      "Date & Time API",
      "CompletableFuture"
    ],
    challenge: "Use a Java 8 stream to filter orders, group them by customer, calculate totals, and load one extra result asynchronously."
  },
  {
    id: 7,
    title: "JDBC",
    stage: "core",
    description: "Connect Java to relational data and perform safe, transactional operations.",
    topics: [
      "JDBC architecture",
      "Connecting to a database",
      "Statement & PreparedStatement",
      "CallableStatement",
      "CRUD queries",
      "Transactions",
      "Batch processing",
      "Connection pooling"
    ],
    challenge: "Implement a transaction that creates an order and its items together, rolling everything back if one insert fails."
  },
  {
    id: 8,
    title: "Java EE / Jakarta EE",
    shortTitle: "Jakarta EE",
    stage: "core",
    description: "Meet the web platform foundations behind enterprise Java applications.",
    topics: [
      "Servlet lifecycle & configuration",
      "JSP declarations & expressions",
      "JSTL",
      "Filters & listeners",
      "MVC architecture"
    ],
    challenge: "Sketch an MVC request flow for a product page, including the servlet, view, filter, and model responsibilities."
  },
  {
    id: 9,
    title: "Spring & Spring Boot",
    shortTitle: "Spring Boot",
    stage: "backend",
    description: "Build clean web services with dependency injection and convention-led setup.",
    topics: [
      "Spring Core & IoC",
      "Beans & configuration",
      "Spring MVC controllers",
      "RequestMapping & ModelAndView",
      "Spring Boot starters",
      "RESTful web services",
      "Spring Data JPA",
      "Spring Security basics"
    ],
    challenge: "Design a small REST API for notes with controller, service, and repository layers plus clear HTTP response codes."
  },
  {
    id: 10,
    title: "Hibernate ORM",
    stage: "backend",
    description: "Map Java objects to database records and manage relationships confidently.",
    topics: [
      "Hibernate architecture",
      "Configuration",
      "Session & SessionFactory",
      "CRUD operations",
      "HQL",
      "Entity relationships",
      "Annotations vs XML mapping"
    ],
    challenge: "Map Author and Book entities with a relationship, then write an HQL query that avoids unnecessary database calls."
  },
  {
    id: 11,
    title: "Build Tools",
    stage: "backend",
    description: "Make builds repeatable with dependencies, tasks, plugins, and project structure.",
    topics: [
      "Maven POM & lifecycle",
      "Maven goals & plugins",
      "Gradle build scripts",
      "Gradle tasks & dependencies",
      "Dependency management",
      "Multi-module builds",
      "Build & release process"
    ],
    challenge: "Create a build plan for a multi-module service, separating shared models from the API and test modules."
  },
  {
    id: 12,
    title: "JVM Internals",
    stage: "advanced",
    description: "See what happens below your code: loading, memory, execution, and collection.",
    topics: [
      "JVM architecture",
      "Class loader subsystem",
      "Runtime data areas",
      "Execution engine",
      "Garbage collection",
      "JVM types",
      "JVM parameters",
      "Memory management & tuning"
    ],
    challenge: "Explain where a local variable, a new object, static data, and method bytecode live while a Java method runs."
  },
  {
    id: 13,
    title: "Testing",
    stage: "advanced",
    description: "Protect behavior with focused unit tests, clear doubles, and integrated checks.",
    topics: [
      "JUnit assertions & annotations",
      "Test cases & suites",
      "Mockito mocking & stubbing",
      "Mockito verification",
      "Integration testing"
    ],
    challenge: "Test an order service in isolation by mocking its repository, then write one integration test for the real persistence path."
  },
  {
    id: 14,
    title: "Advanced Java Concepts",
    shortTitle: "Advanced Java",
    stage: "advanced",
    description: "Explore the language tools that make libraries flexible and applications adaptable.",
    topics: [
      "Generics",
      "Built-in & custom annotations",
      "Reflection API",
      "Enums",
      "Records",
      "Java modules"
    ],
    challenge: "Create a generic result type, model its state with an enum, and expose the final data through an immutable record."
  },
  {
    id: 15,
    title: "Networking",
    stage: "advanced",
    description: "Move data between systems using URLs, TCP/IP, and socket communication.",
    topics: [
      "URL & URLConnection",
      "TCP/IP sockets",
      "ServerSocket & Socket"
    ],
    challenge: "Build the outline of a tiny echo server that accepts a client message and sends the same text back."
  },
  {
    id: 16,
    title: "Tools & IDE",
    stage: "advanced",
    description: "Set up a professional workflow for coding, version control, and API testing.",
    topics: [
      "IntelliJ IDEA / Eclipse",
      "Git & GitHub",
      "Postman API testing"
    ],
    challenge: "Create a feature branch, make one focused commit, and describe the API request you would verify before merging."
  },
  {
    id: 17,
    title: "DSA for Interviews",
    shortTitle: "DSA Practice",
    stage: "advanced",
    description: "Strengthen the patterns behind efficient problem solving and technical interviews.",
    topics: [
      "Arrays & strings",
      "Linked lists",
      "Stacks & queues",
      "Binary trees & BST",
      "Graphs",
      "Searching & sorting",
      "Recursion & backtracking",
      "Dynamic programming",
      "Hashing"
    ],
    challenge: "Solve a duplicate-detection problem with hashing, then compare its time and space cost with a sorting-based solution."
  },
  {
    id: 18,
    title: "REST APIs with Spring Boot",
    shortTitle: "REST APIs",
    stage: "backend",
    description: "Design predictable JSON APIs and implement each HTTP operation clearly with Spring Boot.",
    topics: [
      "REST architecture & resource URLs",
      "HTTP methods: GET, POST, PUT, PATCH & DELETE",
      "Spring Boot REST controllers",
      "Path variables & query parameters",
      "Request bodies, JSON & DTOs",
      "ResponseEntity & status codes",
      "Validation & global error handling",
      "Headers, media types & content negotiation",
      "Idempotency & safe retries",
      "Pagination, filtering & sorting",
      "Authentication, authorization & CORS",
      "Testing with Postman & MockMvc"
    ],
    challenge: "Build a Book REST API with CRUD endpoints, validation, useful status codes, pagination, and one MockMvc integration test."
  }
];

// Notes are kept in the same order as each module's topics. This makes every
// curriculum item a small, readable lesson without bloating the overview cards.
const javaQuickNotes = {
  1: [
    ["Java programs live inside classes; braces group code and comments leave notes the compiler ignores.", `class Hello {\n  // Program starts here\n  public static void main(String[] args) {}\n}`],
    ["Keywords are reserved Java words. Identifiers are the names you choose for classes, methods, and variables.", `int score = 90; // int = keyword, score = identifier`],
    ["Primitive types hold simple values; non-primitive types are objects with data and useful methods.", `int age = 24;\nString name = "Asha";`],
    ["A variable can change while a final constant is assigned once and then stays fixed.", `int attempts = 1;\nfinal double PI = 3.14159;`],
    ["Casting converts one type to another. Widening is automatic; narrowing needs an explicit cast.", `double price = 99;\nint rounded = (int) price;`],
    ["Operators calculate values, compare them, assign results, or combine true/false conditions.", `boolean eligible = age >= 18 && score > 60;`],
    ["Conditions choose a path; loops repeat a block until their condition becomes false.", `for (int i = 1; i <= 3; i++) {\n  System.out.println(i);\n}`],
    ["System.out prints output, while Scanner is a beginner-friendly way to read keyboard input.", `Scanner in = new Scanner(System.in);\nString name = in.nextLine();`],
    ["An array stores a fixed number of same-type values; a String stores text and cannot be changed in place.", `int[] scores = {72, 88, 95};\nString course = "Java";`],
    ["A method names reusable behavior. Varargs let one method accept zero or more values of one type.", `static int sum(int... nums) {\n  return Arrays.stream(nums).sum();\n}`],
    ["Exceptions report problems at runtime. Catch expected failures and use finally for cleanup that must happen.", `try { return Integer.parseInt(text); }\ncatch (NumberFormatException e) { return 0; }`]
  ],
  2: [
    ["A class is a blueprint; an object is one real instance created from that blueprint.", `class Car { String color; }\nCar car = new Car();`],
    ["A constructor prepares a new object. A parameterized constructor receives the starting values it needs.", `User() {}\nUser(String name) { this.name = name; }`],
    ["this means the current object and helps distinguish its fields from parameters with the same name.", `this.name = name;`],
    ["Inheritance lets a child class reuse and specialize accessible behavior from a parent class.", `class Dog extends Animal {\n  void bark() {}\n}`],
    ["Overloading uses the same method name with different parameters; overriding replaces inherited behavior.", `void pay(int cash) {}\nvoid pay(Card card) {}`],
    ["Compile-time polymorphism picks an overload; runtime polymorphism calls the overridden method of the real object.", `Animal pet = new Dog();\npet.speak(); // Dog's version`],
    ["An abstract class can share state and partial behavior; an interface defines a capability classes agree to provide.", `interface Payable { void pay(); }`],
    ["Encapsulation hides internal state and exposes controlled operations that keep an object valid.", `private int balance;\npublic void deposit(int amount) { balance += amount; }`],
    ["Packages organize related code. Access modifiers decide whether members are private, package-level, protected, or public.", `package com.acme.orders;\npublic class Order {}`]
  ],
  3: [
    ["Collection is the shared family for Java containers; List, Set, and Queue describe different storage rules.", `Collection<String> names = new ArrayList<>();`],
    ["ArrayList is fast for indexed reads; LinkedList favors end operations; Vector and Stack are older synchronized types.", `List<String> names = new ArrayList<>();\nnames.add("Mira");`],
    ["A Set keeps unique values. HashSet is fastest generally, LinkedHashSet keeps insertion order, and TreeSet sorts.", `Set<Integer> ids = new HashSet<>();`],
    ["A Map connects unique keys to values. HashMap is general-purpose, LinkedHashMap keeps order, and TreeMap sorts keys.", `Map<String, Integer> scores = new HashMap<>();\nscores.put("Ana", 92);`],
    ["PriorityQueue removes the highest-priority item first; ArrayDeque is a fast queue or double-ended stack.", `Queue<Integer> jobs = new PriorityQueue<>();`],
    ["Iterators walk through a collection safely; ListIterator can also move backward and edit a List.", `Iterator<String> it = names.iterator();\nwhile (it.hasNext()) System.out.println(it.next());`],
    ["Comparable gives a type its natural order; Comparator supplies an outside or alternate ordering rule.", `users.sort(Comparator.comparing(User::name));`]
  ],
  4: [
    ["A process is a running application; its threads are smaller execution paths that share the process memory.", `// One JVM process can run many Thread objects.`],
    ["A thread moves through states such as new, runnable, waiting, blocked, and terminated.", `Thread worker = new Thread(task);\nworker.start();`],
    ["Extend Thread for a specialized thread, or pass a Runnable when you only need to describe the task.", `Runnable task = () -> doWork();\nnew Thread(task).start();`],
    ["Synchronization allows only one thread at a time into code that changes shared data.", `synchronized void increment() { count++; }`],
    ["wait pauses inside a monitor; notify wakes one waiter and notifyAll wakes every waiting thread.", `synchronized (lock) {\n  while (!ready) lock.wait();\n}`],
    ["A deadlock happens when threads each hold a resource while waiting forever for the other resource.", `// Avoid taking lockA then lockB in different orders.`],
    ["Executors manage reusable worker threads so you submit tasks instead of manually creating every thread.", `ExecutorService pool = Executors.newFixedThreadPool(4);\npool.submit(task);`],
    ["Concurrent collections coordinate access internally and are safer than manually sharing ordinary collections.", `Map<String, Integer> cache = new ConcurrentHashMap<>();`]
  ],
  5: [
    ["File is an older path abstraction used to inspect, create, rename, or delete files and directories.", `File file = new File("notes.txt");\nboolean exists = file.exists();`],
    ["Byte streams move raw binary data and are best for images, archives, audio, and other non-text files.", `InputStream in = new FileInputStream("photo.jpg");`],
    ["Character streams understand text as characters and use Reader and Writer as their base types.", `Reader reader = new FileReader("notes.txt");`],
    ["Buffered streams reduce expensive disk operations by moving data in larger in-memory chunks.", `BufferedReader reader = Files.newBufferedReader(path);`],
    ["Serialization turns an object into bytes; deserialization reconstructs it. Avoid it for untrusted data.", `class User implements Serializable {}`],
    ["Scanner splits input into tokens and conveniently reads strings, numbers, or console input.", `Scanner scanner = new Scanner(System.in);\nint age = scanner.nextInt();`],
    ["NIO offers modern Path utilities plus buffers and channels for scalable or non-blocking data transfer.", `Path path = Paths.get("notes.txt");\nString text = Files.readString(path);`]
  ],
  6: [
    ["A lambda is a small unnamed function you can pass around when Java expects a functional interface.", `names.forEach(name -> System.out.println(name));`],
    ["A functional interface has one abstract method, making it the target shape for a lambda.", `Predicate<Integer> adult = age -> age >= 18;`],
    ["Java 8 includes common lambda shapes: Predicate tests, Function converts, Consumer uses, and Supplier creates values.", `Function<String, Integer> length = String::length;`],
    ["A method reference is a shorter lambda that simply calls an existing method.", `names.forEach(System.out::println);`],
    ["A stream describes a lazy pipeline over data without changing the source collection.", `List<Integer> evens = nums.stream()\n  .filter(n -> n % 2 == 0)\n  .collect(Collectors.toList());`],
    ["Intermediate operations build a stream; a terminal operation finally performs the work and produces a result.", `long count = names.stream()\n  .filter(n -> !n.isEmpty())\n  .count();`],
    ["Collectors gather stream results into lists, maps, groups, partitions, summaries, or joined text.", `Map<String, List<Order>> byCustomer = orders.stream()\n  .collect(Collectors.groupingBy(Order::customer));`],
    ["A parallel stream may use several common-pool threads; use it only for large, independent CPU work after measuring.", `long total = numbers.parallelStream()\n  .mapToLong(Integer::longValue).sum();`],
    ["Optional represents a value that may be missing and encourages explicit handling instead of surprise nulls.", `String name = optionalName.orElse("Guest");`],
    ["Default methods add interface behavior; static interface methods are utilities called on the interface itself.", `interface Loggable {\n  default void log() { System.out.println("ok"); }\n}`],
    ["java.time provides immutable, clear types for dates, times, durations, zones, and formatting.", `LocalDate launch = LocalDate.of(2026, 8, 13);`],
    ["CompletableFuture represents a result that arrives later and lets you transform or combine async stages.", `CompletableFuture<String> name = CompletableFuture\n  .supplyAsync(this::loadUser)\n  .thenApply(User::name);`]
  ],
  7: [
    ["JDBC is the standard Java API that sends SQL to relational databases through a vendor driver.", `Connection -> PreparedStatement -> ResultSet`],
    ["A Connection represents one database session and should be closed, normally with try-with-resources.", `try (Connection con = dataSource.getConnection()) {}`],
    ["Statement sends fixed SQL; PreparedStatement safely binds values and helps prevent SQL injection.", `PreparedStatement ps = con.prepareStatement(\n  "SELECT * FROM users WHERE id = ?");`],
    ["CallableStatement invokes a stored database procedure and supports input and output parameters.", `CallableStatement cs = con.prepareCall("{call find_user(?)}");`],
    ["CRUD means create, read, update, and delete—the four everyday operations performed on stored data.", `INSERT / SELECT / UPDATE / DELETE`],
    ["A transaction groups statements so either every change succeeds or the whole group rolls back.", `con.setAutoCommit(false);\ncon.commit(); // or con.rollback()`],
    ["Batching sends many similar statements together, reducing network round trips to the database.", `ps.addBatch();\nint[] results = ps.executeBatch();`],
    ["A connection pool reuses open database connections instead of paying to create one for every request.", `Connection con = dataSource.getConnection();`]
  ],
  8: [
    ["A servlet receives HTTP requests; the container creates it, initializes it, calls service methods, then destroys it.", `protected void doGet(HttpServletRequest req,\n  HttpServletResponse res) {}`],
    ["JSP builds server-rendered HTML; declarations define members and expressions print a value into the response.", `<h1>\${user.name}</h1>`],
    ["JSTL supplies standard JSP tags for loops, conditions, formatting, and other common view work.", `<c:forEach items="\${users}" var="user">...</c:forEach>`],
    ["A filter runs before or after a request; a listener reacts to lifecycle events in the web application.", `filterChain.doFilter(request, response);`],
    ["MVC separates data and rules (Model), presentation (View), and request coordination (Controller).", `request -> Controller -> Model -> View`]
  ],
  9: [
    ["Spring's IoC container creates objects and injects their dependencies, reducing manual wiring and coupling.", `@Service\nclass OrderService { OrderService(OrderRepo repo) {} }`],
    ["A bean is an object managed by Spring; configuration tells the container how beans are created and connected.", `@Bean\nClock clock() { return Clock.systemUTC(); }`],
    ["A controller maps web requests to Java methods and returns a view or response body.", `@RestController\nclass UserController {}`],
    ["RequestMapping chooses the URL and HTTP method; ModelAndView bundles view data with a server-rendered view name.", `@GetMapping("/users/{id}")`],
    ["Starters are curated dependency bundles; auto-configuration creates sensible beans based on what your app includes.", `implementation("org.springframework.boot:spring-boot-starter-web")`],
    ["A REST service exposes resources through HTTP, using verbs and status codes with JSON representations.", `GET /api/orders/42 -> 200 OK`],
    ["Spring Data JPA generates common repository operations and queries from concise interfaces and method names.", `interface UserRepo extends JpaRepository<User, Long> {}`],
    ["Spring Security handles authentication, authorization, common attack protection, and security filter chains.", `http.authorizeHttpRequests(auth ->\n  auth.anyRequest().authenticated());`]
  ],
  10: [
    ["Hibernate sits between Java objects and relational tables, translating entity changes into SQL.", `Java entity <-> Hibernate session <-> database row`],
    ["Configuration supplies connection settings, mapped entities, SQL dialect, and other Hibernate behavior.", `spring.jpa.hibernate.ddl-auto=validate`],
    ["SessionFactory is expensive and shared; a Session is a short-lived unit used to load and save entities.", `try (Session session = factory.openSession()) {}`],
    ["Hibernate CRUD works with entities: persist new, find existing, merge changes, and remove records.", `session.persist(user);\nUser found = session.find(User.class, id);`],
    ["HQL queries entity classes and fields rather than raw table and column names.", `from User u where u.active = true`],
    ["Relationship annotations describe one-to-one, one-to-many, many-to-one, and many-to-many associations.", `@ManyToOne\nprivate Author author;`],
    ["Annotations keep mapping beside Java code; XML keeps mapping external and can change it without editing the entity.", `@Entity\n@Table(name = "users")`]
  ],
  11: [
    ["A Maven POM describes a project; lifecycle phases such as test and package run a standard build sequence.", `mvn test\nmvn package`],
    ["A goal is one plugin action; plugins add abilities such as compiling, testing, packaging, or generating code.", `mvn compiler:compile`],
    ["A Gradle build script declares plugins, dependencies, repositories, and custom build logic.", `plugins { id("java") }`],
    ["A Gradle task is one unit of work; dependency declarations place libraries on the required classpath.", `dependencies { testImplementation("org.junit.jupiter:junit-jupiter:5.11.0") }`],
    ["Dependency management selects library versions and resolves the other libraries they require transitively.", `implementation("com.fasterxml.jackson.core:jackson-databind:2.18.0")`],
    ["A multi-module build manages related projects together while keeping each module focused and reusable.", `root-project\n├─ api\n└─ shared`],
    ["A release build compiles, tests, packages, versions, and publishes a repeatable artifact.", `clean -> compile -> test -> package -> publish`]
  ],
  12: [
    ["The JVM loads bytecode, manages runtime memory, executes instructions, and provides services such as garbage collection.", `.java -> javac -> .class -> JVM`],
    ["Class loaders find class bytecode and load it through bootstrap, platform, and application loader levels.", `Class<?> type = Class.forName("com.acme.User");`],
    ["The heap stores objects; stacks hold method frames; the method area stores class data; registers track execution.", `User u = new User(); // reference in frame, object on heap`],
    ["The execution engine interprets bytecode and JIT-compiles frequently used paths into native machine code.", `hot bytecode -> JIT compiler -> native code`],
    ["Garbage collection automatically reclaims heap objects that can no longer be reached by running code.", `user = null; // object may become eligible for GC`],
    ["JVM implementations include client/server styles and collectors tuned for throughput, latency, or small footprints.", `java -XX:+UseG1GC App`],
    ["JVM flags tune memory, diagnostics, garbage collectors, and runtime behavior; measure before changing them.", `java -Xms512m -Xmx2g App`],
    ["Memory tuning starts with evidence: watch allocation, heap use, pause times, leaks, and thread behavior.", `jcmd <pid> GC.heap_info`]
  ],
  13: [
    ["JUnit annotations mark tests and setup; assertions describe the result that must be true.", `@Test\nvoid adds() { assertEquals(4, calculator.add(2, 2)); }`],
    ["A test case checks one behavior; a suite groups related tests so they can run together.", `@Suite\n@SelectClasses({UserTest.class, OrderTest.class})`],
    ["A mock replaces a collaborator; stubbing defines the value it should return for a specific call.", `when(repo.findById(1L)).thenReturn(Optional.of(user));`],
    ["Verification checks whether a mock interaction happened, which is useful when the interaction is the behavior.", `verify(emailService).sendReceipt(order);`],
    ["An integration test lets real parts work together, often including the framework, database, or HTTP layer.", `@SpringBootTest\nclass OrderFlowTest {}`]
  ],
  14: [
    ["Generics make types reusable while keeping compile-time type safety and avoiding manual casts.", `List<String> names = new ArrayList<>();`],
    ["Annotations attach metadata. Built-ins guide Java tools; custom annotations express rules specific to your app.", `@Deprecated\nvoid oldMethod() {}`],
    ["Reflection inspects or invokes classes at runtime; it is powerful but less safe and harder to refactor.", `Method method = User.class.getMethod("name");`],
    ["An enum defines a fixed, type-safe set of named values and can also contain fields and methods.", `enum Status { NEW, PAID, SHIPPED }`],
    ["A record is a concise immutable data carrier with generated accessors, equality, hash code, and text output.", `record Point(int x, int y) {}`],
    ["Modules group packages, state required dependencies, and control which packages are exposed.", `module com.acme.app { requires java.sql; }`]
  ],
  15: [
    ["URL identifies a network resource; URLConnection opens a connection and exposes headers and content streams.", `URLConnection con = new URL(address).openConnection();`],
    ["A TCP socket creates a reliable, ordered byte stream between two network endpoints.", `Socket socket = new Socket("localhost", 8080);`],
    ["ServerSocket listens for clients; accept returns a Socket used to exchange data with one connected client.", `try (ServerSocket server = new ServerSocket(8080)) {\n  Socket client = server.accept();\n}`]
  ],
  16: [
    ["An IDE combines editing, navigation, refactoring, running, testing, and debugging into one Java workspace.", `Set a breakpoint -> Debug -> inspect variables`],
    ["Git records local history; GitHub hosts repositories so teams can review, discuss, and share changes.", `git add .\ngit commit -m "Add lesson"\ngit push`],
    ["Postman builds and saves HTTP requests so you can inspect API status, headers, body, and timing.", `GET http://localhost:8080/api/users`]
  ],
  17: [
    ["Arrays give constant-time indexed access; strings are character sequences used in scanning and pattern problems.", `int first = nums[0]; // O(1)`],
    ["A linked list stores nodes connected by references, making local insertion easy but indexed lookup slow.", `node.next = new Node(7);`],
    ["A stack is last-in-first-out; a queue is first-in-first-out. Both model ordering constraints.", `Deque<Integer> stack = new ArrayDeque<>();\nstack.push(1);`],
    ["A binary tree gives each node up to two children; a BST orders values to support efficient search when balanced.", `left values < node value < right values`],
    ["A graph models vertices and connections; traversal commonly uses breadth-first or depth-first search.", `Map<Node, List<Node>> graph = new HashMap<>();`],
    ["Searching locates a value; sorting arranges values and often makes later operations simpler or faster.", `Arrays.sort(nums);\nint index = Arrays.binarySearch(nums, target);`],
    ["Recursion solves a problem through smaller copies of itself; backtracking undoes choices that reach a dead end.", `void visit(Node n) {\n  if (n == null) return;\n  visit(n.left);\n}`],
    ["Dynamic programming saves answers to overlapping subproblems so the same work is not repeated.", `dp[i] = dp[i - 1] + dp[i - 2];`],
    ["Hashing converts a key into a bucket location, enabling average constant-time lookup and duplicate detection.", `Set<Integer> seen = new HashSet<>();`]
  ],
  18: [
    ["REST models things as resources with stable noun-based URLs; representations such as JSON carry their current data.", `GET /api/books/42`],
    ["HTTP methods express intent: GET reads, POST creates, PUT replaces, PATCH partially updates, and DELETE removes.", `GET | POST | PUT | PATCH | DELETE /api/books`],
    ["A Spring REST controller maps HTTP requests to Java methods and serializes returned objects as JSON.", `@RestController\n@RequestMapping("/api/books")\nclass BookController {}`],
    ["A path variable identifies one resource; query parameters optionally filter, sort, paginate, or change the view.", `@GetMapping("/{id}")\nBook one(@PathVariable long id,\n  @RequestParam(defaultValue = "false") boolean details) {}`],
    ["A request body carries JSON input; a DTO exposes only the fields the API accepts instead of binding an entity directly.", `record CreateBookRequest(String title) {}\n@PostMapping\nBook create(@RequestBody CreateBookRequest body) {}`],
    ["ResponseEntity controls the body, headers, and HTTP status so clients can reliably understand the outcome.", `return ResponseEntity.status(HttpStatus.CREATED)\n  .body(savedBook);`],
    ["Bean Validation rejects bad input at the boundary; a global handler turns exceptions into one consistent error shape.", `Book create(@Valid @RequestBody CreateBookRequest body) {}`],
    ["Headers carry metadata; media types and content negotiation decide which representation the client sends or receives.", `@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)`],
    ["An idempotent operation has the same final effect when safely repeated; GET, PUT, and DELETE should normally be idempotent.", `PUT /api/books/42  // repeating it keeps the same final state`],
    ["Pagination limits response size while filtering and sorting let clients request a useful, stable slice of a collection.", `GET /api/books?page=0&size=20&sort=title,asc`],
    ["Authentication proves identity, authorization checks permission, and CORS controls which browser origins may call the API.", `@PreAuthorize("hasRole('ADMIN')")\n@DeleteMapping("/{id}")`],
    ["Postman is useful for manual exploration; MockMvc runs repeatable Spring HTTP tests without starting a real server.", `mockMvc.perform(get("/api/books/42"))\n  .andExpect(status().isOk());`]
  ]
};

// Grouped headings get one labeled example per named idea. Single-concept
// headings continue to use their compact example from quickNotes above.
const javaGroupedExamples = {
  "Syntax, structure & comments": [
    ["Syntax", `int total = 2 + 3;`],
    ["Structure", `class App {\n  public static void main(String[] args) {}\n}`],
    ["Comment", `// Java ignores this note while compiling.`]
  ],
  "Keywords & identifiers": [
    ["Keyword", `int score = 90; // int is reserved by Java`],
    ["Identifier", `int playerScore = 90; // playerScore is your name`]
  ],
  "Primitive & non-primitive data types": [
    ["Primitive", `int age = 24;\nboolean active = true;`],
    ["Non-primitive", `String name = "Asha";\nint[] scores = {80, 92};`]
  ],
  "Variables & constants": [
    ["Variable", `int attempts = 1;\nattempts = 2;`],
    ["Constant", `final double PI = 3.14159;`]
  ],
  "Type casting & promotion": [
    ["Explicit cast", `double price = 99.8;\nint whole = (int) price;`],
    ["Automatic promotion", `int count = 5;\ndouble total = count + 2.5;`]
  ],
  "Decision making & loops": [
    ["Decision", `if (score >= 60) {\n  System.out.println("Pass");\n}`],
    ["Loop", `for (int i = 0; i < 3; i++) {\n  System.out.println(i);\n}`]
  ],
  "Arrays & strings": [
    ["Array", `int[] scores = {72, 88, 95};\nint first = scores[0];`],
    ["String", `String course = "Java";\nint length = course.length();`]
  ],
  "Methods & varargs": [
    ["Method", `static int doubleIt(int n) {\n  return n * 2;\n}`],
    ["Varargs", `static int sum(int... nums) {\n  return Arrays.stream(nums).sum();\n}`]
  ],
  "Classes & objects": [
    ["Class", `class Car {\n  String color;\n}`],
    ["Object", `Car car = new Car();\ncar.color = "red";`]
  ],
  "Default & parameterized constructors": [
    ["Default constructor", `User() {\n  name = "Guest";\n}`],
    ["Parameterized constructor", `User(String name) {\n  this.name = name;\n}`]
  ],
  "Method overloading vs overriding": [
    ["Overloading", `void pay(int cash) {}\nvoid pay(Card card) {}`],
    ["Overriding", `class Dog extends Animal {\n  @Override void speak() { System.out.println("Woof"); }\n}`]
  ],
  "Compile-time & runtime polymorphism": [
    ["Compile-time", `print(10);     // chooses print(int)\nprint("ten");  // chooses print(String)`],
    ["Runtime", `Animal pet = new Dog();\npet.speak(); // Dog's method runs`]
  ],
  "Abstract classes & interfaces": [
    ["Abstract class", `abstract class Shape {\n  abstract double area();\n}`],
    ["Interface", `interface Payable {\n  void pay();\n}`]
  ],
  "Packages & access modifiers": [
    ["Package", `package com.acme.orders;`],
    ["private", `private int balance; // same class only`],
    ["default", `int count; // same package`],
    ["protected", `protected void save() {} // package + children`],
    ["public", `public class Order {} // everywhere`]
  ],
  "ArrayList, LinkedList, Vector & Stack": [
    ["ArrayList", `List<String> names = new ArrayList<>();\nnames.add("Mira");`],
    ["LinkedList", `LinkedList<String> queue = new LinkedList<>();\nqueue.addLast("task");`],
    ["Vector", `Vector<String> legacyList = new Vector<>();\nlegacyList.add("item");`],
    ["Stack", `Stack<String> stack = new Stack<>();\nstack.push("top");`]
  ],
  "HashSet, LinkedHashSet & TreeSet": [
    ["HashSet", `Set<Integer> fast = new HashSet<>();\nfast.add(7);`],
    ["LinkedHashSet", `Set<Integer> ordered = new LinkedHashSet<>();\nordered.add(7);`],
    ["TreeSet", `Set<Integer> sorted = new TreeSet<>();\nsorted.add(7);`]
  ],
  "HashMap, LinkedHashMap & TreeMap": [
    ["HashMap", `Map<String, Integer> fast = new HashMap<>();\nfast.put("Ana", 92);`],
    ["LinkedHashMap", `Map<String, Integer> ordered = new LinkedHashMap<>();`],
    ["TreeMap", `Map<String, Integer> sorted = new TreeMap<>();`]
  ],
  "PriorityQueue & ArrayDeque": [
    ["PriorityQueue", `Queue<Integer> jobs = new PriorityQueue<>();\njobs.offer(2);`],
    ["ArrayDeque", `Deque<String> tasks = new ArrayDeque<>();\ntasks.addFirst("urgent");`]
  ],
  "Iterator & ListIterator": [
    ["Iterator", `Iterator<String> it = names.iterator();\nwhile (it.hasNext()) System.out.println(it.next());`],
    ["ListIterator", `ListIterator<String> it = names.listIterator();\nif (it.hasPrevious()) System.out.println(it.previous());`]
  ],
  "Comparable vs Comparator": [
    ["Comparable", `class User implements Comparable<User> {\n  public int compareTo(User other) { return name.compareTo(other.name); }\n}`],
    ["Comparator", `users.sort(Comparator.comparing(User::score));`]
  ],
  "Processes vs threads": [
    ["Process", `Process process = new ProcessBuilder("java", "Worker").start();`],
    ["Thread", `Thread thread = new Thread(() -> doWork());\nthread.start();`]
  ],
  "Thread class & Runnable": [
    ["Thread class", `class Worker extends Thread {\n  public void run() { doWork(); }\n}`],
    ["Runnable", `Runnable task = () -> doWork();\nnew Thread(task).start();`]
  ],
  "wait, notify & notifyAll": [
    ["wait", `synchronized (lock) {\n  while (!ready) lock.wait();\n}`],
    ["notify", `synchronized (lock) {\n  lock.notify(); // wake one waiter\n}`],
    ["notifyAll", `synchronized (lock) {\n  lock.notifyAll(); // wake every waiter\n}`]
  ],
  "Object streams & serialization": [
    ["Serialization", `class User implements Serializable {}`],
    ["ObjectOutputStream", `ObjectOutputStream out = new ObjectOutputStream(stream);\nout.writeObject(user);`],
    ["ObjectInputStream", `ObjectInputStream in = new ObjectInputStream(stream);\nUser user = (User) in.readObject();`]
  ],
  "NIO channels, buffers, selectors & paths": [
    ["Channel", `FileChannel channel = FileChannel.open(path, StandardOpenOption.READ);`],
    ["Buffer", `ByteBuffer buffer = ByteBuffer.allocate(1024);\nchannel.read(buffer);`],
    ["Selector", `Selector selector = Selector.open();\nchannel.register(selector, SelectionKey.OP_READ);`],
    ["Path", `Path path = Paths.get("notes.txt");\nString text = Files.readString(path);`]
  ],
  "Default & static interface methods": [
    ["Default method", `interface Loggable {\n  default void log() { System.out.println("ok"); }\n}`],
    ["Static method", `interface MathTools {\n  static int doubleIt(int n) { return n * 2; }\n}`]
  ],
  "Built-in functional interfaces": [
    ["Predicate", `Predicate<Integer> adult = age -> age >= 18;\nboolean allowed = adult.test(20);`],
    ["Function", `Function<String, Integer> length = String::length;\nint size = length.apply("Java");`],
    ["Consumer", `Consumer<String> print = System.out::println;\nprint.accept("Hello");`],
    ["Supplier", `Supplier<UUID> ids = UUID::randomUUID;\nUUID id = ids.get();`]
  ],
  "Stream intermediate & terminal operations": [
    ["Intermediate operation", `Stream<String> clean = names.stream()\n  .filter(name -> !name.isEmpty())\n  .map(String::trim);`],
    ["Terminal operation", `List<String> result = clean\n  .collect(Collectors.toList());`]
  ],
  "Collectors, grouping & partitioning": [
    ["Collecting", `List<String> names = users.stream()\n  .map(User::name)\n  .collect(Collectors.toList());`],
    ["Grouping", `Map<String, List<Order>> byCustomer = orders.stream()\n  .collect(Collectors.groupingBy(Order::customer));`],
    ["Partitioning", `Map<Boolean, List<Integer>> split = nums.stream()\n  .collect(Collectors.partitioningBy(n -> n % 2 == 0));`]
  ],
  "Date & Time API": [
    ["Date", `LocalDate today = LocalDate.now();`],
    ["Time", `LocalTime now = LocalTime.now();`],
    ["Date + time", `LocalDateTime stamp = LocalDateTime.now();`]
  ],
  "CompletableFuture": [
    ["supplyAsync", `CompletableFuture<User> user =\n  CompletableFuture.supplyAsync(this::loadUser);`],
    ["thenApply", `CompletableFuture<String> name =\n  user.thenApply(User::name);`],
    ["thenCombine", `user.thenCombine(orders, UserSummary::new);`]
  ],
  "Statement & PreparedStatement": [
    ["Statement", `Statement stmt = con.createStatement();\nstmt.executeQuery("SELECT * FROM users");`],
    ["PreparedStatement", `PreparedStatement ps = con.prepareStatement(\n  "SELECT * FROM users WHERE id = ?");\nps.setLong(1, id);`]
  ],
  "Servlet lifecycle & configuration": [
    ["Lifecycle", `init();\nservice(request, response);\ndestroy();`],
    ["Configuration", `@WebServlet("/users")\nclass UserServlet extends HttpServlet {}`]
  ],
  "JSP declarations & expressions": [
    ["Declaration", `<%! int visits = 0; %>`],
    ["Expression", `<h1>Welcome <%= user.getName() %></h1>`]
  ],
  "Filters & listeners": [
    ["Filter", `filterChain.doFilter(request, response);`],
    ["Listener", `@WebListener\nclass StartupListener implements ServletContextListener {}`]
  ],
  "Spring Core & IoC": [
    ["Spring Core", `ApplicationContext context =\n  new AnnotationConfigApplicationContext(AppConfig.class);`],
    ["IoC injection", `@Service\nclass OrderService { OrderService(OrderRepo repo) {} }`]
  ],
  "Beans & configuration": [
    ["Bean", `@Component\nclass EmailService {}`],
    ["Configuration", `@Configuration\nclass AppConfig {\n  @Bean Clock clock() { return Clock.systemUTC(); }\n}`]
  ],
  "RequestMapping & ModelAndView": [
    ["RequestMapping", `@RequestMapping(path = "/users", method = RequestMethod.GET)`],
    ["ModelAndView", `return new ModelAndView("users", "items", users);`]
  ],
  "REST architecture & resource URLs": [
    ["Resource URL", `GET /api/books/42`],
    ["Nested resource", `GET /api/authors/7/books`]
  ],
  "HTTP methods: GET, POST, PUT, PATCH & DELETE": [
    ["GET", `@GetMapping("/{id}")\nBook get(@PathVariable long id) {\n  return service.find(id);\n}`],
    ["POST", `@PostMapping\nResponseEntity<Book> create(@RequestBody CreateBookRequest body) {\n  return ResponseEntity.status(201).body(service.create(body));\n}`],
    ["PUT", `@PutMapping("/{id}")\nBook replace(@PathVariable long id, @RequestBody Book body) {\n  return service.replace(id, body);\n}`],
    ["PATCH", `@PatchMapping("/{id}")\nBook edit(@PathVariable long id, @RequestBody UpdateBookRequest body) {\n  return service.update(id, body);\n}`],
    ["DELETE", `@DeleteMapping("/{id}")\n@ResponseStatus(HttpStatus.NO_CONTENT)\nvoid delete(@PathVariable long id) { service.delete(id); }`]
  ],
  "Spring Boot REST controllers": [
    ["RestController", `@RestController\nclass BookController {}`],
    ["Controller base path", `@RequestMapping("/api/books")\nclass BookController {}`]
  ],
  "Path variables & query parameters": [
    ["Path variable", `@GetMapping("/{id}")\nBook one(@PathVariable long id) {}`],
    ["Query parameter", `@GetMapping\nList<Book> all(@RequestParam(required = false) String author) {}`]
  ],
  "Request bodies, JSON & DTOs": [
    ["Request body", `Book create(@RequestBody CreateBookRequest body) {}`],
    ["JSON", `{\n  "title": "Effective Java",\n  "author": "Joshua Bloch"\n}`],
    ["DTO", `record CreateBookRequest(\n  @NotBlank String title,\n  @NotBlank String author\n) {}`]
  ],
  "ResponseEntity & status codes": [
    ["200 OK", `return ResponseEntity.ok(book);`],
    ["201 Created", `return ResponseEntity.created(location).body(book);`],
    ["204 No Content", `return ResponseEntity.noContent().build();`],
    ["404 Not Found", `return ResponseEntity.notFound().build();`]
  ],
  "Validation & global error handling": [
    ["Validation", `Book create(@Valid @RequestBody CreateBookRequest body) {}`],
    ["Global error handler", `@RestControllerAdvice\nclass ApiErrors {\n  @ExceptionHandler(BookNotFoundException.class)\n  ResponseEntity<ApiError> notFound(Exception error) {}\n}`]
  ],
  "Headers, media types & content negotiation": [
    ["Header", `String token = request.getHeader("Authorization");`],
    ["Media type", `@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)`],
    ["Content negotiation", `@GetMapping(produces = {\n  MediaType.APPLICATION_JSON_VALUE,\n  MediaType.APPLICATION_XML_VALUE\n})`]
  ],
  "Idempotency & safe retries": [
    ["Idempotent PUT", `PUT /api/books/42\n{ "title": "Clean Code" }`],
    ["Idempotency key", `Idempotency-Key: order-7-payment-1`]
  ],
  "Pagination, filtering & sorting": [
    ["Pagination", `GET /api/books?page=0&size=20`],
    ["Filtering", `GET /api/books?author=Bloch`],
    ["Sort parameter", `GET /api/books?sort=title,asc`]
  ],
  "Authentication, authorization & CORS": [
    ["Authentication", `Authorization: Bearer <access-token>`],
    ["Authorization", `@PreAuthorize("hasRole('ADMIN')")\n@DeleteMapping("/{id}")`],
    ["CORS", `@CrossOrigin(origins = "https://app.example.com")`]
  ],
  "Testing with Postman & MockMvc": [
    ["Postman", `GET http://localhost:8080/api/books/42\nAccept: application/json`],
    ["MockMvc", `mockMvc.perform(get("/api/books/42"))\n  .andExpect(status().isOk())\n  .andExpect(jsonPath("$.id").value(42));`]
  ],
  "Session & SessionFactory": [
    ["SessionFactory", `SessionFactory factory = configuration.buildSessionFactory();`],
    ["Session", `try (Session session = factory.openSession()) {\n  session.persist(user);\n}`]
  ],
  "Annotations vs XML mapping": [
    ["Annotation mapping", `@Entity\n@Table(name = "users")\nclass User {}`],
    ["XML mapping", `<class name="User" table="users">\n  <id name="id"/>\n</class>`]
  ],
  "Maven POM & lifecycle": [
    ["POM", `<project>\n  <artifactId>java-app</artifactId>\n</project>`],
    ["Lifecycle", `mvn test\nmvn package\nmvn install`]
  ],
  "Maven goals & plugins": [
    ["Goal", `mvn compiler:compile`],
    ["Plugin", `<plugin>\n  <artifactId>maven-surefire-plugin</artifactId>\n</plugin>`]
  ],
  "Gradle tasks & dependencies": [
    ["Task", `tasks.register("hello") {\n  doLast { println("Hello") }\n}`],
    ["Dependency", `dependencies {\n  testImplementation("org.junit.jupiter:junit-jupiter:5.11.0")\n}`]
  ],
  "Build & release process": [
    ["Build", `clean -> compile -> test -> package`],
    ["Release", `version -> publish artifact -> deploy`]
  ],
  "Memory management & tuning": [
    ["Memory management", `jcmd <pid> GC.heap_info`],
    ["Tuning", `java -Xms512m -Xmx2g -XX:+UseG1GC App`]
  ],
  "JUnit assertions & annotations": [
    ["Assertion", `assertEquals(4, calculator.add(2, 2));`],
    ["Annotation", `@BeforeEach\nvoid setUp() {}\n\n@Test\nvoid adds() {}`]
  ],
  "Test cases & suites": [
    ["Test case", `@Test\nvoid rejectsEmptyName() {}`],
    ["Test suite", `@Suite\n@SelectClasses({UserTest.class, OrderTest.class})`]
  ],
  "Mockito mocking & stubbing": [
    ["Mocking", `UserRepo repo = mock(UserRepo.class);`],
    ["Stubbing", `when(repo.findById(1L)).thenReturn(Optional.of(user));`]
  ],
  "Built-in & custom annotations": [
    ["Built-in", `@Override\npublic String toString() { return name; }`],
    ["Custom", `@Retention(RetentionPolicy.RUNTIME)\n@interface Audited {}`]
  ],
  "URL & URLConnection": [
    ["URL", `URL url = new URL("https://example.com/data");`],
    ["URLConnection", `URLConnection connection = url.openConnection();\nInputStream input = connection.getInputStream();`]
  ],
  "TCP/IP sockets": [
    ["IP address", `InetAddress host = InetAddress.getByName("localhost");`],
    ["TCP socket", `Socket socket = new Socket(host, 8080);`]
  ],
  "ServerSocket & Socket": [
    ["ServerSocket", `ServerSocket server = new ServerSocket(8080);`],
    ["Client Socket", `Socket client = server.accept();`]
  ],
  "IntelliJ IDEA / Eclipse": [
    ["IntelliJ IDEA", `Run > Debug 'App'  // set a breakpoint first`],
    ["Eclipse", `Run > Debug As > Java Application`]
  ],
  "Git & GitHub": [
    ["Git", `git add .\ngit commit -m "Add lesson"`],
    ["GitHub", `git push origin main`]
  ],
  "Stacks & queues": [
    ["Stack", `Deque<Integer> stack = new ArrayDeque<>();\nstack.push(1);\nint top = stack.pop();`],
    ["Queue", `Queue<Integer> queue = new ArrayDeque<>();\nqueue.offer(1);\nint first = queue.poll();`]
  ],
  "Binary trees & BST": [
    ["Binary tree", `node.left = new Node(4);\nnode.right = new Node(9);`],
    ["Binary search tree", `if (value < node.value) insert(node.left, value);\nelse insert(node.right, value);`]
  ],
  "Searching & sorting": [
    ["Searching", `int index = Arrays.binarySearch(nums, target);`],
    ["Sorting", `Arrays.sort(nums);`]
  ],
  "Recursion & backtracking": [
    ["Recursion", `int factorial(int n) {\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}`],
    ["Backtracking", `choose(option);\nsearch();\nunchoose(option);`]
  ]
};

const javaExampleComments = {
  "Predicate": "test(20) checks the rule and returns true because 20 is at least 18.",
  "Function": "apply() converts the Java text into its integer character count.",
  "Consumer": "accept() passes Hello to the print action and returns no result.",
  "Supplier": "get() creates and returns a new random UUID whenever it is called.",
  "Intermediate operation": "filter and map describe lazy transformations; no items move until a terminal operation runs.",
  "Terminal operation": "collect triggers the pipeline and gathers its final strings into a list.",
  "Collecting": "Transforms every user to a name and gathers those names into a new list.",
  "Grouping": "Builds a map where each customer name points to that customer's orders.",
  "Partitioning": "Splits the numbers into exactly two lists: even values under true and odd values under false.",
  "supplyAsync": "Runs loadUser asynchronously and completes the future with the returned User.",
  "thenApply": "Transforms the future User into its name after the user becomes available.",
  "thenCombine": "Waits for both futures, then combines their results into one UserSummary.",
  "Resource URL": "Uses a plural noun for the books collection and 42 to identify one book.",
  "Nested resource": "Requests the books that belong specifically to author 7.",
  "GET": "Maps a read request to service.find(id) and returns the matching book without changing it.",
  "POST": "Creates a new book from the request body and returns it with status 201.",
  "PUT": "Replaces the complete book at this id, so omitted replaceable fields should not silently remain.",
  "PATCH": "Applies only the supplied changes while leaving the book's other fields untouched.",
  "DELETE": "Removes the selected book and returns 204 because no response body is needed.",
  "RestController": "Marks the class as an HTTP controller whose returned objects are written as response data.",
  "Controller base path": "Prefixes every endpoint in this controller with /api/books.",
  "Path variable": "Reads the id value directly from the matching part of the request URL.",
  "Query parameter": "Reads an optional author filter from the URL after the question mark.",
  "Request body": "Deserializes the incoming JSON body into a purpose-built CreateBookRequest.",
  "JSON": "Represents a book request as text with named title and author properties.",
  "DTO": "Defines the two accepted input fields and requires both to contain text.",
  "200 OK": "Returns the requested book with the standard success status.",
  "201 Created": "Returns the new book and a Location header pointing to its URL.",
  "204 No Content": "Confirms success without sending a response body, commonly after deletion.",
  "404 Not Found": "Tells the client that the requested resource does not exist.",
  "Validation": "Runs the DTO's validation annotations before the controller method continues.",
  "Global error handler": "Catches one exception type centrally and converts it into a consistent API error response.",
  "Header": "Reads the Authorization metadata sent with the request.",
  "Media type": "Accepts this endpoint only when the request body is JSON.",
  "Content negotiation": "Lets the client's Accept header choose JSON or XML for the response.",
  "Idempotent PUT": "Repeating this same replacement leaves book 42 in the same final state.",
  "Idempotency key": "Lets the server recognize a retried payment request instead of charging twice.",
  "Pagination": "Requests the first page with no more than 20 books.",
  "Filtering": "Returns only books whose author matches Bloch.",
  "Sort parameter": "Requests books ordered by title from A to Z.",
  "Authentication": "Sends a bearer token so the server can identify the caller.",
  "Authorization": "Allows the delete method only when the authenticated caller has the ADMIN role.",
  "CORS": "Allows browser requests to this API only from the named front-end origin.",
  "Postman": "Manually sends a GET request and asks the server to respond with JSON.",
  "MockMvc": "Automates the GET request and checks both its status and returned JSON id.",
  "Abstract class": "Declares a base type that cannot be created directly and requires children to provide area().",
  "Annotation": "Runs setUp() before each method marked with @Test.",
  "Annotation mapping": "Maps the User class to the users database table with Java annotations.",
  "Array": "Creates three integers and reads the first value using index 0.",
  "ArrayDeque": "addFirst() inserts urgent at the front, ahead of every existing item.",
  "ArrayList": "Creates a resizable list and appends Mira to its end with add().",
  "Assertion": "Passes only when add(2, 2) actually returns the expected value 4.",
  "Automatic promotion": "Java widens count from int to double before adding 2.5.",
  "Backtracking": "Makes a choice, explores it, then undoes it before trying another choice.",
  "Bean": "Registers EmailService as an object managed by the Spring container.",
  "Binary search tree": "Sends smaller values left and larger-or-equal values right.",
  "Binary tree": "Connects two new child nodes to the current node.",
  "Buffer": "Reserves 1 KB of memory, then copies channel bytes into that memory.",
  "Build": "Cleans old output, compiles code, runs tests, and creates the package.",
  "Built-in": "Tells Java that this method intentionally replaces a parent method.",
  "Channel": "Opens a file channel that can read bytes from the given path.",
  "Class": "Defines the Car blueprint with one color field.",
  "Client Socket": "accept() pauses until a client connects, then returns that client's socket.",
  "Comment": "Documents intent for people; the compiler skips the whole line.",
  "Comparable": "Defines the default order for User objects by comparing their names.",
  "Comparator": "Sorts users by score without changing User's natural ordering.",
  "Compile-time": "The compiler picks the matching overload from the argument type.",
  "Configuration": "Declares setup that tells the framework how to register or create this component.",
  "Constant": "final allows PI to be assigned once and prevents later reassignment.",
  "Custom": "Creates an @Audited annotation that remains available while the program runs.",
  "Date": "Gets today's calendar date without a time-of-day value.",
  "Date + time": "Gets the current local date and time together, without a timezone.",
  "Decision": "Runs the print statement only when score is at least 60.",
  "Declaration": "Adds a visits field to the servlet class generated from the JSP.",
  "Default constructor": "Creates a User with Guest when no name argument is supplied.",
  "Default method": "Gives every implementing class a ready-made log() behavior.",
  "Dependency": "Adds JUnit to the test classpath without packaging it as production code.",
  "Eclipse": "Starts the selected Java class with Eclipse's debugger attached.",
  "Explicit cast": "Drops the decimal portion by deliberately converting double to int.",
  "Expression": "Evaluates getName() and writes its returned value into the HTML response.",
  "Filter": "Passes the current request and response to the next filter or servlet.",
  "Git": "Stages current changes and saves them as a named local history snapshot.",
  "GitHub": "Uploads the local main branch commits to the remote GitHub repository.",
  "Goal": "Runs only the compile goal supplied by Maven's compiler plugin.",
  "HashMap": "put() stores score 92 under the key Ana for fast key-based lookup.",
  "HashSet": "add(7) stores 7 once; adding 7 again would not create a duplicate.",
  "IP address": "Resolves localhost into an InetAddress the networking API can use.",
  "Identifier": "playerScore is a readable name chosen by the developer for this value.",
  "IntelliJ IDEA": "Pauses at your breakpoint so you can inspect variables step by step.",
  "Interface": "Requires implementing classes to provide their own pay() method.",
  "IoC injection": "Spring supplies OrderRepo when it constructs OrderService.",
  "Iterator": "hasNext() checks for another item and next() returns that item.",
  "Keyword": "int is a reserved Java word that declares a whole-number variable.",
  "Lifecycle": "Shows the framework-controlled order: start, handle work, then clean up.",
  "LinkedHashMap": "Creates a map that remembers the order in which keys are inserted.",
  "LinkedHashSet": "Creates a unique-value set that preserves insertion order.",
  "LinkedList": "addLast() attaches task to the tail of the linked list.",
  "ListIterator": "Moves one position backward and returns the previous list item.",
  "Listener": "Registers code that receives web-application lifecycle events.",
  "Loop": "Repeats the body for i values 0, 1, and 2, then stops.",
  "Memory management": "Prints the running JVM's current heap and garbage-collection information.",
  "Method": "Receives n, doubles it, and returns the calculated value.",
  "Mocking": "Creates a fake UserRepo so a test does not need the real database.",
  "ModelAndView": "Chooses the users view and exposes the users list under the name items.",
  "Non-primitive": "Creates object-based values that provide fields, methods, or multiple elements.",
  "Object": "Creates one Car instance and gives that specific object a red color.",
  "ObjectInputStream": "readObject() rebuilds the next serialized object and casts it to User.",
  "ObjectOutputStream": "writeObject() converts user into bytes and sends them to the stream.",
  "Overloading": "Defines two pay methods; Java selects one from the parameter type.",
  "Overriding": "Replaces Animal's speak() behavior specifically for Dog objects.",
  "POM": "Identifies this Maven project artifact as java-app.",
  "Package": "Places the class inside the com.acme.orders namespace.",
  "Parameterized constructor": "Receives a name and stores it in the new User object.",
  "Path": "Represents notes.txt and reads all of its text into one String.",
  "Plugin": "Configures Maven Surefire, the plugin responsible for running tests.",
  "PreparedStatement": "Uses a ? placeholder, then safely binds id as parameter number 1.",
  "Primitive": "Stores simple values directly: one integer and one true/false flag.",
  "PriorityQueue": "offer(2) inserts 2; the queue later removes integers in priority order, smallest first by default.",
  "Process": "Starts a separate operating-system process that runs the Worker Java class.",
  "Queue": "offer() adds 1 at the back; poll() removes and returns the front item.",
  "Recursion": "Calls the same method with a smaller n until it reaches the base case.",
  "Release": "Assigns a version, publishes the artifact, then deploys it for use.",
  "RequestMapping": "Routes GET requests for /users to the annotated controller method.",
  "Runnable": "Describes a task with a lambda, then runs it on a new thread.",
  "Runtime": "Although the variable is Animal, Java calls Dog's method because the object is a Dog.",
  "Searching": "Returns the target's index in an already sorted array, or a negative result when absent.",
  "Selector": "Registers interest in read-ready events so one thread can monitor many channels.",
  "Serialization": "Marks User as eligible to be converted into a byte stream.",
  "ServerSocket": "Opens TCP port 8080 and waits for incoming client connections.",
  "Session": "Opens a short-lived Hibernate session and schedules user for insertion.",
  "SessionFactory": "Builds the expensive shared factory used to create Hibernate sessions.",
  "Sorting": "Rearranges nums into ascending order in the same array.",
  "Spring Core": "Starts Spring's container using annotation-based application configuration.",
  "Stack": "push() places an item on top; pop() later removes the most recently pushed item.",
  "Statement": "Runs fixed SQL directly; use it only when no user-provided values enter the query.",
  "Static method": "Lets callers use MathTools.doubleIt() without creating an object.",
  "String": "Creates text and asks the String object how many characters it contains.",
  "Structure": "Defines the class and the main entry point where a Java application begins.",
  "Stubbing": "Programs the mock to return user whenever findById(1L) is called.",
  "Syntax": "Declares an integer and stores the result of adding 2 and 3.",
  "TCP socket": "Opens a reliable TCP connection to the host on port 8080.",
  "Task": "Defines a reusable Gradle task whose action prints Hello.",
  "Test case": "Defines one focused test for rejecting an empty name.",
  "Test suite": "Groups UserTest and OrderTest so they run together.",
  "Thread": "Creates an independent execution path and starts its work.",
  "Thread class": "Defines thread behavior by placing the work inside run().",
  "Time": "Gets the current local clock time without a date.",
  "TreeMap": "Creates a map that automatically keeps its keys sorted.",
  "TreeSet": "Creates a unique-value set that automatically keeps values sorted.",
  "Tuning": "Starts the JVM with a 512 MB initial heap, 2 GB maximum heap, and G1 collector.",
  "URL": "Parses the address into a structured Java URL object.",
  "URLConnection": "Opens the URL connection and obtains a stream for reading its response bytes.",
  "Varargs": "Accepts any number of int arguments and returns their total.",
  "Variable": "Reassigns attempts from 1 to 2, which normal variables allow.",
  "Vector": "Creates the older synchronized list type and appends one item.",
  "XML mapping": "Maps User to the users table and its id property outside Java code.",
  "default": "Leaves off a modifier so the field is accessible only inside its package.",
  "notify": "Wakes one thread that is waiting on the same lock object.",
  "notifyAll": "Wakes every thread waiting on the same lock so each can recheck its condition.",
  "private": "Restricts balance access to code inside the declaring class.",
  "protected": "Allows save() access from the package and from subclasses.",
  "public": "Makes Order accessible from code in any package.",
  "wait": "Releases the lock and pauses this thread until another thread signals it."
};

const javaStageLabels = {
  foundation: "Foundation",
  core: "Core Java",
  backend: "Backend",
  advanced: "Advanced"
};

const javaOfficialDocs = [
  "https://docs.oracle.com/en/java/javase/21/language/",
  "https://docs.oracle.com/javase/tutorial/java/concepts/",
  "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/package-summary.html",
  "https://docs.oracle.com/javase/tutorial/essential/concurrency/",
  "https://docs.oracle.com/en/java/javase/21/core/java-io.html",
  "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/function/package-summary.html",
  "https://docs.oracle.com/javase/tutorial/jdbc/basics/",
  "https://jakarta.ee/specifications/platform/",
  "https://docs.spring.io/spring-boot/reference/",
  "https://hibernate.org/orm/documentation/",
  "https://docs.oracle.com/en/java/javase/21/docs/specs/man/jar.html",
  "https://docs.oracle.com/en/java/javase/21/vm/java-virtual-machine-technology-overview.html",
  "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/class-use/AssertionError.html",
  "https://docs.oracle.com/en/java/javase/21/language/",
  "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/net/package-summary.html",
  "https://docs.oracle.com/en/java/javase/21/docs/specs/man/javac.html",
  "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/package-summary.html",
  "https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/package-summary.html"
];

javaModules.forEach((module, index) => {
  module.officialUrl = javaOfficialDocs[index];
  module.officialLabel = index === 7 ? "Jakarta EE specification" : index === 8 ? "Spring Boot reference" : index === 9 ? "Hibernate ORM documentation" : "Oracle Java documentation";
});

const aiPathCourseKey = location.pathname === "/ai/rag"
  ? "rag"
  : location.pathname === "/ai/agents"
    ? "agentic-ai"
    : location.pathname === "/ai/generative-ai"
      ? "generative-ai"
      : null;
const suppliedCourse = (aiPathCourseKey && window.QUICKDEV_AI_COURSES?.[aiPathCourseKey]) || window.QUICKDEV_COURSE;
const courseConfig = suppliedCourse || {
  key: "java",
  name: "Java",
  modules: javaModules,
  quickNotes: javaQuickNotes,
  groupedExamples: javaGroupedExamples,
  exampleComments: javaExampleComments,
  stageLabels: javaStageLabels,
  fallbackNote: "A key Java concept worth understanding before you move to the next module.",
  fallbackCode: "// Try this concept in a small Java program."
};
const modules = courseConfig.modules;
const quickNotes = courseConfig.quickNotes;
const groupedExamples = courseConfig.groupedExamples || {};
const exampleComments = courseConfig.exampleComments || {};
const stageLabels = courseConfig.stageLabels;
const courseQuery = `?course=${encodeURIComponent(courseConfig.key)}`;

const cardThemes = [
  { accent: "#e65e39", soft: "rgba(230,94,57,.10)", bg: "#fbf4ea", edge: "#ddcdbd" },
  { accent: "#2458a6", soft: "rgba(36,88,166,.10)", bg: "#f2f5f7", edge: "#cbd5df" },
  { accent: "#3f7554", soft: "rgba(63,117,84,.10)", bg: "#f2f6ef", edge: "#cbd8c6" },
  { accent: "#a7608b", soft: "rgba(167,96,139,.10)", bg: "#f8f1f5", edge: "#ddcad5" }
];

const grid = document.querySelector("#moduleGrid");
const searchInput = document.querySelector("#searchInput");
const filterGroup = document.querySelector("#filterGroup");
const emptyState = document.querySelector("#emptyState");
const clearSearch = document.querySelector("#clearSearch");
const dialog = document.querySelector("#lessonDialog");
const closeDialog = document.querySelector("#dialogClose");
const completeButton = document.querySelector("#completeButton");
const resumeButton = document.querySelector("#resumeButton");
const progressButton = document.querySelector("#progressButton");
const toast = document.querySelector("#toast");
const authDialog = document.querySelector("#authDialog");
const authButton = document.querySelector("#authButton");
const authClose = document.querySelector("#authClose");
const authForm = document.querySelector("#authForm");
const authSubmit = document.querySelector("#authSubmit");
const authSwitchButton = document.querySelector("#authSwitchButton");
const userMenu = document.querySelector("#userMenu");
const logoutButton = document.querySelector("#logoutButton");
const accountSettingsButton = document.querySelector("#accountSettingsButton");
const accountDialog = document.querySelector("#accountDialog");
const accountClose = document.querySelector("#accountClose");
const profileForm = document.querySelector("#profileForm");
const deleteAccountForm = document.querySelector("#deleteAccountForm");
const certificateMenuButton = document.querySelector("#certificateMenuButton");
const certificateDialog = document.querySelector("#certificateDialog");
const certificateClose = document.querySelector("#certificateClose");
const certificateCopyButton = document.querySelector("#certificateCopyButton");
const certificateClaimButton = document.querySelector("#certificateClaimButton");
const certificateUnpublishButton = document.querySelector("#certificateUnpublishButton");
const certificateSaveNameButton = document.querySelector("#certificateSaveNameButton");
const certificatePublicName = document.querySelector("#certificatePublicName");
const certificateConsent = document.querySelector("#certificateConsent");

let activeFilter = "all";
let activeModuleId = null;
let completed = new Set();
let currentUser = null;
let currentCertificate = null;
let certificateEligible = false;
let certificateConsentVersion = null;
let authMode = "login";
let isSavingProgress = false;
let toastTimer;

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || "Something went wrong. Please try again.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

function moduleSearchText(module) {
  return [module.title, module.shortTitle, module.description, ...module.topics].join(" ").toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || courseConfig.name.slice(0, 1).toUpperCase();
}

function applyCourseUI() {
  document.documentElement.dataset.course = courseConfig.key;
  document.querySelectorAll("[data-course-name]").forEach((element) => { element.textContent = courseConfig.name; });
  document.querySelectorAll("[data-course-module-count]").forEach((element) => { element.textContent = modules.length; });
  const conceptCount = modules.reduce((total, module) => total + module.topics.length, 0);
  document.querySelectorAll("[data-course-concept-count]").forEach((element) => { element.textContent = conceptCount; });
  document.querySelectorAll("[data-course-mark]").forEach((element) => { element.textContent = courseConfig.mark || courseConfig.name[0]; });
  if (courseConfig.pageTitle) document.title = courseConfig.pageTitle;
  if (courseConfig.pageDescription) document.querySelector('meta[name="description"]')?.setAttribute("content", courseConfig.pageDescription);
  if (courseConfig.heroEyebrow) document.querySelector(".hero-copy .eyebrow").innerHTML = `<span></span> ${courseConfig.heroEyebrow}`;
  if (courseConfig.heroTitle) document.querySelector(".hero-copy h1").innerHTML = courseConfig.heroTitle;
  if (courseConfig.heroLede) document.querySelector(".hero-lede").textContent = courseConfig.heroLede;
  if (courseConfig.previewLabel) document.querySelector(".card-topline > span:last-child").textContent = courseConfig.previewLabel;
  if (courseConfig.previewCode) document.querySelector(".code-preview").innerHTML = courseConfig.previewCode;
  if (courseConfig.chipOne) document.querySelector(".chip-one").textContent = courseConfig.chipOne;
  if (courseConfig.chipTwo) document.querySelector(".chip-two").textContent = courseConfig.chipTwo;
  if (courseConfig.curriculumTitle) document.querySelector(".section-heading h2").textContent = courseConfig.curriculumTitle;
  if (courseConfig.curriculumLede) document.querySelector(".section-heading > div > p:last-child").textContent = courseConfig.curriculumLede;
  if (courseConfig.searchPlaceholder) searchInput.placeholder = courseConfig.searchPlaceholder;
  document.querySelector(".cup-body span").textContent = courseConfig.mark || courseConfig.name[0];
  document.querySelector(".achievement-medal span").textContent = courseConfig.mark || courseConfig.name[0];
  document.querySelector(".preview-mark").textContent = courseConfig.mark || courseConfig.name[0];
  document.querySelector(".auth-brand-mark").textContent = "Q";
  if (courseConfig.certificateTitleHtml) document.querySelector(".certificate-preview-card > p").innerHTML = courseConfig.certificateTitleHtml;
  if (courseConfig.completionNoun) {
    document.querySelector("#certificateLearnerName").parentElement.innerHTML = `<strong id="certificateLearnerName">${escapeHtml(courseConfig.completionNoun)}</strong>, you completed the entire QuickDevBase ${escapeHtml(courseConfig.name)} path. That took consistency, curiosity, and a lot of tiny wins.`;
  }
  if (courseConfig.trademark) document.querySelector(".footer-copy small").textContent = courseConfig.trademark;
  if (courseConfig.hubPath) {
    const libraryLink = document.querySelector('.main-nav a[href="/"]');
    if (libraryLink) {
      libraryLink.href = courseConfig.hubPath;
      libraryLink.textContent = courseConfig.hubLabel || "Path hub";
    }
  }
  filterGroup.innerHTML = [
    '<button class="filter active" type="button" data-filter="all">All <span>' + modules.length + '</span></button>',
    ...Object.entries(stageLabels).map(([key, label]) =>
      '<button class="filter" type="button" data-filter="' + escapeHtml(key) + '">' + escapeHtml(label) + '</button>'
    )
  ].join("");
}

function setAuthMode(mode) {
  authMode = mode === "register" ? "register" : "login";
  const registering = authMode === "register";
  const nameField = document.querySelector("#nameField");
  const nameInput = document.querySelector("#authName");
  const passwordInput = document.querySelector("#authPassword");

  document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
    const selected = tab.dataset.authMode === authMode;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  nameField.hidden = !registering;
  nameInput.required = registering;
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  document.querySelector("#authTitle").textContent = registering ? "Create your account" : "Welcome back";
  document.querySelector("#authSubtitle").textContent = registering
    ? `Save every completed ${courseConfig.name} module to your QuickDevBase profile.`
    : `Sign in to continue your ${courseConfig.name} path from any device.`;
  document.querySelector("#authSubmitText").textContent = registering ? "Create account" : "Sign in";
  document.querySelector("#authSwitchText").textContent = registering ? "Already have an account?" : "New to QuickDevBase?";
  authSwitchButton.textContent = registering ? "Sign in instead" : "Create an account";
  document.querySelector("#authError").hidden = true;
}

function openAuth(mode = "login", message = "") {
  if (dialog.open) closeLesson();
  userMenu.hidden = true;
  authButton.setAttribute("aria-expanded", "false");
  authForm.reset();
  setAuthMode(mode);
  if (message) document.querySelector("#authSubtitle").textContent = message;
  authDialog.showModal();
  document.body.classList.add("dialog-open");
  requestAnimationFrame(() => document.querySelector(registeringSelector()).focus());
}

function registeringSelector() {
  return authMode === "register" ? "#authName" : "#authEmail";
}

function closeAuth() {
  authDialog.close();
  document.body.classList.remove("dialog-open");
}

function updateAuthUI() {
  const loggedIn = Boolean(currentUser);
  authButton.classList.toggle("is-user", loggedIn);
  authButton.setAttribute("aria-label", loggedIn ? `Open account menu for ${currentUser.name}` : "Sign in or create an account");
  document.querySelector("#authAvatar").textContent = loggedIn ? initials(currentUser.name) : "→";
  document.querySelector("#authLabel").textContent = loggedIn ? currentUser.name.split(" ")[0] : "Sign in";
  document.querySelector("#headerProgressCaption").textContent = currentCertificate?.isPublic
    ? "Certificate published"
    : certificateEligible
      ? currentCertificate ? "Certificate private" : "Certificate ready"
      : loggedIn ? "Synced progress" : "Sign in to save";
  document.querySelector("#progressOwnerLabel").textContent = loggedIn ? `${currentUser.name}'s course progress` : "Sign in to save your progress";
  certificateMenuButton.hidden = !certificateEligible;
  document.querySelector("#certificateMenuLabel").textContent = currentCertificate?.isPublic
    ? "View certificate"
    : currentCertificate ? "Republish certificate" : "Claim certificate";

  if (loggedIn) {
    document.querySelector("#userMenuName").textContent = currentUser.name;
    document.querySelector("#userMenuEmail").textContent = currentUser.email;
  } else {
    userMenu.hidden = true;
    authButton.setAttribute("aria-expanded", "false");
  }
}

async function loadUserProgress() {
  if (!currentUser) {
    completed = new Set();
    return;
  }
  const data = await apiRequest(`/api/progress${courseQuery}`);
  completed = new Set(data.completed);
}

async function loadCertificate() {
  if (!currentUser) {
    currentCertificate = null;
    certificateEligible = false;
    certificateConsentVersion = null;
    return null;
  }

  const status = await apiRequest(`/api/certificate${courseQuery}`);
  currentCertificate = status.certificate;
  certificateEligible = status.eligible;
  certificateConsentVersion = status.consentVersion;
  return status;
}

function showCertificateCelebration(certificate = currentCertificate) {
  if (!certificateEligible) return;
  if (certificate) currentCertificate = certificate;
  if (dialog.open) closeLesson();
  if (authDialog.open) closeAuth();
  if (accountDialog.open) closeAccountSettings();
  userMenu.hidden = true;
  authButton.setAttribute("aria-expanded", "false");

  const publicName = currentCertificate?.name || currentUser.name;
  const isPublic = Boolean(currentCertificate?.isPublic);
  document.querySelector("#certificateLearnerName").textContent = publicName;
  document.querySelector("#certificatePreviewName").textContent = publicName;
  certificatePublicName.value = publicName;
  document.querySelector("#certificateCredentialId").textContent = currentCertificate?.credentialId || "Issued after consent";
  document.querySelector("#certificateStatusPill").textContent = isPublic ? "PUBLIC" : "PRIVATE";
  document.querySelector("#certificateClaimPanel").hidden = isPublic;
  document.querySelector("#certificatePublishedPanel").hidden = !isPublic;
  document.querySelector("#certificateError").hidden = true;
  certificateConsent.checked = false;
  certificateClaimButton.innerHTML = `${currentCertificate ? "Republish" : "Claim &amp; publish"} certificate <span aria-hidden="true">↗</span>`;

  if (isPublic) {
    document.querySelector("#certificateViewLink").href = currentCertificate.shareUrl;
    document.querySelector("#certificateLinkedInLink").href = currentCertificate.linkedInShareUrl;
  }
  if (!certificateDialog.open) certificateDialog.showModal();
  document.body.classList.add("dialog-open");
  updateAuthUI();
}

function closeCertificateCelebration() {
  certificateDialog.close();
  document.body.classList.remove("dialog-open");
}

async function copyPublicCertificateLink() {
  if (!currentCertificate?.isPublic) return;
  try {
    await navigator.clipboard.writeText(currentCertificate.shareUrl);
  } catch {
    const input = document.createElement("textarea");
    input.value = currentCertificate.shareUrl;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  showToastMessage("Certificate link copied", "Anyone with the link can verify your achievement.", "◆");
}

async function saveDisplayName(name) {
  const data = await apiRequest("/api/profile", {
    method: "PATCH",
    body: JSON.stringify({ name })
  });
  currentUser = data.user;
  if (currentCertificate) currentCertificate = { ...currentCertificate, name: currentUser.name };
  updateAuthUI();
  document.querySelector("#certificateLearnerName").textContent = currentUser.name;
  document.querySelector("#certificatePreviewName").textContent = currentUser.name;
  certificatePublicName.value = currentUser.name;
  return data.user;
}

async function claimCertificate() {
  const errorBox = document.querySelector("#certificateError");
  const publicName = certificatePublicName.value.trim();
  errorBox.hidden = true;

  if (!certificatePublicName.reportValidity()) return;
  if (!certificateConsent.checked) {
    errorBox.textContent = "Check the consent box before publishing your certificate.";
    errorBox.hidden = false;
    return;
  }

  certificateClaimButton.disabled = true;
  certificateClaimButton.textContent = "Publishing safely...";
  try {
    const data = await apiRequest(`/api/certificate/claim${courseQuery}`, {
      method: "POST",
      body: JSON.stringify({
        consent: true,
        consentVersion: certificateConsentVersion,
        publicName
      })
    });
    currentUser = data.user;
    currentCertificate = data.certificate;
    certificateEligible = true;
    showCertificateCelebration(currentCertificate);
    showToastMessage(
      data.newlyIssued ? "Certificate earned" : "Certificate republished",
      "Public verification is active and your email remains private.",
      "◆"
    );
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  } finally {
    certificateClaimButton.disabled = false;
    certificateClaimButton.innerHTML = `${currentCertificate ? "Republish" : "Claim &amp; publish"} certificate <span aria-hidden="true">↗</span>`;
  }
}

async function unpublishCertificate() {
  if (!currentCertificate?.isPublic) return;
  const confirmed = window.confirm("Make this certificate private? Its public link will stop working until you republish it.");
  if (!confirmed) return;

  certificateUnpublishButton.disabled = true;
  try {
    const data = await apiRequest(`/api/certificate/publication${courseQuery}`, { method: "DELETE" });
    currentCertificate = data.certificate;
    showCertificateCelebration(currentCertificate);
    showToastMessage("Certificate is private", "The public verification link is now disabled.", "◇");
  } catch (error) {
    showToastMessage("Privacy update failed", error.message, "!");
  } finally {
    certificateUnpublishButton.disabled = false;
  }
}

async function saveCertificateName() {
  if (!certificatePublicName.reportValidity()) return;
  certificateSaveNameButton.disabled = true;
  try {
    await saveDisplayName(certificatePublicName.value.trim());
    showToastMessage("Certificate name updated", "The public verification page now shows the corrected name.");
  } catch (error) {
    showToastMessage("Name not updated", error.message, "!");
  } finally {
    certificateSaveNameButton.disabled = false;
  }
}

function openAccountSettings() {
  if (!currentUser) return;
  userMenu.hidden = true;
  authButton.setAttribute("aria-expanded", "false");
  document.querySelector("#profileName").value = currentUser.name;
  document.querySelector("#profileMessage").hidden = true;
  deleteAccountForm.reset();
  document.querySelector("#deleteAccountError").hidden = true;
  accountDialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeAccountSettings() {
  accountDialog.close();
  document.body.classList.remove("dialog-open");
}

async function initializeSession() {
  try {
    const data = await apiRequest("/api/auth/me");
    currentUser = data.user;
    await loadUserProgress();
    await loadCertificate();
  } catch (error) {
    currentUser = null;
    completed = new Set();
    currentCertificate = null;
    showToastMessage("Offline progress unavailable", "Sign in will be available when the server reconnects.", "!");
  } finally {
    updateAuthUI();
    updateProgress();
    renderModules();
  }
}

function conceptLessons(module) {
  const notes = quickNotes[module.id] || [];

  return module.topics.map((topic, index) => {
    const [plain, code] = notes[index] || [
      courseConfig.fallbackNote,
      courseConfig.fallbackCode
    ];
    const examples = groupedExamples[topic] || [["Example", code]];

    return `
      <details class="concept-item" ${index === 0 ? "open" : ""}>
        <summary>
          <span class="concept-index">${formatNumber(index + 1)}</span>
          <span class="concept-copy">
            <strong>${escapeHtml(topic)}</strong>
            <small>${escapeHtml(plain)}</small>
          </span>
          <span class="concept-chevron" aria-hidden="true">+</span>
        </summary>
        <div class="concept-example">
          <span>${examples.length > 1 ? "tiny examples for each" : "tiny example"}</span>
          <div class="concept-snippet-grid">
            ${examples.map(([label, snippet]) => `
              <section class="concept-snippet">
                <strong>${escapeHtml(label)}</strong>
                <p class="snippet-comment"><span aria-hidden="true">//</span> ${escapeHtml(exampleComments[label] || plain)}</p>
                <pre><code>${escapeHtml(snippet)}</code></pre>
              </section>
            `).join("")}
          </div>
        </div>
      </details>
    `;
  }).join("");
}

function moduleCard(module) {
  const theme = cardThemes[(module.id - 1) % cardThemes.length];
  const isComplete = completed.has(module.id);
  const previewTopics = module.topics.slice(0, 3);
  const remaining = module.topics.length - previewTopics.length;

  return `
    <article
      class="module-card${isComplete ? " is-complete" : ""}"
      style="--card-accent:${theme.accent};--card-accent-soft:${theme.soft};--card-bg:${theme.bg};--card-edge:${theme.edge}"
      data-module-id="${module.id}"
      data-testid="module-${module.id}"
      role="button"
      tabindex="0"
      aria-label="Open module ${module.id}: ${module.title}"
    >
      <div class="module-top">
        <span class="module-number">${isComplete ? "✓" : formatNumber(module.id)}</span>
        <span class="module-state"><i></i>${isComplete ? "Complete" : stageLabels[module.stage]}</span>
      </div>
      <h3>${module.shortTitle || module.title}</h3>
      <p>${module.description}</p>
      <div class="topic-preview">
        ${previewTopics.map((topic) => `<span>${topic}</span>`).join("")}
        ${remaining > 0 ? `<span>+${remaining} more</span>` : ""}
      </div>
      <div class="module-footer">
        <span>${module.topics.length} concepts</span>
        <span>${isComplete ? "Review module ↗" : "Explore module ↗"}</span>
      </div>
    </article>
  `;
}

function renderModules() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = modules.filter((module) => {
    const matchesStage = activeFilter === "all" || module.stage === activeFilter;
    const matchesQuery = !query || moduleSearchText(module).includes(query);
    return matchesStage && matchesQuery;
  });

  grid.innerHTML = filtered.map(moduleCard).join("");
  emptyState.hidden = filtered.length > 0;
  grid.hidden = filtered.length === 0;

  grid.querySelectorAll(".module-card").forEach((card) => {
    card.addEventListener("click", () => openModule(Number(card.dataset.moduleId)));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModule(Number(card.dataset.moduleId));
      }
    });
  });
}

function updateProgress() {
  const count = completed.size;
  const percent = Math.round((count / modules.length) * 100);
  document.querySelector("#progressBar").style.width = `${percent}%`;
  document.querySelector("#progressLabel").textContent = `${count} of ${modules.length} complete`;
  document.querySelector("#headerProgress").textContent = `${percent}%`;
  document.querySelector("#miniProgress").textContent = count;
  document.querySelector(".mini-ring").style.setProperty("--ring-progress", `${percent}%`);
}

function openModule(id) {
  const module = modules.find((item) => item.id === id);
  if (!module) return;

  activeModuleId = id;
  document.querySelector("#dialogIndex").textContent = formatNumber(module.id);
  document.querySelector("#dialogStage").textContent = stageLabels[module.stage];
  document.querySelector("#dialogTitle").textContent = module.title;
  document.querySelector("#dialogDescription").textContent = module.description;
  document.querySelector("#dialogConcepts").innerHTML = conceptLessons(module);
  document.querySelector("#dialogChallenge").textContent = module.challenge;
  const officialLink = document.querySelector("#dialogOfficialLink");
  if (officialLink) {
    officialLink.href = module.officialUrl;
    officialLink.querySelector("span").textContent = module.officialLabel || `Official ${courseConfig.name} documentation`;
  }
  updateCompleteButton();

  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function updateCompleteButton() {
  const isComplete = completed.has(activeModuleId);
  completeButton.classList.toggle("completed", isComplete);
  completeButton.disabled = isSavingProgress;
  document.querySelector("#completeButtonText").textContent = isSavingProgress
    ? "Saving your progress..."
    : !currentUser
      ? "Sign in to save progress"
      : isComplete
        ? "Completed — mark as not done"
        : "Mark module complete";
}

function showToastMessage(title, message, icon = "✓") {
  toast.querySelector(":scope > span").textContent = icon;
  toast.querySelector("strong").textContent = title;
  toast.querySelector("small").textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function showToast(isComplete) {
  showToastMessage(
    isComplete ? "Module complete" : "Progress updated",
    isComplete ? "Nice work — saved to your account." : "This module is back on your path."
  );
}

async function toggleComplete() {
  if (!activeModuleId) return;
  if (!currentUser) {
    openAuth("register", "Create an account or sign in to save this module to your learning profile.");
    return;
  }
  if (isSavingProgress) return;

  const wasComplete = completed.has(activeModuleId);
  const moduleId = activeModuleId;
  if (wasComplete) completed.delete(activeModuleId);
  else completed.add(activeModuleId);
  isSavingProgress = true;
  updateCompleteButton();
  updateProgress();
  renderModules();

  try {
    const result = await apiRequest(`/api/progress/${moduleId}${courseQuery}`, {
      method: "PUT",
      body: JSON.stringify({ completed: !wasComplete })
    });
    if (result.certificate) currentCertificate = result.certificate;
    certificateEligible = result.certificateEligible;
    certificateConsentVersion = result.consentVersion;
    updateAuthUI();
    if (!wasComplete && certificateEligible && !currentCertificate?.isPublic) showCertificateCelebration(currentCertificate);
    else showToast(!wasComplete);
  } catch (error) {
    if (wasComplete) completed.add(moduleId);
    else completed.delete(moduleId);
    if (error.status === 401) {
      currentUser = null;
      updateAuthUI();
      showToastMessage("Session expired", "Sign in again to save your progress.", "!");
    } else {
      showToastMessage("Progress not saved", error.message, "!");
    }
    updateProgress();
    renderModules();
  } finally {
    isSavingProgress = false;
    updateCompleteButton();
  }
}

function closeLesson() {
  dialog.close();
  document.body.classList.remove("dialog-open");
}

searchInput.addEventListener("input", renderModules);

filterGroup.addEventListener("click", (event) => {
  const filter = event.target.closest("[data-filter]");
  if (!filter) return;
  activeFilter = filter.dataset.filter;
  filterGroup.querySelectorAll(".filter").forEach((item) => item.classList.toggle("active", item === filter));
  renderModules();
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  activeFilter = "all";
  filterGroup.querySelectorAll(".filter").forEach((item) => item.classList.toggle("active", item.dataset.filter === "all"));
  renderModules();
  searchInput.focus();
});

closeDialog.addEventListener("click", closeLesson);
completeButton.addEventListener("click", toggleComplete);
dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeLesson();
});

authButton.addEventListener("click", () => {
  if (!currentUser) {
    openAuth("login");
    return;
  }
  userMenu.hidden = !userMenu.hidden;
  authButton.setAttribute("aria-expanded", String(!userMenu.hidden));
});

authClose.addEventListener("click", closeAuth);
authDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
authDialog.addEventListener("click", (event) => {
  if (event.target === authDialog) closeAuth();
});

certificateClose.addEventListener("click", closeCertificateCelebration);
certificateDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
certificateDialog.addEventListener("click", (event) => {
  if (event.target === certificateDialog) closeCertificateCelebration();
});
certificateCopyButton.addEventListener("click", copyPublicCertificateLink);
certificateClaimButton.addEventListener("click", claimCertificate);
certificateUnpublishButton.addEventListener("click", unpublishCertificate);
certificateSaveNameButton.addEventListener("click", saveCertificateName);
certificateMenuButton.addEventListener("click", () => showCertificateCelebration());
certificatePublicName.addEventListener("input", () => {
  document.querySelector("#certificatePreviewName").textContent = certificatePublicName.value.trim() || "Your name";
});

accountSettingsButton.addEventListener("click", openAccountSettings);
accountClose.addEventListener("click", closeAccountSettings);
accountDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
accountDialog.addEventListener("click", (event) => {
  if (event.target === accountDialog) closeAccountSettings();
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = document.querySelector("#profileSaveButton");
  const message = document.querySelector("#profileMessage");
  if (!profileForm.reportValidity()) return;
  button.disabled = true;
  message.hidden = true;
  try {
    await saveDisplayName(document.querySelector("#profileName").value.trim());
    message.textContent = "Your display name has been updated.";
    message.classList.remove("error");
    message.hidden = false;
  } catch (error) {
    message.textContent = error.message;
    message.classList.add("error");
    message.hidden = false;
  } finally {
    button.disabled = false;
  }
});

deleteAccountForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = document.querySelector("#deleteAccountButton");
  const errorBox = document.querySelector("#deleteAccountError");
  if (!deleteAccountForm.reportValidity()) return;
  button.disabled = true;
  errorBox.hidden = true;
  try {
    await apiRequest("/api/account", {
      method: "DELETE",
      body: JSON.stringify({
        password: document.querySelector("#deletePassword").value,
        confirmation: document.querySelector("#deleteConfirmation").value
      })
    });
    closeAccountSettings();
    currentUser = null;
    completed = new Set();
    currentCertificate = null;
    certificateEligible = false;
    certificateConsentVersion = null;
    updateAuthUI();
    updateProgress();
    renderModules();
    showToastMessage("Account deleted", "Your profile, progress, sessions, and certificate were permanently removed.", "✓");
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  } finally {
    button.disabled = false;
  }
});

document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
  tab.addEventListener("click", () => setAuthMode(tab.dataset.authMode));
});

authSwitchButton.addEventListener("click", () => setAuthMode(authMode === "login" ? "register" : "login"));

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorBox = document.querySelector("#authError");
  const name = document.querySelector("#authName").value.trim();
  const email = document.querySelector("#authEmail").value.trim();
  const password = document.querySelector("#authPassword").value;

  if (!authForm.reportValidity()) return;
  errorBox.hidden = true;
  authSubmit.disabled = true;
  document.querySelector("#authSubmitText").textContent = authMode === "register" ? "Creating account..." : "Signing in...";

  try {
    const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
    const payload = authMode === "register" ? { name, email, password } : { email, password };
    const data = await apiRequest(endpoint, { method: "POST", body: JSON.stringify(payload) });
    currentUser = data.user;
    await loadUserProgress();
    await loadCertificate();
    updateAuthUI();
    updateProgress();
    renderModules();
    closeAuth();
    showToastMessage(
      authMode === "register" ? "Account ready" : "Welcome back",
      `Your progress is now synced as ${currentUser.name}.`
    );
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  } finally {
    authSubmit.disabled = false;
    document.querySelector("#authSubmitText").textContent = authMode === "register" ? "Create account" : "Sign in";
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch {
    // Clear the local identity even if the expired session is already gone.
  } finally {
    currentUser = null;
    completed = new Set();
    currentCertificate = null;
    certificateEligible = false;
    certificateConsentVersion = null;
    userMenu.hidden = true;
    logoutButton.disabled = false;
    updateAuthUI();
    updateProgress();
    renderModules();
    showToastMessage("Signed out", "Your saved progress stays safely in your account.", "↪");
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".auth-area")) {
    userMenu.hidden = true;
    authButton.setAttribute("aria-expanded", "false");
  }
});

resumeButton.addEventListener("click", () => {
  const nextModule = modules.find((module) => !completed.has(module.id)) || modules[0];
  openModule(nextModule.id);
});

progressButton.addEventListener("click", () => {
  document.querySelector("#curriculum").scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("keydown", (event) => {
  const activeTag = document.activeElement?.tagName;
  const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA";
  if (event.key === "/" && !isTyping && !dialog.open) {
    event.preventDefault();
    searchInput.focus();
  }
});

const navLinks = [...document.querySelectorAll(".main-nav a")];
const observedSections = [...document.querySelectorAll("#roadmap, #curriculum, #about")];

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
    },
    { rootMargin: "-25% 0px -60%", threshold: [0, 0.2, 0.5] }
  );
  observedSections.forEach((section) => observer.observe(section));
}

applyCourseUI();
renderModules();
updateProgress();
updateAuthUI();
initializeSession();
