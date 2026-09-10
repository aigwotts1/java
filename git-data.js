(function () {
  "use strict";

  const t = (name, note, code, comment) => ({ name, note, code, comment });
  const m = (id, title, stage, description, officialUrl, challenge, topics, shortTitle, history) => ({
    id, title, stage, description, officialUrl, officialLabel: "Official Git documentation", challenge, topics, shortTitle, history
  });

  function gitExampleComment(item) {
    const command = item.code.trim();
    const concept = item.name.toLowerCase();

    if (/^git config\b/.test(command)) return `This reads or writes Git configuration so the ${concept} behavior is explicit for the selected scope.`;
    if (/^git (?:init|clone)\b/.test(command)) return `This creates a usable local repository and prepares its Git metadata and working tree.`;
    if (/^git (?:status|diff|log|show|blame|grep)\b/.test(command)) return `This inspects repository state or history without creating a new commit.`;
    if (/^git add\b/.test(command)) return `This copies selected working-tree content into the index so it can enter the next commit.`;
    if (/^git commit\b/.test(command)) return `This records the currently staged snapshot and connects it to the existing commit history.`;
    if (/^git (?:branch|switch)\b/.test(command)) return `This changes or inspects the lightweight references used to keep lines of development separate.`;
    if (/^git merge\b/.test(command)) return `This integrates the named history into the current branch, stopping for manual resolution if needed.`;
    if (/^git (?:fetch|pull|push|remote)\b/.test(command)) return `This communicates with or configures another repository while keeping local and remote references distinct.`;
    if (/^git (?:rebase|cherry-pick)\b/.test(command)) return `This reapplies selected commits onto a different history, creating new commit identities where necessary.`;
    if (/^git (?:restore|reset|revert|reflog|clean)\b/.test(command)) return `This is a recovery-oriented command; inspect the target and scope before changing repository state.`;
    if (/^git tag\b/.test(command)) return `This creates, inspects, or shares a stable name for a specific commit.`;
    if (/^git (?:stash|worktree)\b/.test(command)) return `This temporarily separates work so another task can proceed without mixing unrelated changes.`;
    if (/^git (?:bisect|range-diff)\b/.test(command)) return `This uses Git history to narrow a problem or compare how a patch series changed.`;
    if (/^git (?:cat-file|hash-object|fsck|gc|maintenance)\b/.test(command)) return `This exposes or maintains Git's internal object database rather than changing ordinary source files directly.`;
    if (/^git submodule\b/.test(command)) return `This manages the recorded relationship between the parent repository and a separately versioned repository.`;
    if (/^git (?:verify-commit|verify-tag)\b/.test(command) || /-S\b/.test(command)) return `This uses a cryptographic signature to attach or verify authorship evidence for Git history.`;
    return `This small example makes ${concept} concrete; run it in a disposable repository before adapting it to important work.`;
  }

  const source = [
    m(1, "Git Foundations", "foundation",
      "Understand what Git records, why it is distributed, and how snapshots, objects, and references fit together.",
      "https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F",
      "Create a disposable repository, make two snapshots, and explain where the working tree, index, and history differ.",
      [
        t("Version control", "Version control records meaningful file changes over time so a team can compare, restore, and collaborate safely.", "git --version"),
        t("Distributed version control", "Every normal Git clone contains repository history, so most inspection and commit work happens locally.", "git clone https://example.com/team/app.git"),
        t("Repository & working tree", "The repository stores Git history and metadata; the working tree is the checked-out set of files you edit.", "git rev-parse --show-toplevel"),
        t("Snapshot model", "A commit records a snapshot of tracked content plus metadata and parent links rather than merely saving a list of edit commands.", "git show --stat HEAD"),
        t("Git objects", "Blobs store file content, trees describe directories, commits point to trees and parents, and annotated tags name objects with metadata.", "git cat-file -t HEAD"),
        t("References & HEAD", "Branches and tags are readable references to objects, while HEAD identifies the currently checked-out branch or commit.", "git symbolic-ref --short HEAD"),
        t("Working tree, index & repository", "Edits begin in the working tree, selected content enters the index, and commit stores that staged snapshot in the repository.", "working tree -> git add -> index -> git commit -> repository")
      ], undefined, {
        title: "Git in 60 seconds",
        summary: "Git was created for fast, distributed Linux kernel development and grew into the version-control foundation used by projects of every size.",
        milestones: [
          { period: "1991-2002", title: "Patches & archives", description: "Early Linux kernel changes were shared as patches and archived files." },
          { period: "2002", title: "BitKeeper era", description: "The Linux kernel project adopted the distributed BitKeeper system for its development history." },
          { period: "2005-today", title: "Git is created", description: "Linus Torvalds created Git after BitKeeper access changed; the open-source system has continued to mature." }
        ],
        flow: "edit files -> stage a snapshot -> commit locally -> share with a remote"
      }),
    m(2, "Install, Configure & Get Help", "foundation",
      "Set up Git deliberately so new repositories, commits, editors, and credentials behave predictably.",
      "https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup",
      "Install Git, set repository-safe identity and defaults, then locate help for an unfamiliar command.",
      [
        t("Install & version", "Check the installed Git version before relying on newer commands or options.", "git --version"),
        t("Configuration scopes", "System, global, local, worktree, and command scopes layer configuration from broad defaults to narrow overrides.", "git config --show-origin --list"),
        t("Commit identity", "user.name and user.email become commit metadata; they are not authentication credentials for a hosting provider.", "git config --global user.name \"Ada Developer\"\ngit config --global user.email \"ada@example.com\""),
        t("Default branch name", "init.defaultBranch controls the initial branch name used by newly initialized repositories.", "git config --global init.defaultBranch main"),
        t("Editor & pager", "Git can use configured editor and pager programs for commit messages and long command output.", "git config --global core.editor \"code --wait\""),
        t("Aliases", "Aliases shorten repeated commands but should remain understandable to teammates and your future self.", "git config --global alias.graph \"log --oneline --graph --decorate --all\""),
        t("Built-in help", "Git exposes manual pages and concise option summaries directly from the command line.", "git help rebase\ngit rebase -h")
      ]),
    m(3, "Repositories & File States", "foundation",
      "Create or copy repositories and read the tracked, untracked, modified, staged, and ignored states correctly.",
      "https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository",
      "Initialize a sample project, classify every file state with status, and safely rename and remove tracked files.",
      [
        t("git init", "git init creates the .git directory that turns an existing folder into a repository.", "git init"),
        t("git clone", "git clone copies repository data, creates a working tree, and normally configures origin and a remote-tracking branch.", "git clone https://example.com/team/app.git app"),
        t("Tracked & untracked files", "Tracked files belong to a committed or staged snapshot; untracked files have not yet entered Git history.", "git status"),
        t("Modified & staged states", "A tracked file can have one version in HEAD, another in the index, and another in the working tree.", "git status --short"),
        t("Ignored files", "Ignore rules keep generated or local-only untracked paths out of ordinary status and add operations.", "git status --ignored"),
        t("Moving tracked files", "git mv stages a delete at the old path and an add at the new path; Git later detects the rename from content similarity.", "git mv old-name.txt new-name.txt"),
        t("Removing tracked files", "git rm removes a path from the working tree and stages its removal; --cached keeps the local file.", "git rm --cached local.env")
      ]),
    m(4, "Staging & Commits", "foundation",
      "Shape small, reviewable snapshots with intentional staging and useful commit messages.",
      "https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository",
      "Split mixed edits into two atomic commits and verify the exact staged diff before each commit.",
      [
        t("Staging files", "git add stages the current content of selected paths; later edits remain unstaged until added again.", "git add src/App.java README.md"),
        t("Partial staging", "Patch mode lets you choose individual change hunks so unrelated edits do not enter the same commit.", "git add -p"),
        t("Reviewing the index", "git diff --staged shows the exact patch the next commit would record.", "git diff --staged"),
        t("Creating a commit", "A commit stores the staged tree, author and committer metadata, message, and parent relationship.", "git commit -m \"Add input validation\""),
        t("Good commit messages", "A useful subject states the change as a concise action; a body can explain motivation, constraints, and consequences.", "git commit\n# Add retry limit\n#\n# Prevent repeated provider calls after terminal failures."),
        t("Amending the latest commit", "Amend replaces the latest commit with a new one containing the current index and optionally a new message.", "git commit --amend --no-edit"),
        t("Atomic commits", "An atomic commit contains one coherent change that can be reviewed, reverted, or moved independently.", "git add -p\ngit commit -m \"Fix timeout handling\"")
      ]),
    m(5, "Inspect History & Changes", "core",
      "Read commit history and compare snapshots without changing repository state.",
      "https://git-scm.com/docs/git-log",
      "Trace when a behavior changed, inspect its patch, and summarize the files affected across a commit range.",
      [
        t("Commit log", "git log walks reachable commits and can limit results by author, date, message, path, or revision range.", "git log --oneline --decorate -10"),
        t("Graph view", "A graph view makes branch, merge, and tag relationships visible alongside abbreviated commits.", "git log --graph --oneline --decorate --all"),
        t("Inspecting one object", "git show displays an object; for a commit it includes metadata and the introduced patch.", "git show --stat HEAD"),
        t("Working-tree diff", "git diff compares unstaged working-tree content with the index by default.", "git diff"),
        t("Commit & range diff", "Two revisions can be compared directly; A..B selects commits reachable from B but not A for log-style traversal.", "git diff main...feature/login\ngit log main..feature/login"),
        t("File-level summaries", "Statistics and name-status views reveal scope before you inspect a full patch.", "git diff --stat main...HEAD\ngit diff --name-status main...HEAD"),
        t("Path history", "Adding -- before a path separates revisions from paths and narrows history to that file or directory.", "git log --follow -- src/UserService.java")
      ]),
    m(6, "Branches, HEAD & Switching", "core",
      "Use lightweight branches confidently and understand exactly what switching changes.",
      "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell",
      "Create a feature branch, make it track a remote branch, inspect divergence, and remove it safely after integration.",
      [
        t("Branch references", "A local branch is a movable reference to a commit, not a separate copy of project files.", "git branch --show-current"),
        t("HEAD", "HEAD normally points symbolically to the current branch, whose reference advances when you commit.", "git symbolic-ref HEAD"),
        t("Create & switch", "git switch -c creates a branch at the chosen start point and checks it out in one step.", "git switch -c feature/login main"),
        t("Detached HEAD", "Checking out a commit directly detaches HEAD; new commits remain recoverable but are not kept by a branch unless you create one.", "git switch --detach v1.2.0"),
        t("Rename & delete branches", "Rename updates a local branch name; safe deletion refuses while commits remain unmerged.", "git branch -m old-name better-name\ngit branch -d merged-branch"),
        t("Upstream branches", "An upstream connects a local branch to the remote-tracking branch used by status, pull, and argument-free push behavior.", "git branch --set-upstream-to=origin/main main"),
        t("Merge base", "The merge base is a best common ancestor used to reason about where two lines of development diverged.", "git merge-base main feature/login")
      ]),
    m(7, "Merging", "core",
      "Integrate branch histories and recognize fast-forward, three-way, and explicit merge commits.",
      "https://git-scm.com/docs/git-merge",
      "Merge two sample branches using fast-forward and non-fast-forward cases, then inspect the resulting graph.",
      [
        t("Fast-forward merge", "If the current branch is an ancestor of the other branch, Git can advance its reference without creating a merge commit.", "git merge --ff-only feature/docs"),
        t("Three-way merge", "Diverged branches require Git to combine both tips using their common ancestor as the baseline.", "git merge feature/login"),
        t("Merge commits", "A merge commit has multiple parents and records that histories were integrated at that point.", "git show --no-patch --pretty=raw HEAD"),
        t("No-fast-forward", "--no-ff preserves an explicit integration commit even when a fast-forward would be possible.", "git merge --no-ff feature/payments"),
        t("Merge strategy options", "Strategy options such as renormalization or favoring one side affect how specific conflicts are resolved; they do not replace review.", "git merge -Xrenormalize feature/line-endings"),
        t("Merge preview", "Fetch and compare the candidate branch before merging so scope and test expectations are understood.", "git fetch origin\ngit log --oneline HEAD..origin/main\ngit diff --stat HEAD...origin/main"),
        t("Abort a merge", "When a merge cannot be completed safely, --abort attempts to restore the pre-merge state.", "git merge --abort")
      ]),
    m(8, "Remotes & Collaboration", "core",
      "Exchange commits and references with other repositories while keeping fetch, merge, and push responsibilities clear.",
      "https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes",
      "Add a remote, fetch it, compare remote-tracking history, publish a branch, and prune obsolete references.",
      [
        t("Remote repositories", "A remote is a named set of URLs and refspecs for another repository; origin is only a conventional name.", "git remote -v"),
        t("Adding & changing remotes", "Remote commands manage fetch and push URLs without altering existing commit objects.", "git remote add upstream https://example.com/open/project.git"),
        t("Fetch", "git fetch downloads objects and updates configured remote-tracking references without integrating them into your current branch.", "git fetch origin"),
        t("Remote-tracking branches", "A name such as origin/main records the last fetched position of main in the origin repository.", "git log --oneline main..origin/main"),
        t("Pull", "git pull fetches and then integrates according to configuration, usually with merge or rebase; fetch-first is easier to inspect.", "git pull --ff-only"),
        t("Push & upstream", "Push sends objects and updates allowed remote references; -u records the upstream for later status and push commands.", "git push -u origin feature/login"),
        t("Pruning stale references", "Pruning removes remote-tracking references whose source branches were deleted from the remote.", "git fetch --prune origin")
      ]),
    m(9, "Rebase & Cherry-pick", "core",
      "Replay commits intentionally to update or refine a branch without confusing shared collaborators.",
      "https://git-scm.com/book/en/v2/Git-Branching-Rebasing",
      "Rebase a private feature branch onto updated main, squash fixups interactively, and move one isolated fix with cherry-pick.",
      [
        t("Rebase model", "Rebase finds commits unique to a branch and reapplies their changes onto a new base, producing new commit IDs.", "git rebase main"),
        t("Rebase onto", "--onto precisely selects a new base, an old base boundary, and the branch whose commits should move.", "git rebase --onto release old-base feature"),
        t("Interactive rebase", "Interactive rebase can reorder, edit, combine, relabel, or remove commits before they are shared.", "git rebase -i HEAD~5"),
        t("Squash, fixup & reword", "squash combines messages, fixup discards the later message, and reword changes a message while preserving its patch.", "git commit --fixup HEAD~2\ngit rebase -i --autosquash HEAD~5"),
        t("Continue, skip & abort", "After resolving a rebase stop, continue records the resolution; skip omits that patch; abort restores the original branch.", "git rebase --continue\n# or: git rebase --abort"),
        t("Cherry-pick", "Cherry-pick applies the change introduced by selected commits onto the current branch as new commits.", "git cherry-pick a1b2c3d"),
        t("Public-history rule", "Avoid rebasing commits others already depend on unless the team coordinates the rewrite and uses force-with-lease safely.", "git push --force-with-lease origin feature/login")
      ]),
    m(10, "Undoing & Recovery", "core",
      "Choose restore, reset, revert, reflog, or clean according to whether work is staged, committed, shared, or untracked.",
      "https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things",
      "Recover a discarded branch in a disposable repository and demonstrate a safe public revert without rewriting shared history.",
      [
        t("Restore working-tree changes", "git restore replaces selected working-tree content from the index or another source; uncommitted edits can be lost.", "git restore -- src/App.java"),
        t("Unstage with restore", "--staged copies the selected path from HEAD into the index while leaving the working-tree edit intact.", "git restore --staged src/App.java"),
        t("Reset modes", "--soft moves the branch only, default mixed reset also resets the index, and --hard also replaces working-tree content.", "git reset --soft HEAD~1"),
        t("Revert shared commits", "git revert creates a new commit that applies the inverse of an earlier commit, preserving published history.", "git revert a1b2c3d"),
        t("Reflog", "Reflogs record recent local reference movements and often reveal commits no longer named by a branch.", "git reflog --date=local"),
        t("Recovering a lost commit", "Once a commit ID is found in the reflog, create a branch immediately to keep it reachable.", "git branch recovery/accidental-reset a1b2c3d"),
        t("Cleaning untracked files", "git clean permanently removes untracked paths; preview with -n and include ignored files only with deliberate scope.", "git clean -nd\n# review before: git clean -fd")
      ]),
    m(11, "Tags, Releases & Archives", "backend",
      "Name release points, verify them, describe nearby builds, and export source snapshots.",
      "https://git-scm.com/book/en/v2/Git-Basics-Tagging",
      "Create an annotated release tag, push only that tag, generate a version string, and export a source archive.",
      [
        t("Lightweight tags", "A lightweight tag is a fixed reference directly to an object, useful as a simple private marker.", "git tag v1.2.0-rc1"),
        t("Annotated tags", "An annotated tag is its own object with tagger, date, message, and optional signature; releases usually benefit from this metadata.", "git tag -a v1.2.0 -m \"Release 1.2.0\""),
        t("List & filter tags", "Tag patterns and sorting make version families easier to inspect in a repository with many releases.", "git tag -l \"v1.*\" --sort=-version:refname"),
        t("Inspect a tag", "git show reveals annotated-tag metadata and the referenced commit or object.", "git show v1.2.0"),
        t("Push tags deliberately", "Tags are not automatically pushed with normal branch updates; publish a named tag or intentionally use --follow-tags.", "git push origin v1.2.0"),
        t("Describe builds", "git describe derives a readable identifier from the nearest reachable annotated tag plus later commit distance.", "git describe --tags --always --dirty"),
        t("Source archives", "git archive exports tracked content from a tree without repository metadata or ignored working files.", "git archive --format=zip --output=app-v1.2.0.zip v1.2.0")
      ]),
    m(12, "Ignore Rules, Attributes & Line Endings", "backend",
      "Keep generated files out of commits and make path-specific content behavior consistent across platforms.",
      "https://git-scm.com/docs/gitignore",
      "Design project and personal ignore rules, diagnose one ignored path, and normalize text line endings with attributes.",
      [
        t(".gitignore patterns", "A repository .gitignore shares rules for intentionally untracked files such as build output, caches, and local configuration.", "# .gitignore\ntarget/\n*.log\n.env"),
        t("Negation & directories", "A leading ! re-includes a path when its parent directory remains visible; a trailing slash targets directories.", "logs/\n!logs/.gitkeep"),
        t("Ignore precedence", "Command-line rules, per-directory .gitignore files, repository excludes, and global excludes apply with defined precedence.", "git config --global core.excludesFile ~/.config/git/ignore"),
        t("Tracked files are not ignored", "Ignore rules affect untracked paths; remove an already tracked secret or generated file from the index separately.", "git rm --cached .env"),
        t("Diagnose ignore rules", "check-ignore reports the exact pattern and source file responsible for ignoring a path.", "git check-ignore -v build/output.log"),
        t(".gitattributes", "Attributes assign text, diff, merge, export, and filter behavior to path patterns under version control.", "# .gitattributes\n*.java text diff=java\n*.png binary"),
        t("Line-ending normalization", "A text attribute with an explicit eol keeps repository content normalized while checking out suitable platform line endings.", "# .gitattributes\n* text=auto\n*.sh text eol=lf\n*.bat text eol=crlf")
      ]),
    m(13, "Stash & Multiple Worktrees", "backend",
      "Temporarily set work aside or check out another branch without mixing unrelated changes.",
      "https://git-scm.com/docs/git-stash",
      "Pause an unfinished change, fix an urgent issue in a second worktree, then restore the original work safely.",
      [
        t("Create a named stash", "stash push saves tracked working-tree and index changes as stash commits and resets them from the worktree.", "git stash push -m \"WIP login validation\""),
        t("List & inspect stashes", "Stashes are reflog entries; inspect their summary or patch before choosing one to restore.", "git stash list\ngit stash show -p stash@{0}"),
        t("Apply vs pop", "apply restores a stash without deleting it; pop removes it only after a successful application.", "git stash apply stash@{0}"),
        t("Include untracked files", "-u also stashes untracked files, while ignored files remain unless the stronger --all option is used.", "git stash push -u -m \"WIP with new files\""),
        t("Branch from a stash", "stash branch creates a branch at the stash's original base and applies the work where it is least likely to conflict.", "git stash branch recover/login stash@{0}"),
        t("Add a worktree", "A linked worktree checks out another branch in a separate directory while sharing the same repository object database.", "git worktree add ../app-hotfix -b hotfix/session main"),
        t("Manage worktrees", "List linked worktrees before removing one; removal refuses when uncommitted work would be lost unless forced.", "git worktree list\ngit worktree remove ../app-hotfix")
      ]),
    m(14, "Search, Blame & Bisect", "backend",
      "Use repository history as a debugging tool instead of manually scanning files and commits.",
      "https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git",
      "Locate when a constant changed, identify the responsible line history, and bisect a reproducible regression.",
      [
        t("Search tracked content", "git grep searches tracked content quickly and can limit matches by revision, path, context, or pattern type.", "git grep -n \"timeoutSeconds\""),
        t("Pickaxe string search", "git log -S finds commits where the number of occurrences of an exact string changed.", "git log -S\"MAX_RETRIES\" --oneline -- src/"),
        t("Regex diff search", "git log -G finds commits whose patch contains added or removed lines matching a regular expression.", "git log -G\"timeout.*=\" -p -- src/"),
        t("Line attribution", "git blame shows the last commit that changed each selected line, providing a starting point rather than assigning personal fault.", "git blame -L 40,65 src/App.java"),
        t("Binary search for regressions", "git bisect repeatedly checks a midpoint between known good and bad revisions to isolate the first bad commit.", "git bisect start\ngit bisect bad\ngit bisect good v1.1.0"),
        t("Automated bisect", "bisect run executes a deterministic command at each candidate commit and classifies zero as good and nonzero as bad.", "git bisect run ./gradlew test --tests LoginTest"),
        t("Compare patch series", "range-diff compares two versions of a commit series, useful after rebasing or revising a review branch.", "git range-diff origin/main...feature-v1 origin/main...feature-v2")
      ]),
    m(15, "Conflict Resolution", "backend",
      "Resolve content and structural conflicts deliberately during merge, rebase, cherry-pick, and stash operations.",
      "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging",
      "Create a controlled conflict, inspect all three index stages, resolve it, verify the result, and finish the operation.",
      [
        t("Why conflicts happen", "A conflict occurs when Git cannot safely combine changes, such as overlapping edits or competing delete and modify operations.", "git status"),
        t("Conflict markers", "Text conflicts mark the current side, separator, and incoming side; edit the file into the single intended result.", "<<<<<<< HEAD\ncurrent change\n=======\nincoming change\n>>>>>>> feature"),
        t("Index conflict stages", "During a merge conflict the index can hold the common base, ours, and theirs as stages 1, 2, and 3.", "git ls-files -u"),
        t("Ours & theirs context", "The meaning of ours and theirs depends on the operation, especially during rebase, so confirm before choosing a side wholesale.", "git checkout --ours -- path/to/file\ngit checkout --theirs -- path/to/file"),
        t("Marking resolution", "After editing and testing the final content, git add replaces unmerged index stages with the resolved version.", "git add path/to/file\ngit diff --check"),
        t("Continue the operation", "Merge is completed with commit, while rebase and cherry-pick use their respective --continue commands.", "git commit\n# or: git rebase --continue"),
        t("Reuse recorded resolution", "rerere can remember how a conflict was resolved and propose the same resolution when an identical conflict returns.", "git config --global rerere.enabled true")
      ]),
    m(16, "Submodules, Large Repositories & Portability", "advanced",
      "Compose repositories carefully and reduce checkout cost when projects or binary assets become large.",
      "https://git-scm.com/docs/gitsubmodules",
      "Add a pinned library submodule, clone it recursively, and compare submodules with sparse checkout and Git LFS trade-offs.",
      [
        t("Submodule model", "A submodule entry records a specific commit from another repository, while .gitmodules records its path and URL.", "git submodule status"),
        t("Add a submodule", "submodule add clones the child repository and stages both its gitlink entry and .gitmodules configuration.", "git submodule add https://example.com/team/shared.git libs/shared"),
        t("Clone recursively", "--recurse-submodules initializes and checks out nested repositories at the commits recorded by the parent.", "git clone --recurse-submodules https://example.com/team/app.git"),
        t("Initialize & update", "Existing clones use update --init --recursive to populate missing submodules at the commits selected by the parent repository.", "git submodule update --init --recursive"),
        t("Pinned dependency updates", "Updating a submodule means checking out a newer child commit and committing the changed gitlink in the parent.", "git -C libs/shared fetch\ngit -C libs/shared switch --detach v2.0.0\ngit add libs/shared"),
        t("Sparse checkout", "Sparse checkout materializes only selected paths in the working tree while the repository can still contain broader history.", "git sparse-checkout set src docs"),
        t("Git LFS", "Git LFS stores small pointer files in Git while large content is transferred through separate LFS storage supported by the remote.", "git lfs track \"*.psd\"\ngit add .gitattributes")
      ]),
    m(17, "Hooks, Signing & Security", "advanced",
      "Automate local checks, verify history, protect credentials, and understand where Git trust ends.",
      "https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks",
      "Create a fast pre-commit check, sign one commit in a disposable repository, and document secret-handling rules for the team.",
      [
        t("Client-side hooks", "Hooks such as pre-commit and commit-msg run locally at lifecycle points but are not copied automatically by clone.", ".git/hooks/pre-commit\n#!/bin/sh\n./gradlew test"),
        t("Server-side hooks", "Receiving repositories can use pre-receive, update, and post-receive hooks to enforce or react to pushed reference changes.", "hooks/pre-receive\n#!/bin/sh\n# validate proposed ref updates"),
        t("Hook portability", "Teams should version hook source in the repository and install it explicitly rather than assuming .git/hooks is shared.", "git config core.hooksPath .githooks"),
        t("Signed commits", "A signed commit attaches a cryptographic signature that others can verify when they trust the corresponding identity.", "git commit -S -m \"Release security fix\""),
        t("Signed tags", "Signing an annotated release tag protects tag metadata and the object it references from unnoticed substitution.", "git tag -s v1.2.0 -m \"Release 1.2.0\""),
        t("Verify signatures", "Verification checks signature validity and reports the signing key; trust policy still belongs to the project.", "git verify-commit HEAD\ngit verify-tag v1.2.0"),
        t("Secrets & credentials", "Never commit passwords, tokens, or private keys; rotation is required even if leaked history is later rewritten.", "git grep -n -I -E \"(api[_-]?key|password|secret)\" --cached")
      ]),
    m(18, "Team Workflows & CI/CD", "advanced",
      "Turn Git mechanics into a reviewable team workflow with protected integration and reproducible delivery.",
      "https://git-scm.com/docs/gitworkflows",
      "Design a small-team workflow from issue and branch through review, tested merge, immutable release tag, and rollback.",
      [
        t("Feature-branch workflow", "Short-lived branches isolate one change for review and are deleted after their commits reach the integration branch.", "git switch -c feature/42-session-timeout main"),
        t("Trunk-based development", "Trunk-based teams integrate small changes frequently and use tests or feature flags to keep the main branch releasable.", "git fetch origin\ngit rebase origin/main"),
        t("Pull requests & code review", "Hosting-platform reviews discuss a proposed branch integration; Git itself provides the commits and comparison underneath.", "git push -u origin feature/42-session-timeout"),
        t("Reviewable commit series", "A clean series orders prerequisite changes first and keeps mechanical refactoring separate from behavior changes.", "git log --reverse --oneline origin/main..HEAD"),
        t("Protected integration", "Remote branch rules can require review, passing checks, and non-force updates before accepting changes to critical branches.", "git push origin HEAD:refs/heads/main"),
        t("CI by commit identity", "CI should build and report against an exact commit SHA so results can be tied to immutable source history.", "git rev-parse HEAD"),
        t("Release & rollback", "Create releases from reviewed commits and prefer a new revert commit or a prior immutable artifact when rolling back shared production history.", "git tag -a v1.2.0 -m \"Release 1.2.0\"\ngit push origin v1.2.0")
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
    const comment = item.comment || gitExampleComment(item);
    groupedExamples[item.name] = [[item.name, item.code, comment]];
    exampleComments[item.name] = comment;
  }));

  window.QUICKDEV_COURSE = {
    key: "git",
    name: "Git",
    mark: "Git",
    modules,
    quickNotes,
    groupedExamples,
    exampleComments,
    pageTitle: "Git at a Glance | QuickDevBase",
    pageDescription: "QuickDevBase Git - concise explanations, practical commands, recovery guidance, team workflows, and links to the official Git documentation.",
    heroEyebrow: "Git knowledge, at a glance",
    heroTitle: "Git, without<br>the <em>branching confusion.</em>",
    heroLede: "Insights for your first commit through branches, collaboration, recovery, internals, security, and delivery. Every module points to the official Git documentation for depth.",
    previewLabel: "GIT.WORKFLOW",
    previewCode: [
      '<span><b class="code-blue">git</b> switch -c feature/login</span>',
      '<span><b class="code-blue">git</b> add -p</span>',
      '<span><b class="code-pink">git</b> commit -m "Add login validation"</span>',
      '<span><b class="code-pink">git</b> push -u origin feature/login</span>'
    ].join(""),
    chipOne: "126 Git concepts",
    chipTwo: "Official docs linked",
    curriculumTitle: "One glance. Every Git essential.",
    curriculumLede: "Understand the mental model, practise each command in a disposable repository, and use the official documentation for exact options and edge cases.",
    searchPlaceholder: "Search topics, e.g. rebase",
    certificateTitleHtml: "Git Topics<br>at a Glance",
    completionNoun: "Git learner",
    trademark: "Git is a trademark of Software Freedom Conservancy. QuickDevBase is not affiliated with or endorsed by the Git project or Software Freedom Conservancy.",
    stageLabels: {
      foundation: "Foundation",
      core: "Daily Git",
      backend: "Collaboration",
      advanced: "Advanced & Delivery"
    },
    fallbackNote: "A practical Git concept worth understanding before changing shared repository history.",
    fallbackCode: "# Practise this command in a disposable repository first."
  };
}());
