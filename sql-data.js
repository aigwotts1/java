(function () {
  "use strict";

  const t = (name, note, code, comment) => ({ name, note, code, comment });
  const m = (id, title, stage, description, officialUrl, challenge, topics, shortTitle) => ({
    id, title, stage, description, officialUrl, officialLabel: "Official PostgreSQL documentation", challenge, topics, shortTitle
  });

  const source = [
    m(1, "SQL & Relational Foundations", "foundation",
      "Learn the vocabulary behind relational databases and the shape of a readable SQL statement.",
      "https://www.postgresql.org/docs/current/tutorial-concepts.html",
      "Describe a small library as tables, rows, columns, keys, and relationships before writing any queries.",
      [
        t("Relational databases", "A relational database stores related facts in tables and connects those tables through meaningful keys.", "SELECT title FROM books;", "SELECT reads the title column from every row currently stored in the books table."),
        t("Tables, rows & columns", "A table represents one kind of thing, each row is one record, and each column stores one attribute of that record.", "SELECT id, name, email\nFROM users;", "The query returns three named columns for every user row, making the table's row-and-column structure visible."),
        t("Schemas & qualified names", "A schema is a namespace that organizes database objects; qualify a name when the active search path might be ambiguous.", "SELECT id, total\nFROM sales.orders;", "sales.orders explicitly selects the orders table inside the sales schema instead of relying on the current search path."),
        t("SQL statements & semicolons", "A SQL statement expresses one database operation, and a semicolon terminates it in clients that accept multiple statements.", "SELECT current_database();\nSELECT current_user;", "The semicolons separate two independent statements: one reports the database and the other reports the connected role."),
        t("Identifiers & keywords", "Identifiers name objects such as tables and columns, while keywords such as SELECT and FROM define SQL grammar.", "SELECT employee_id, display_name\nFROM employees;", "employee_id, display_name, and employees are identifiers; SELECT and FROM tell PostgreSQL how to interpret them."),
        t("Literals & expressions", "A literal is a fixed value, while an expression combines values, columns, operators, or functions to calculate a result.", "SELECT 'SQL' AS topic, 20 * 1.18 AS total;", "The query returns a text literal and evaluates an arithmetic expression, giving both results readable aliases."),
        t("Standard SQL vs PostgreSQL", "Core SQL travels well between databases, but types, functions, quoting rules, and advanced features can differ by product.", "SELECT version(), 'quickdev'::text;", "version() and PostgreSQL's :: cast syntax demonstrate useful behavior that may need changing in another SQL database.")
      ]),
    m(2, "Tables & Data Types", "foundation",
      "Create and evolve tables with types that accurately describe the values your application stores.",
      "https://www.postgresql.org/docs/current/ddl-basics.html",
      "Create a products table, add a stock column safely, and choose an appropriate type for every value.",
      [
        t("CREATE TABLE", "CREATE TABLE defines a new table, its columns, and the rules PostgreSQL should enforce for those columns.", "CREATE TABLE products (\n  id bigint PRIMARY KEY,\n  name text NOT NULL,\n  price numeric(10, 2)\n);", "This creates a products table with an integer identifier, required name, and price limited to two decimal places."),
        t("ALTER TABLE", "ALTER TABLE changes an existing table without recreating it, for example by adding, renaming, or changing a column.", "ALTER TABLE products\nADD COLUMN in_stock boolean DEFAULT true;", "The statement adds an in_stock flag and supplies true for future rows that omit the column."),
        t("DROP & TRUNCATE", "DROP removes the table definition; TRUNCATE quickly removes its rows while keeping the table available.", "TRUNCATE TABLE import_staging;\nDROP TABLE old_imports;", "The first statement empties a reusable staging table; the second permanently removes the old_imports table itself."),
        t("Integer & numeric types", "Integer types store whole numbers, while numeric stores exact decimal values suitable for money-like calculations.", "CREATE TABLE invoices (\n  item_count integer,\n  amount numeric(12, 2)\n);", "item_count accepts whole numbers, while amount preserves exact values with two digits after the decimal point."),
        t("Character & text types", "text stores variable-length strings; varchar can add a length limit when that limit is a real business rule.", "CREATE TABLE profiles (\n  bio text,\n  country_code varchar(2)\n);", "The bio can grow freely, but country_code is restricted to at most two characters."),
        t("Boolean & enumerated choices", "boolean represents true, false, or unknown; a CHECK constraint often keeps small choice lists portable and visible.", "CREATE TABLE tasks (\n  done boolean DEFAULT false,\n  priority text CHECK (priority IN ('low', 'high'))\n);", "New tasks default to unfinished, and the check rejects priority values outside the allowed list."),
        t("Identity, generated & temporary columns", "Identity columns generate keys, generated columns derive stored values, and temporary tables live only for the current session.", "CREATE TEMP TABLE cart (\n  id bigint GENERATED ALWAYS AS IDENTITY,\n  price numeric, quantity integer,\n  total numeric GENERATED ALWAYS AS (price * quantity) STORED\n);", "PostgreSQL generates each cart id and recalculates total from price and quantity inside a session-only table.")
      ]),
    m(3, "Keys & Constraints", "foundation",
      "Protect data quality at the database boundary with required values, uniqueness, checks, and relationships.",
      "https://www.postgresql.org/docs/current/ddl-constraints.html",
      "Model customers and orders so invalid identifiers, missing names, duplicate emails, and orphaned orders are rejected.",
      [
        t("NOT NULL", "NOT NULL requires every row to provide a real value for a column instead of leaving it unknown.", "CREATE TABLE members (\n  name text NOT NULL\n);", "PostgreSQL rejects any member row whose name is omitted or explicitly set to NULL."),
        t("UNIQUE", "A UNIQUE constraint prevents two rows from having the same constrained value or combination of values.", "ALTER TABLE members\nADD CONSTRAINT members_email_unique UNIQUE (email);", "The named constraint prevents duplicate non-null email values in the members table."),
        t("PRIMARY KEY", "A primary key uniquely identifies each row and combines uniqueness with a NOT NULL requirement.", "CREATE TABLE customers (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY\n);", "Each customer receives a generated, non-null id that no other customer row can reuse."),
        t("FOREIGN KEY", "A foreign key requires a child value to reference an existing key in another table, preserving referential integrity.", "CREATE TABLE orders (\n  id bigint PRIMARY KEY,\n  customer_id bigint REFERENCES customers(id)\n);", "An order can reference only a customer id that already exists in the customers table."),
        t("CHECK", "A CHECK constraint rejects rows whose Boolean rule is false, keeping domain rules close to the data.", "ALTER TABLE products\nADD CONSTRAINT price_nonnegative CHECK (price >= 0);", "The database now refuses product rows or updates that would make price negative."),
        t("Column defaults", "A DEFAULT supplies a value when an INSERT omits the column; it does not override a value explicitly provided.", "ALTER TABLE orders\nALTER COLUMN status SET DEFAULT 'pending';", "Future orders that omit status start as pending, while callers can still provide another allowed value."),
        t("Referential actions", "Foreign-key actions define what happens to child rows when the referenced parent key changes or disappears.", "FOREIGN KEY (customer_id) REFERENCES customers(id)\n  ON UPDATE CASCADE\n  ON DELETE RESTRICT", "Customer id changes flow to matching orders, while deletion is blocked when orders still reference that customer.")
      ]),
    m(4, "SELECT Essentials", "core",
      "Retrieve exactly the columns and rows you need, and give calculated results clear names.",
      "https://www.postgresql.org/docs/current/tutorial-select.html",
      "Write a compact product report that selects named columns, calculates tax, removes duplicates, and filters rows.",
      [
        t("SELECT & FROM", "SELECT chooses output expressions, while FROM identifies the table or other row source that supplies values.", "SELECT name, price\nFROM products;", "PostgreSQL reads every product row and returns only its name and price columns."),
        t("Selecting explicit columns", "Naming columns documents the result shape and avoids accidental breakage or wasted data caused by SELECT *.", "SELECT id, created_at, status\nFROM orders;", "The result has a deliberate three-column contract even if the orders table later gains more columns."),
        t("Column & table aliases", "Aliases give temporary readable names to output expressions or shorter names to tables within one query.", "SELECT o.id AS order_id, o.total AS amount\nFROM orders AS o;", "o shortens references to orders, while order_id and amount rename the two result columns."),
        t("Calculated columns", "A SELECT expression can calculate a value for each row without changing the stored source columns.", "SELECT name, price, price * 1.18 AS price_with_tax\nFROM products;", "For every product, the query multiplies price by 1.18 and exposes the result as price_with_tax."),
        t("DISTINCT", "DISTINCT removes duplicate result rows after the selected expressions have been evaluated.", "SELECT DISTINCT city\nFROM customers;", "The query returns each customer city once even when many customers live in the same city."),
        t("VALUES row sets", "VALUES constructs a small in-memory row set that can be queried, joined, or inserted without a permanent table.", "SELECT *\nFROM (VALUES ('low', 1), ('high', 2)) AS priorities(name, rank);", "The VALUES list becomes a two-row virtual table with readable name and rank columns."),
        t("SQL comments", "Double hyphens comment one line and slash-star comments span blocks, helping explain intent without changing results.", "-- Return active plans only\nSELECT name FROM plans\nWHERE active = true; /* public plans */", "PostgreSQL ignores both comments and executes the SELECT with its active-plan filter.")
      ]),
    m(5, "Filtering, NULL & Logic", "core",
      "Build precise row conditions and handle SQL's three-valued NULL logic intentionally.",
      "https://www.postgresql.org/docs/current/functions-comparison.html",
      "Filter a customer list by activity, country, email pattern, optional values, and a numeric range.",
      [
        t("Comparison operators", "Comparisons such as =, <>, <, and >= evaluate values and produce true, false, or unknown.", "SELECT * FROM products\nWHERE price >= 100;", "Only product rows whose price is at least 100 satisfy the comparison and reach the result."),
        t("AND, OR & NOT", "AND requires all conditions, OR accepts any condition, and NOT reverses a Boolean result; parentheses make precedence clear.", "SELECT * FROM users\nWHERE active = true AND (role = 'admin' OR role = 'editor');", "The query keeps active users whose role is either admin or editor; inactive users fail regardless of role."),
        t("IS NULL & IS NOT NULL", "NULL means unknown or missing, so test it with IS NULL rather than equality.", "SELECT * FROM users\nWHERE deleted_at IS NULL;", "This returns users without a deletion timestamp; writing deleted_at = NULL would not match them."),
        t("IN & NOT IN", "IN compares one expression with a value list; be careful because NULL inside a NOT IN set can make the result unknown.", "SELECT * FROM orders\nWHERE status IN ('paid', 'shipped');", "Only orders whose status equals paid or shipped are included."),
        t("BETWEEN", "BETWEEN is an inclusive range test equivalent to a lower and upper comparison joined by AND.", "SELECT * FROM products\nWHERE price BETWEEN 50 AND 100;", "Products priced exactly 50 or 100 are included along with every price between those boundaries."),
        t("LIKE & ILIKE", "LIKE matches text patterns case-sensitively; PostgreSQL's ILIKE performs the same pattern match without case sensitivity.", "SELECT * FROM customers\nWHERE email ILIKE '%@example.com';", "The percent wildcard accepts any email prefix, and ILIKE ignores letter case in the domain."),
        t("COALESCE & NULLIF", "COALESCE returns the first non-null input, while NULLIF turns two equal values into NULL.", "SELECT COALESCE(nickname, full_name) AS display_name,\n       total / NULLIF(item_count, 0) AS average\nFROM orders;", "COALESCE chooses a usable display name, and NULLIF prevents division by zero when item_count is zero.")
      ]),
    m(6, "Sorting & Pagination", "core",
      "Order results predictably and return manageable pages without losing track of stable row boundaries.",
      "https://www.postgresql.org/docs/current/queries-order.html",
      "Build deterministic first-page and next-page queries for a newest-orders screen.",
      [
        t("ORDER BY ASC & DESC", "ORDER BY sorts the final result; ASC is increasing and DESC is decreasing.", "SELECT id, created_at FROM orders\nORDER BY created_at DESC;", "The newest orders appear first because created_at is sorted from greatest to smallest."),
        t("Multi-column sorting", "Additional sort columns break ties in the order they are listed.", "SELECT name, score FROM players\nORDER BY score DESC, name ASC;", "Higher scores appear first, and players with equal scores are alphabetized by name."),
        t("NULLS FIRST & LAST", "NULLS FIRST or NULLS LAST explicitly chooses where missing sort values appear.", "SELECT name, last_login FROM users\nORDER BY last_login DESC NULLS LAST;", "Recently active users appear first while users with no login timestamp are placed at the end."),
        t("LIMIT", "LIMIT caps the number of rows returned after filtering and ordering.", "SELECT id, total FROM orders\nORDER BY created_at DESC\nLIMIT 20;", "The query returns at most the 20 newest orders rather than the entire table."),
        t("OFFSET", "OFFSET skips result rows, which is simple for small pages but can become slow or unstable deep into changing data.", "SELECT id, total FROM orders\nORDER BY created_at DESC, id DESC\nLIMIT 20 OFFSET 40;", "After a deterministic sort, the query skips 40 rows and returns the third group of 20."),
        t("FETCH FIRST & WITH TIES", "FETCH is standard-style row limiting; WITH TIES also includes rows equal to the last ordered value.", "SELECT name, score FROM players\nORDER BY score DESC\nFETCH FIRST 3 ROWS WITH TIES;", "The result includes at least three top players and any additional players tied with the third score."),
        t("Keyset pagination", "Keyset pagination continues after the last seen sort key, avoiding the deep scan and shifting-page problems of large offsets.", "SELECT id, created_at FROM orders\nWHERE (created_at, id) < (:last_time, :last_id)\nORDER BY created_at DESC, id DESC\nLIMIT 20;", "The tuple comparison starts after the previous page's final order using the same two-column sort boundary.")
      ]),
    m(7, "Aggregates & Grouping", "core",
      "Summarize many rows into counts, totals, averages, ranges, and grouped business metrics.",
      "https://www.postgresql.org/docs/current/tutorial-agg.html",
      "Produce a status dashboard with counts, revenue, averages, conditional totals, and grouped rollups.",
      [
        t("COUNT", "COUNT(*) counts rows, while COUNT(column) counts only rows where that column is not NULL.", "SELECT COUNT(*) AS order_count,\n       COUNT(shipped_at) AS shipped_count\nFROM orders;", "The first count includes every order; the second includes only orders with a shipping timestamp."),
        t("SUM & AVG", "SUM adds numeric inputs and AVG computes their arithmetic mean, ignoring NULL inputs.", "SELECT SUM(total) AS revenue, AVG(total) AS average_order\nFROM orders;", "The query turns all non-null order totals into one revenue value and one average value."),
        t("MIN & MAX", "MIN and MAX return the smallest and largest non-null input values.", "SELECT MIN(price) AS cheapest, MAX(price) AS costliest\nFROM products;", "A single scan reports the lowest and highest stored product prices."),
        t("GROUP BY", "GROUP BY forms sets of rows sharing the same values so aggregates are calculated once per group.", "SELECT status, COUNT(*)\nFROM orders\nGROUP BY status;", "Orders are separated by status, and each status receives its own row count."),
        t("HAVING", "WHERE filters input rows before grouping; HAVING filters completed groups after aggregate values exist.", "SELECT customer_id, SUM(total) AS spend\nFROM orders\nGROUP BY customer_id\nHAVING SUM(total) >= 1000;", "The query calculates spend per customer, then keeps only customers whose grouped total reaches 1000."),
        t("Aggregate FILTER", "FILTER gives one aggregate its own condition without removing rows needed by other aggregates.", "SELECT COUNT(*) AS all_orders,\n       COUNT(*) FILTER (WHERE status = 'paid') AS paid_orders\nFROM orders;", "Both metrics share the same source rows, but only the second count accepts paid orders."),
        t("ROLLUP, CUBE & grouping sets", "Advanced grouping produces several subtotal levels in one query instead of combining many separate aggregate queries.", "SELECT region, category, SUM(total)\nFROM sales\nGROUP BY ROLLUP (region, category);", "ROLLUP returns category totals within each region, regional subtotals, and a final grand total." )
      ]),
    m(8, "Joins", "core",
      "Combine related tables and choose deliberately which unmatched rows should remain visible.",
      "https://www.postgresql.org/docs/current/tutorial-join.html",
      "Join customers, orders, products, and employees using every major join shape, then explain which unmatched rows remain.",
      [
        t("INNER JOIN", "INNER JOIN keeps only row pairs whose ON condition matches on both sides.", "SELECT o.id, c.name\nFROM orders AS o\nINNER JOIN customers AS c ON c.id = o.customer_id;", "Each returned order has a matching customer; orders or customers without a match are excluded."),
        t("LEFT JOIN", "LEFT JOIN keeps every left-side row and fills right-side columns with NULL when no match exists.", "SELECT c.name, o.id\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id;", "Every customer appears, including customers without orders whose o.id value will be NULL."),
        t("RIGHT JOIN", "RIGHT JOIN keeps every right-side row; swapping table order usually expresses the same idea as a clearer LEFT JOIN.", "SELECT o.id, c.name\nFROM orders AS o\nRIGHT JOIN customers AS c ON c.id = o.customer_id;", "Every customer remains in the result, while order columns become NULL for customers with no orders."),
        t("FULL OUTER JOIN", "FULL OUTER JOIN keeps matched pairs plus unmatched rows from both inputs.", "SELECT a.email, b.email\nFROM old_list AS a\nFULL OUTER JOIN new_list AS b ON b.email = a.email;", "The result exposes emails shared by both lists and emails found in only one list."),
        t("CROSS JOIN", "CROSS JOIN creates every possible pair of rows and needs careful sizing because the result multiplies input counts.", "SELECT c.color, s.size\nFROM colors AS c\nCROSS JOIN sizes AS s;", "Every color is paired with every size to generate all available combinations."),
        t("SELF JOIN", "A self join uses aliases to relate different rows from the same table, such as an employee and manager.", "SELECT e.name AS employee, m.name AS manager\nFROM employees AS e\nLEFT JOIN employees AS m ON m.id = e.manager_id;", "The employees table is read twice so each employee can be paired with the manager row it references."),
        t("ON, USING & join safety", "ON accepts any join condition; USING joins same-named columns once, while a missing condition can accidentally create a Cartesian result.", "SELECT o.id, s.status\nFROM orders AS o\nJOIN shipments AS s USING (order_id);", "USING matches the order_id column from both tables and exposes that shared join column only once." )
      ]),
    m(9, "Set Operations", "core",
      "Combine compatible query results as mathematical sets while choosing whether duplicates matter.",
      "https://www.postgresql.org/docs/current/queries-union.html",
      "Combine customer and subscriber lists with UNION, INTERSECT, and EXCEPT, then compare DISTINCT and ALL behavior.",
      [
        t("UNION", "UNION combines compatible results and removes duplicate rows from the final set.", "SELECT email FROM customers\nUNION\nSELECT email FROM subscribers;", "The two email lists become one result containing each distinct email once."),
        t("UNION ALL", "UNION ALL appends compatible results without duplicate removal and is usually cheaper when duplicates are acceptable.", "SELECT event_time FROM web_events\nUNION ALL\nSELECT event_time FROM mobile_events;", "All web and mobile event rows are appended, including equal timestamps from either source."),
        t("INTERSECT", "INTERSECT returns distinct rows present in both compatible query results.", "SELECT email FROM customers\nINTERSECT\nSELECT email FROM subscribers;", "Only emails that exist in both the customer and subscriber lists are returned."),
        t("INTERSECT ALL", "INTERSECT ALL preserves duplicate frequency up to the smaller count found in the two inputs.", "SELECT tag FROM article_tags\nINTERSECT ALL\nSELECT tag FROM video_tags;", "A repeated tag can appear multiple times, but never more often than it occurs in the less frequent input."),
        t("EXCEPT", "EXCEPT returns distinct rows from the first result that do not appear in the second.", "SELECT email FROM subscribers\nEXCEPT\nSELECT email FROM unsubscribed;", "The result is the distinct subscriber emails that are absent from the unsubscribe list."),
        t("EXCEPT ALL", "EXCEPT ALL subtracts matching row occurrences while preserving any remaining duplicates from the first input.", "SELECT sku FROM expected_stock\nEXCEPT ALL\nSELECT sku FROM received_stock;", "Each received SKU occurrence removes one expected occurrence, leaving the still-missing units."),
        t("Compatibility & parentheses", "Set-operation branches need the same column count and compatible types; parentheses control branch-local sorting and limits.", "(SELECT id FROM recent_orders ORDER BY id DESC LIMIT 5)\nUNION ALL\nSELECT id FROM flagged_orders;", "Parentheses ensure LIMIT applies only to the recent-orders branch before flagged orders are appended." )
      ]),
    m(10, "Subqueries & CTEs", "core",
      "Compose complex questions from smaller queries and name intermediate results when that improves clarity.",
      "https://www.postgresql.org/docs/current/queries-with.html",
      "Find above-average customers with a subquery, then rewrite a multi-stage report with readable CTEs.",
      [
        t("Scalar subqueries", "A scalar subquery must return at most one row and one column so its value can be used inside an expression.", "SELECT name\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);", "The inner query calculates one average price, and the outer query keeps products priced above it."),
        t("IN subqueries", "IN tests whether a value appears in the one-column result produced by a subquery.", "SELECT name FROM customers\nWHERE id IN (SELECT customer_id FROM orders WHERE status = 'paid');", "The subquery finds customers with paid orders; the outer query returns names for those ids."),
        t("EXISTS", "EXISTS becomes true as soon as its subquery can produce one row, making it ideal for presence checks.", "SELECT c.name FROM customers AS c\nWHERE EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id);", "For each customer, PostgreSQL checks whether at least one related order exists without needing its column values."),
        t("Correlated subqueries", "A correlated subquery references the current outer row and is conceptually evaluated in that row's context.", "SELECT p.name\nFROM products AS p\nWHERE p.price > (SELECT AVG(p2.price) FROM products AS p2 WHERE p2.category_id = p.category_id);", "Each product price is compared with the average calculated for that product's own category."),
        t("Common table expressions", "A WITH clause names an intermediate query for the duration of one statement, often making multi-stage logic easier to read.", "WITH paid AS (\n  SELECT * FROM orders WHERE status = 'paid'\n)\nSELECT customer_id, SUM(total) FROM paid GROUP BY customer_id;", "The paid CTE first names the filtered orders, and the main query then totals them per customer."),
        t("Recursive CTEs", "WITH RECURSIVE repeatedly evaluates a recursive term until no new rows appear, supporting trees and graph-like paths.", "WITH RECURSIVE numbers(n) AS (\n  VALUES (1)\n  UNION ALL\n  SELECT n + 1 FROM numbers WHERE n < 5\n)\nSELECT n FROM numbers;", "The seed starts at 1 and the recursive branch adds one until the condition stops at 5."),
        t("CTE materialization", "PostgreSQL may inline a side-effect-free CTE; MATERIALIZED or NOT MATERIALIZED can deliberately influence reuse and optimization.", "WITH recent AS NOT MATERIALIZED (\n  SELECT * FROM orders WHERE created_at >= current_date - 7\n)\nSELECT * FROM recent WHERE status = 'paid';", "NOT MATERIALIZED lets the planner combine the CTE and outer filters instead of forcing an intermediate result." )
      ]),
    m(11, "INSERT, UPDATE, DELETE & MERGE", "backend",
      "Change data safely and return affected rows without requiring an immediate follow-up query.",
      "https://www.postgresql.org/docs/current/dml.html",
      "Implement create, update, upsert, merge, and delete operations for a product catalog with useful RETURNING results.",
      [
        t("INSERT VALUES", "INSERT VALUES creates one or more rows from explicit expressions mapped to named columns.", "INSERT INTO users (name, email)\nVALUES ('Ada', 'ada@example.com');", "The values are stored in the name and email columns of one new users row."),
        t("Multi-row INSERT", "One INSERT can add several rows, reducing round trips and letting PostgreSQL treat the write as one statement.", "INSERT INTO tags (name) VALUES\n  ('sql'),\n  ('postgresql'),\n  ('database');", "All three tag rows are inserted together by one statement."),
        t("INSERT SELECT", "INSERT SELECT copies or transforms rows produced by a query into a compatible target table.", "INSERT INTO archived_orders (id, total)\nSELECT id, total FROM orders WHERE created_at < DATE '2025-01-01';", "Older order ids and totals are selected and inserted into the archive table."),
        t("UPDATE", "UPDATE changes columns on rows that satisfy its WHERE condition; omitting WHERE updates every row.", "UPDATE products\nSET price = price * 1.05\nWHERE category_id = 4;", "Only products in category 4 receive a five-percent price increase."),
        t("DELETE", "DELETE removes rows matching its WHERE condition; inspect the condition carefully because an omitted WHERE removes all rows.", "DELETE FROM sessions\nWHERE expires_at < now();", "Expired session rows are removed while current sessions remain."),
        t("RETURNING", "RETURNING exposes values from rows affected by INSERT, UPDATE, DELETE, or MERGE without another select.", "INSERT INTO users (name, email)\nVALUES ('Grace', 'grace@example.com')\nRETURNING id, created_at;", "The insert creates the user and immediately returns the database-generated id and timestamp."),
        t("ON CONFLICT & MERGE", "ON CONFLICT handles PostgreSQL upserts; MERGE conditionally inserts, updates, or deletes by matching a source to a target.", "INSERT INTO counters (name, value) VALUES ('visits', 1)\nON CONFLICT (name) DO UPDATE\nSET value = counters.value + 1\nRETURNING value;", "A missing visits counter is inserted; an existing one is incremented atomically and its new value is returned." )
      ]),
    m(12, "Transactions & Concurrency", "backend",
      "Group related changes, choose isolation deliberately, and coordinate concurrent writers without corrupting data.",
      "https://www.postgresql.org/docs/current/tutorial-transactions.html",
      "Implement a money transfer that commits atomically, rolls back on failure, and locks the rows it changes.",
      [
        t("BEGIN, COMMIT & ROLLBACK", "BEGIN opens a transaction, COMMIT makes all its changes durable, and ROLLBACK discards the uncommitted work.", "BEGIN;\nUPDATE accounts SET balance = balance - 50 WHERE id = 1;\nUPDATE accounts SET balance = balance + 50 WHERE id = 2;\nCOMMIT;", "Both balance changes become visible together when COMMIT succeeds, preserving the transfer as one unit."),
        t("Atomicity", "Atomicity means a transaction's changes succeed as one unit or leave no partial result behind.", "BEGIN;\nINSERT INTO orders (id, total) VALUES (42, 99);\nINSERT INTO order_items (order_id, sku) VALUES (42, 'BOOK');\nCOMMIT;", "The order and its item are committed together; an error can roll back both instead of leaving an empty order."),
        t("SAVEPOINT", "A savepoint marks an inner recovery point so part of a transaction can be undone without abandoning all earlier work.", "BEGIN;\nUPDATE carts SET checked_out = true WHERE id = 7;\nSAVEPOINT before_coupon;\nUPDATE coupons SET uses = uses + 1 WHERE code = 'SAVE10';\nROLLBACK TO before_coupon;\nCOMMIT;", "The coupon update is undone, but the earlier cart update can still be committed."),
        t("Isolation levels", "Isolation levels control which concurrent changes a transaction can observe and which anomalies PostgreSQL must prevent.", "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nSELECT balance FROM accounts WHERE id = 1;\nCOMMIT;", "REPEATABLE READ gives the transaction a stable snapshot so repeated reads do not see later committed changes."),
        t("MVCC snapshots", "PostgreSQL MVCC lets readers see consistent row versions while writers create newer versions instead of normally blocking reads.", "BEGIN;\nSELECT * FROM inventory WHERE sku = 'A1';\n-- This transaction reads from its current snapshot.\nCOMMIT;", "The SELECT observes the version visible to the transaction's snapshot rather than an in-progress change from another transaction."),
        t("Row locks", "SELECT FOR UPDATE locks chosen rows against conflicting modifications until the transaction ends.", "BEGIN;\nSELECT balance FROM accounts WHERE id = 1 FOR UPDATE;\nUPDATE accounts SET balance = balance - 50 WHERE id = 1;\nCOMMIT;", "The row is locked before its balance is changed, preventing another writer from racing the same account update."),
        t("Deadlocks & retry", "Conflicting lock order can deadlock; PostgreSQL aborts one transaction, so applications should use consistent ordering and retry safely.", "BEGIN;\nSELECT id FROM accounts\nWHERE id IN (1, 2)\nORDER BY id\nFOR UPDATE;\nCOMMIT;", "Locking account rows in a consistent id order reduces the chance that two transfers wait on each other." )
      ]),
    m(13, "String, Numeric & Conditional Functions", "backend",
      "Transform text and numbers inside a query while keeping business choices readable.",
      "https://www.postgresql.org/docs/current/functions.html",
      "Clean a small import, format names, calculate rounded totals, and label values with CASE.",
      [
        t("String concatenation", "The || operator joins text values; concat and concat_ws provide function-based alternatives with useful NULL behavior.", "SELECT first_name || ' ' || last_name AS full_name\nFROM users;", "Each row's first and last names are joined with a space into one full_name result."),
        t("LOWER & UPPER", "LOWER and UPPER normalize letter case for display or comparison, though indexed case-insensitive search may need a deliberate index.", "SELECT LOWER(email) AS normalized_email, UPPER(country_code) AS country\nFROM users;", "Email letters become lowercase and country-code letters become uppercase in the query result."),
        t("LENGTH & TRIM", "LENGTH counts characters and TRIM removes unwanted characters, spaces by default, from the ends of text.", "SELECT TRIM(name) AS clean_name, LENGTH(TRIM(name)) AS characters\nFROM imports;", "The query removes surrounding spaces and then counts the characters in the cleaned name."),
        t("SUBSTRING & position", "SUBSTRING extracts part of a string, while position finds where one string starts inside another.", "SELECT SUBSTRING(email FROM 1 FOR position('@' IN email) - 1) AS username\nFROM users;", "position finds the @ sign and SUBSTRING returns everything before it as the email username."),
        t("ROUND, ABS & arithmetic", "Numeric functions can round values, make them non-negative, or combine them with ordinary arithmetic operators.", "SELECT ROUND(price * quantity, 2) AS total, ABS(balance) AS magnitude\nFROM line_items;", "The line total is rounded to two decimal places and balance magnitude is returned without its sign."),
        t("CASE expressions", "CASE selects a result by testing conditions in order and returns the first matching branch.", "SELECT total,\n  CASE WHEN total >= 1000 THEN 'large'\n       WHEN total >= 100 THEN 'medium'\n       ELSE 'small' END AS size\nFROM orders;", "Each order is labeled large, medium, or small according to the first total threshold it satisfies."),
        t("Type casts", "A cast asks PostgreSQL to interpret or convert a value as another compatible data type.", "SELECT '42'::integer + 8 AS answer,\n       CAST('2026-08-18' AS date) AS launch_date;", "The text 42 becomes an integer for addition, and the date text becomes a typed date value." )
      ]),
    m(14, "Date & Time", "backend",
      "Store instants and calendar values correctly, calculate intervals, and make time-zone behavior explicit.",
      "https://www.postgresql.org/docs/current/functions-datetime.html",
      "Build a seven-day activity report that handles timestamps, intervals, truncation, extraction, and time-zone conversion.",
      [
        t("date, time & timestamp types", "date stores a calendar day, time stores a clock value, and timestamp combines date and time without a time zone.", "SELECT DATE '2026-08-18', TIME '14:30', TIMESTAMP '2026-08-18 14:30';", "Typed literals tell PostgreSQL exactly which temporal value each text represents."),
        t("timestamptz", "timestamp with time zone stores an instant and displays it in the session time zone; it does not preserve the original zone name.", "SELECT TIMESTAMPTZ '2026-08-18 14:30:00+05:30';", "The offset identifies one global instant that PostgreSQL can later display in another session time zone."),
        t("Current date & time", "CURRENT_DATE and CURRENT_TIMESTAMP expose the transaction's current calendar date and time consistently.", "SELECT CURRENT_DATE, CURRENT_TIMESTAMP, clock_timestamp();", "The first two stay fixed for the transaction, while clock_timestamp reports the actual wall-clock time at the call."),
        t("Intervals", "An interval represents a duration that can be added to or subtracted from temporal values.", "SELECT CURRENT_TIMESTAMP + INTERVAL '30 minutes' AS expires_at;", "The expression calculates an expiration instant thirty minutes after the transaction timestamp."),
        t("Date arithmetic", "Subtracting dates measures days, while adding integers or intervals moves a temporal value forward or backward.", "SELECT due_date - CURRENT_DATE AS days_left\nFROM tasks;", "For each task, subtracting today's date returns the number of calendar days until its due date."),
        t("EXTRACT & date_part", "EXTRACT reads a selected component such as year, month, hour, or epoch from a temporal value.", "SELECT EXTRACT(YEAR FROM created_at) AS year,\n       EXTRACT(MONTH FROM created_at) AS month\nFROM orders;", "The timestamp remains unchanged while its year and month components are returned as separate values."),
        t("date_trunc & time zones", "date_trunc groups timestamps at a chosen precision, and AT TIME ZONE converts between local timestamps and instants.", "SELECT date_trunc('day', created_at AT TIME ZONE 'Asia/Kolkata') AS local_day, COUNT(*)\nFROM events\nGROUP BY local_day;", "Each event instant is viewed in Kolkata time, truncated to its local day, and counted within that day." )
      ]),
    m(15, "Views, Indexes & Query Plans", "advanced",
      "Package reusable queries and help PostgreSQL find rows efficiently by reading actual execution plans.",
      "https://www.postgresql.org/docs/current/performance-tips.html",
      "Create a reporting view, add a targeted index, and use EXPLAIN ANALYZE to confirm whether it improves the real query.",
      [
        t("Views", "A view saves a query behind a table-like name; PostgreSQL runs its underlying query when the view is referenced.", "CREATE VIEW active_customers AS\nSELECT id, name FROM customers WHERE active = true;", "The view centralizes the active-customer filter without storing a second copy of those rows."),
        t("Materialized views", "A materialized view stores a query result for fast reads and must be refreshed when fresher source data is required.", "CREATE MATERIALIZED VIEW daily_sales AS\nSELECT created_at::date AS day, SUM(total) AS revenue\nFROM orders GROUP BY day;\nREFRESH MATERIALIZED VIEW daily_sales;", "The aggregate result is stored physically, and REFRESH rebuilds it from the current orders data."),
        t("B-tree indexes", "The default B-tree index supports equality and ordered range lookups on values with a useful ordering.", "CREATE INDEX orders_created_at_idx\nON orders (created_at);", "The index gives PostgreSQL an ordered path to find or sort rows by created_at without always scanning the table."),
        t("Multicolumn indexes", "A multicolumn index is ordered by its listed columns, so column order should match frequent filters and sorts.", "CREATE INDEX orders_customer_time_idx\nON orders (customer_id, created_at DESC);", "The index is designed for finding one customer's orders and reading them newest first."),
        t("Partial & expression indexes", "A partial index stores qualifying rows only, while an expression index stores a calculated key used by matching queries.", "CREATE INDEX users_active_email_idx\nON users (LOWER(email))\nWHERE active = true;", "Only active users are indexed, using lowercase email so matching normalized lookups can use the index."),
        t("EXPLAIN", "EXPLAIN shows the planner's estimated execution tree, row counts, costs, and chosen scan or join strategies without running most statements.", "EXPLAIN\nSELECT * FROM orders WHERE customer_id = 42;", "PostgreSQL displays its planned path for the lookup so you can see whether it expects a scan or index access."),
        t("EXPLAIN ANALYZE", "EXPLAIN ANALYZE executes the statement and adds actual timing and row counts, so use care with writes and production workloads.", "EXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders WHERE customer_id = 42;", "The real query runs and reports actual rows, timing, and buffer activity for comparison with the planner's estimates." )
      ]),
    m(16, "Window Functions", "advanced",
      "Calculate rankings, comparisons, and running metrics while preserving each input row.",
      "https://www.postgresql.org/docs/current/tutorial-window.html",
      "Rank salespeople per region and calculate previous values, running totals, and moving averages.",
      [
        t("OVER", "OVER turns an aggregate or window function into a per-row calculation across a related set of rows.", "SELECT id, total, AVG(total) OVER () AS overall_average\nFROM orders;", "Every order row remains visible and receives the same average calculated across all returned orders."),
        t("PARTITION BY", "PARTITION BY splits rows into independent windows without collapsing them like GROUP BY.", "SELECT id, region, SUM(total) OVER (PARTITION BY region) AS region_total\nFROM sales;", "Each sale remains a row but receives the total calculated only from sales in its region."),
        t("Window ORDER BY", "ORDER BY inside OVER defines sequence for ranking and cumulative calculations independently of the final result order.", "SELECT id, created_at, ROW_NUMBER() OVER (ORDER BY created_at) AS sequence\nFROM events;", "Events receive sequential numbers based on created_at even if the outer query later displays them differently."),
        t("ROW_NUMBER, RANK & DENSE_RANK", "ROW_NUMBER is always unique, RANK leaves gaps after ties, and DENSE_RANK does not leave gaps.", "SELECT name, score,\n  ROW_NUMBER() OVER (ORDER BY score DESC),\n  RANK() OVER (ORDER BY score DESC),\n  DENSE_RANK() OVER (ORDER BY score DESC)\nFROM players;", "The three columns show how identical scores are numbered under each ranking rule."),
        t("LAG & LEAD", "LAG reads a previous row and LEAD reads a following row within the defined window order.", "SELECT day, revenue,\n  LAG(revenue) OVER (ORDER BY day) AS previous_revenue\nFROM daily_sales;", "Each day is shown beside the revenue from the immediately preceding day for direct comparison."),
        t("Window frames", "A frame narrows the rows around the current row used by frame-sensitive window calculations.", "SELECT day, revenue,\n  AVG(revenue) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS seven_day_average\nFROM daily_sales;", "Each row averages its revenue with up to six preceding rows, producing a rolling seven-row measure."),
        t("Named windows", "A WINDOW clause names a reusable partition-and-order definition so several functions share consistent logic.", "SELECT name, region, score,\n  RANK() OVER regional AS rank,\n  AVG(score) OVER regional AS average\nFROM players\nWINDOW regional AS (PARTITION BY region ORDER BY score DESC);", "Both functions reuse the same regional ordering instead of duplicating the window definition." )
      ]),
    m(17, "Data Modeling & Normalization", "advanced",
      "Shape tables around stable facts and relationships so updates stay consistent as the application grows.",
      "https://www.postgresql.org/docs/current/ddl.html",
      "Turn a duplicated spreadsheet-style order table into normalized customers, orders, products, and order_items tables.",
      [
        t("Entities & attributes", "An entity is a thing the system tracks, while attributes are the facts stored about each instance.", "CREATE TABLE authors (\n  id bigint PRIMARY KEY,\n  name text NOT NULL,\n  biography text\n);", "The authors entity becomes one table, and each row carries the name and biography attributes for one author."),
        t("First normal form", "First normal form keeps each field atomic for its intended use and avoids repeating column groups.", "CREATE TABLE order_items (\n  order_id bigint REFERENCES orders(id),\n  product_id bigint REFERENCES products(id),\n  quantity integer NOT NULL,\n  PRIMARY KEY (order_id, product_id)\n);", "Instead of product1, product2 columns, each ordered product becomes its own related order_items row."),
        t("Second normal form", "Second normal form moves attributes that depend on only part of a composite key into the table where that key truly belongs.", "-- product_name depends on product_id, not the full order-item key\nCREATE TABLE products (id bigint PRIMARY KEY, name text NOT NULL);", "Product name is stored once with product_id instead of being repeated in every order-item row."),
        t("Third normal form", "Third normal form removes non-key attributes that depend on other non-key attributes, reducing inconsistent duplicate facts.", "CREATE TABLE postal_codes (\n  postal_code text PRIMARY KEY,\n  city text NOT NULL\n);", "City is stored with its determining postal code rather than copied independently into many customer rows."),
        t("One-to-one & one-to-many", "A unique foreign key models one-to-one; a regular foreign key lets many child rows reference one parent.", "CREATE TABLE profiles (\n  user_id bigint UNIQUE REFERENCES users(id),\n  bio text\n);\n-- orders.customer_id without UNIQUE models many orders per customer", "UNIQUE limits each user to one profile, while the ordinary customer foreign key permits multiple orders."),
        t("Many-to-many junctions", "A junction table turns a many-to-many relationship into two one-to-many relationships and can store relationship attributes.", "CREATE TABLE student_courses (\n  student_id bigint REFERENCES students(id),\n  course_id bigint REFERENCES courses(id),\n  enrolled_at timestamptz NOT NULL,\n  PRIMARY KEY (student_id, course_id)\n);", "Each row links one student to one course, allowing both sides to participate in many links."),
        t("Natural & surrogate keys", "Natural keys come from business data; surrogate keys are generated identifiers that keep relationships stable when business values change.", "CREATE TABLE users (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  email text NOT NULL UNIQUE\n);", "The generated id is the stable relationship key, while UNIQUE still enforces email as a business identifier." )
      ]),
    m(18, "Security & PostgreSQL Data Features", "advanced",
      "Control database access and use JSON, arrays, and search features only where they fit the data model.",
      "https://www.postgresql.org/docs/current/ddl-priv.html",
      "Create a least-privilege reporting role and prototype protected JSONB and full-text queries with suitable indexes.",
      [
        t("Roles", "PostgreSQL roles can own objects, log in, and inherit membership; applications should use dedicated roles instead of a superuser.", "CREATE ROLE app_reader LOGIN PASSWORD 'replace-in-secret-store';", "The statement creates a login role; the placeholder password must be supplied securely outside committed SQL."),
        t("GRANT & REVOKE", "GRANT adds privileges and REVOKE removes them, enabling least-privilege access to specific objects or actions.", "GRANT SELECT ON TABLE products TO app_reader;\nREVOKE INSERT, UPDATE, DELETE ON TABLE products FROM app_reader;", "The reader can query products but cannot use the three listed write operations on that table."),
        t("Schema privileges & search_path", "Schema USAGE permits object lookup, CREATE permits new objects, and a trusted search_path avoids unsafe name resolution.", "GRANT USAGE ON SCHEMA reporting TO app_reader;\nALTER ROLE app_reader SET search_path = reporting, pg_catalog;", "The role can resolve objects in reporting and uses an explicit trusted lookup order."),
        t("Row-level security", "Row-level security policies restrict which rows a role can read or change after table privileges have been granted.", "ALTER TABLE projects ENABLE ROW LEVEL SECURITY;\nCREATE POLICY own_projects ON projects\nUSING (owner_id = current_setting('app.user_id')::bigint);", "Once enabled, the policy exposes only project rows whose owner matches the application user setting."),
        t("JSONB", "jsonb stores decomposed JSON for querying and indexing, but important relational constraints may still belong in ordinary columns.", "SELECT payload ->> 'event' AS event_name\nFROM audit_log\nWHERE payload @> '{\"source\": \"web\"}'::jsonb;", "The containment filter keeps web-source JSON documents and ->> extracts event as text."),
        t("Arrays", "PostgreSQL arrays store ordered values of one type and support containment, indexing, and unnesting; junction tables often model relationships better.", "SELECT id, tags[1] AS first_tag\nFROM articles\nWHERE tags @> ARRAY['sql'];", "The array containment operator finds articles tagged sql, and bracket indexing returns each matching article's first tag."),
        t("Full-text search", "Full-text search normalizes documents and queries into searchable lexemes and ranks matches more meaningfully than simple substring matching.", "SELECT title\nFROM articles\nWHERE to_tsvector('english', title || ' ' || body)\n      @@ plainto_tsquery('english', 'sql joins');", "The document text and search phrase are normalized with the same configuration, then @@ tests whether they match." )
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
    groupedExamples[item.name] = [[item.name, item.code, item.comment]];
    exampleComments[item.name] = item.comment;
  }));

  window.QUICKDEV_COURSE = {
    key: "sql",
    name: "SQL",
    mark: "SQL",
    modules,
    quickNotes,
    groupedExamples,
    exampleComments,
    pageTitle: "SQL at a Glance | QuickDevBase",
    pageDescription: "QuickDevBase SQL — fast explanations and practical PostgreSQL-flavoured examples with links to the official PostgreSQL documentation.",
    heroEyebrow: "SQL knowledge, at a glance",
    heroTitle: "SQL, without<br>the <em>query confusion.</em>",
    heroLede: "Scan the language from tables and joins to transactions, window functions, plans, and database security. Examples use PostgreSQL, with portability differences called out clearly.",
    previewLabel: "SQL.QUERY",
    previewCode: [
      '<span><b class="code-pink">SELECT</b> c.name, <b class="code-blue">COUNT</b>(o.id) <b class="code-pink">AS</b> orders</span>',
      '<span><b class="code-pink">FROM</b> customers c</span>',
      '<span><b class="code-pink">LEFT JOIN</b> orders o <b class="code-pink">ON</b> o.customer_id = c.id</span>',
      '<span><b class="code-pink">GROUP BY</b> c.id, c.name</span>',
      '<span><b class="code-pink">ORDER BY</b> orders <b class="code-pink">DESC</b>;</span>'
    ].join(""),
    chipOne: "126 SQL concepts",
    chipTwo: "Official docs linked",
    curriculumTitle: "One glance. Every SQL essential.",
    curriculumLede: "Build a portable SQL mental model, run each PostgreSQL-flavoured example, and follow the official documentation when you need exact behavior and full detail.",
    searchPlaceholder: "Search topics, e.g. joins",
    certificateTitleHtml: "SQL Topics<br>at a Glance",
    completionNoun: "SQL learner",
    trademark: "Independent educational project—not affiliated with or endorsed by the PostgreSQL project. PostgreSQL and related marks belong to their respective owners.",
    stageLabels: {
      foundation: "Foundation",
      core: "Querying",
      backend: "Data Work",
      advanced: "Advanced & Production"
    },
    fallbackNote: "A practical SQL concept worth understanding before moving to the next module.",
    fallbackCode: "-- Try this query in a disposable PostgreSQL database."
  };
}());
