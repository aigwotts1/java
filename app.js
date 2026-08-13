const modules = [
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
    description: "Write expressive modern Java with functions, streams, and a better date API.",
    topics: [
      "Lambda expressions",
      "Functional interfaces",
      "Method references",
      "Stream API",
      "Optional",
      "Default & static interface methods",
      "Date & Time API"
    ],
    challenge: "Use a stream pipeline to filter orders, group them by customer, and calculate totals without mutating the source list."
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
  }
];

const stageLabels = {
  foundation: "Foundation",
  core: "Core Java",
  backend: "Backend",
  advanced: "Advanced"
};

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

let activeFilter = "all";
let activeModuleId = null;
let completed = readProgress();
let toastTimer;

function readProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem("java-basecamp-progress"));
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem("java-basecamp-progress", JSON.stringify([...completed]));
}

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

function moduleSearchText(module) {
  return [module.title, module.shortTitle, module.description, ...module.topics].join(" ").toLowerCase();
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
  document.querySelector("#dialogConcepts").innerHTML = module.topics.map((topic) => `<span>${topic}</span>`).join("");
  document.querySelector("#dialogChallenge").textContent = module.challenge;
  updateCompleteButton();

  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function updateCompleteButton() {
  const isComplete = completed.has(activeModuleId);
  completeButton.classList.toggle("completed", isComplete);
  document.querySelector("#completeButtonText").textContent = isComplete ? "Completed — mark as not done" : "Mark module complete";
}

function showToast(isComplete) {
  toast.querySelector("strong").textContent = isComplete ? "Module complete" : "Progress updated";
  toast.querySelector("small").textContent = isComplete ? "Nice work — your progress was saved." : "This module is back on your path.";
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function toggleComplete() {
  if (!activeModuleId) return;
  const wasComplete = completed.has(activeModuleId);
  if (wasComplete) completed.delete(activeModuleId);
  else completed.add(activeModuleId);
  saveProgress();
  updateCompleteButton();
  updateProgress();
  renderModules();
  showToast(!wasComplete);
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

renderModules();
updateProgress();
