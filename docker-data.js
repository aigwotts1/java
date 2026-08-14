(function () {
  "use strict";

  const t = (name, note, label, code, examples) => ({ name, note, label, code, examples });
  const m = (id, title, stage, description, officialUrl, challenge, topics, shortTitle) => ({
    id, title, stage, description, officialUrl, officialLabel: "Official Docker documentation", challenge, topics, shortTitle
  });

  const source = [
    m(1, "Docker Foundations", "foundation",
      "Understand what Docker solves and how its main parts work together.",
      "https://docs.docker.com/get-started/docker-overview/",
      "Explain the path from typing docker run to a running isolated process.",
      [
        t("Containers vs virtual machines", "Containers share the host kernel and isolate processes; VMs boot a complete guest operating system.", "CONTAINER", "docker run --rm alpine echo hello"),
        t("Docker client", "The docker command is a client that sends API requests to a Docker daemon.", "CLIENT", "docker version"),
        t("Docker daemon", "dockerd builds images, creates networks and volumes, and manages container lifecycle.", "DAEMON", "docker info"),
        t("Docker objects", "Images are templates; containers are runnable instances; networks and volumes connect and persist them.", "OBJECTS", "docker image ls\ndocker container ls"),
        t("Registries", "A registry stores and distributes tagged or digest-addressed images.", "REGISTRY", "docker pull docker.io/library/nginx:alpine"),
        t("Namespaces and cgroups", "Namespaces isolate what a process can see; cgroups limit and account for resources it can use.", "ISOLATION", "docker run --memory 256m --cpus 0.5 alpine"),
        t("OCI and containerd", "OCI defines interoperable image/runtime standards while containerd handles lower-level container lifecycle for Docker.", "RUNTIME", "docker info --format '{{json .DriverStatus}}'")
      ]),
    m(2, "Install & Configure", "foundation",
      "Set up Docker Desktop or Engine and verify the environment before building.",
      "https://docs.docker.com/engine/install/",
      "Install Docker for your operating system, run hello-world, and inspect the active context.",
      [
        t("Docker Desktop", "Desktop bundles the Engine, CLI, Compose, BuildKit, and a graphical dashboard for local development.", "DESKTOP", "docker desktop status"),
        t("Docker Engine", "Engine is the daemon-led container runtime commonly installed directly on Linux servers.", "ENGINE", "docker info --format '{{.ServerVersion}}'"),
        t("Docker CLI", "The CLI exposes commands and built-in help for objects such as containers, images, and networks.", "CLI", "docker --help"),
        t("Hello-world verification", "The hello-world image verifies that the client can reach the daemon and pull and run an image.", "VERIFY", "docker run --rm hello-world"),
        t("Docker contexts", "A context stores connection settings so one CLI can target local or remote Docker endpoints.", "CONTEXT", "docker context ls\ndocker context use default"),
        t("Version compatibility", "docker version shows client and server versions separately, which helps reveal API mismatches.", "VERSION", "docker version"),
        t("Daemon configuration", "daemon.json controls Engine-wide settings such as logging, registries, and data location.", "CONFIG", "docker info")
      ]),
    m(3, "Container Lifecycle", "foundation",
      "Create, run, inspect, enter, stop, and remove containers confidently.",
      "https://docs.docker.com/reference/cli/docker/container/",
      "Run an Nginx container, inspect it, execute a command inside it, then stop and remove it.",
      [
        t("docker run", "run creates a container from an image and starts its configured process.", "RUN", "docker run --name web -d nginx:alpine"),
        t("create and start", "create prepares a stopped container; start runs that already-created container.", "CREATE / START", "docker create --name job alpine echo done\ndocker start -a job"),
        t("stop and kill", "stop asks the main process to exit gracefully before a timeout; kill sends a signal immediately.", "STOP / KILL", "docker stop web\ndocker kill web"),
        t("restart and remove", "restart cycles a container; rm deletes a stopped container and its writable layer.", "RESTART / RM", "docker restart web\ndocker rm -f web"),
        t("docker exec", "exec starts an additional command inside an already-running container.", "EXEC", "docker exec -it web sh"),
        t("logs and attach", "logs reads captured output; attach connects your terminal to the container's main process.", "LOGS / ATTACH", "docker logs --tail 50 -f web"),
        t("inspect, stats and top", "inspect returns configuration JSON; stats shows resource use; top lists container processes.", "OBSERVE", "docker inspect web\ndocker stats web\ndocker top web")
      ]),
    m(4, "Images & Layers", "foundation",
      "Read image names, layers, tags, and immutable digests without guesswork.",
      "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/",
      "Pull an image by tag, inspect its digest and history, retag it, then remove the extra tag.",
      [
        t("Image layers", "Each filesystem-changing build instruction creates a reusable read-only layer.", "LAYERS", "docker image history nginx:alpine"),
        t("Tags", "A tag is a movable human-friendly image reference, commonly used for versions.", "TAG", "docker tag myapp:latest myapp:1.0"),
        t("Digests", "A digest is an immutable content hash, so it identifies exactly one image manifest.", "DIGEST", "docker pull alpine@sha256:<digest>"),
        t("Pull and push", "pull downloads an image; push uploads a tagged image to a registry you can access.", "TRANSFER", "docker pull alpine:3.20\ndocker push username/myapp:1.0"),
        t("Image history", "history shows the commands and sizes that formed an image's layers.", "HISTORY", "docker history --no-trunc myapp:1.0"),
        t("Platform variants", "A manifest list can point one tag to architecture-specific images such as amd64 and arm64.", "PLATFORM", "docker pull --platform linux/arm64 alpine:3.20"),
        t("Image cleanup", "prune removes unused image data; review disk usage before reclaiming it.", "PRUNE", "docker system df\ndocker image prune")
      ]),
    m(5, "Dockerfile Essentials", "foundation",
      "Turn repeatable build instructions into a clear, maintainable image recipe.",
      "https://docs.docker.com/reference/dockerfile/",
      "Write a Dockerfile for a small application that runs as a non-root user.",
      [
        t("FROM", "FROM selects a base image and starts a build stage.", "FROM", "FROM node:22-alpine"),
        t("RUN", "RUN executes a build-time command and commits its filesystem result to a layer.", "RUN", "RUN npm ci --omit=dev"),
        t("COPY and ADD", "COPY transfers local build-context files; ADD has extra archive and URL behavior and should be intentional.", "COPY", "COPY package*.json ./\nCOPY src ./src"),
        t("WORKDIR", "WORKDIR sets the directory used by later instructions and by the launched process.", "WORKDIR", "WORKDIR /app"),
        t("CMD and ENTRYPOINT", "ENTRYPOINT defines the executable while CMD supplies default arguments or the default command.", "STARTUP", "ENTRYPOINT [\"java\", \"-jar\"]\nCMD [\"app.jar\"]"),
        t("ARG and ENV", "ARG exists while building; ENV persists in the image and is available to the running container.", "VARIABLES", "ARG APP_VERSION\nENV NODE_ENV=production"),
        t("USER, EXPOSE and LABEL", "USER drops privileges, EXPOSE documents a port, and LABEL adds searchable metadata.", "METADATA", "USER 10001\nEXPOSE 8080\nLABEL org.opencontainers.image.title=\"api\"")
      ]),
    m(6, "BuildKit & Buildx", "core",
      "Use Docker's modern builder for caching, secrets, remote builders, and multiple platforms.",
      "https://docs.docker.com/build/buildkit/",
      "Create a buildx builder and produce an amd64 and arm64 image without copying secrets into a layer.",
      [
        t("BuildKit", "BuildKit is Docker's modern build backend and can skip unused work and run independent stages in parallel.", "BUILDKIT", "DOCKER_BUILDKIT=1 docker build ."),
        t("Build context", "The context is the file set a build may read; keep it small to make transfers and cache checks faster.", "CONTEXT", "docker build -f docker/Dockerfile ."),
        t(".dockerignore", ".dockerignore excludes files such as Git history, dependencies, and secrets from the build context.", "IGNORE", "node_modules\n.git\n.env"),
        t("Cache mounts", "A cache mount reuses package-manager data without placing that cache in the final image layer.", "CACHE MOUNT", "RUN --mount=type=cache,target=/root/.npm npm ci"),
        t("Secret mounts", "A secret mount exposes sensitive data only to one build step and does not bake it into the image.", "SECRET", "RUN --mount=type=secret,id=npmrc npm ci"),
        t("SSH mounts", "An SSH mount forwards an agent temporarily so a build can fetch private source without copying a key.", "SSH", "RUN --mount=type=ssh git clone git@github.com:org/repo.git"),
        t("buildx and multi-platform", "buildx manages advanced builders and can publish one tag containing multiple architecture variants.", "BUILDX", "docker buildx build --platform linux/amd64,linux/arm64 --push -t user/app:1.0 .")
      ]),
    m(7, "Multi-stage & Efficient Builds", "core",
      "Shrink attack surface and build time by separating compilation from runtime.",
      "https://docs.docker.com/build/building/multi-stage/",
      "Refactor a single-stage build so only the runtime artifact reaches the final image.",
      [
        t("Multi-stage builds", "Multiple FROM instructions create stages so build tools can stay out of the final runtime image.", "STAGES", "FROM golang:1.24 AS build\nRUN go build -o /out/app .\nFROM gcr.io/distroless/base\nCOPY --from=build /out/app /app"),
        t("Named stages", "AS gives a stage a stable name that COPY --from can reference even if stages are reordered.", "NAMED STAGE", "FROM node:22 AS build\nCOPY --from=build /app/dist /srv"),
        t("Target builds", "--target stops at a named stage, which is useful for testing or debugging intermediate output.", "TARGET", "docker build --target test -t myapp:test ."),
        t("Cache ordering", "Place stable dependency steps before frequently changing source so more layers remain reusable.", "ORDER", "COPY package*.json ./\nRUN npm ci\nCOPY . ."),
        t("Pinned base images", "A version tag or digest reduces surprise changes; a digest gives exact reproducibility.", "PIN", "FROM eclipse-temurin:21-jre@sha256:<digest>"),
        t("Small runtime images", "A focused runtime base contains fewer packages, downloads faster, and exposes fewer components.", "RUNTIME BASE", "FROM eclipse-temurin:21-jre-alpine"),
        t("Non-root runtime", "Create or select an unprivileged user so an exploited process has fewer host-facing powers.", "NON-ROOT", "RUN adduser -D -u 10001 app\nUSER 10001")
      ]),
    m(8, "Registries & Distribution", "core",
      "Name, authenticate, publish, and retrieve images safely across environments.",
      "https://docs.docker.com/docker-hub/repos/",
      "Tag a local image for a registry, authenticate securely, push it, and verify its digest.",
      [
        t("Docker Hub repositories", "A repository groups versions of an image under a registry namespace and name.", "REPOSITORY", "docker pull docker.io/library/postgres:17"),
        t("Image naming", "A complete reference can include registry host, namespace, repository, tag, and digest.", "REFERENCE", "registry.example.com/team/api:1.4.0"),
        t("docker login", "login stores or delegates registry credentials so pull and push can authenticate.", "LOGIN", "docker login registry.example.com --username alice"),
        t("Access tokens", "Use scoped tokens instead of account passwords, especially in automation.", "TOKEN", "echo \"$REGISTRY_TOKEN\" | docker login -u alice --password-stdin"),
        t("Private registries", "A private registry limits who may discover, pull, or push organization images.", "PRIVATE", "docker pull registry.example.com/team/api:1.4.0"),
        t("Credential stores", "A credential helper keeps registry secrets in an operating-system keychain instead of plain config.", "CREDENTIALS", "\"credsStore\": \"desktop\""),
        t("Registry mirrors", "A mirror caches upstream content closer to builders and can reduce latency or rate-limit pressure.", "MIRROR", "\"registry-mirrors\": [\"https://mirror.example.com\"]")
      ]),
    m(9, "Storage & Persistence", "core",
      "Choose the right mount for durable data, source code, or temporary memory.",
      "https://docs.docker.com/engine/storage/",
      "Persist database data in a named volume, inspect it, and describe how you would back it up.",
      [
        t("Writable container layer", "Changes not mounted elsewhere live in the container's disposable writable layer.", "WRITABLE LAYER", "docker diff web"),
        t("Named volumes", "Docker-managed volumes persist independently of a container and are the usual choice for application data.", "VOLUME", "docker volume create pgdata\ndocker run -v pgdata:/var/lib/postgresql/data postgres:17"),
        t("Bind mounts", "A bind mount exposes an exact host path, which is useful for source code but tightly couples host layout.", "BIND", "docker run --mount type=bind,src=\"$PWD\",dst=/work alpine"),
        t("tmpfs mounts", "A tmpfs keeps temporary data in host memory and does not persist it to the container layer.", "TMPFS", "docker run --tmpfs /run:rw,noexec,nosuid alpine"),
        t("--mount syntax", "--mount names source, target, type, and options explicitly and is easier to review than short syntax.", "MOUNT", "docker run --mount type=volume,src=data,dst=/data alpine"),
        t("Volume backup and restore", "A helper container can archive the mounted volume without installing backup tools in the application image.", "BACKUP", "docker run --rm -v data:/data -v \"$PWD\":/backup alpine tar czf /backup/data.tgz /data"),
        t("Shared and read-only data", "Multiple containers can mount the same data; use read-only mode for consumers that must not modify it.", "READ ONLY", "docker run --mount type=volume,src=config,dst=/config,readonly app")
      ]),
    m(10, "Container Networking", "core",
      "Connect services, publish ports, and use Docker's built-in service discovery.",
      "https://docs.docker.com/engine/network/",
      "Create a private network, connect an API and database by name, and publish only the API port.",
      [
        t("Bridge networks", "A bridge is the standard single-host network; user-defined bridges add automatic DNS by container name.", "BRIDGE", "docker network create app-net"),
        t("Port publishing", "-p maps a host address and port to a container port; EXPOSE alone does not publish it.", "PORT", "docker run -p 127.0.0.1:8080:80 nginx"),
        t("Container DNS", "On a user-defined network, containers resolve one another by name or network alias.", "DNS", "docker run --network app-net --name api my-api"),
        t("Host network", "Host mode removes network namespace isolation and lets the process use the host network directly.", "HOST", "docker run --network host metrics-agent"),
        t("None network", "None leaves a container with loopback only, useful when it needs no network access.", "NONE", "docker run --network none batch-job"),
        t("Overlay and macvlan", "Overlay joins services across Docker hosts; macvlan gives containers addresses on a physical network.", "DRIVERS", "docker network create --driver overlay service-net"),
        t("Internal networks and IPv6", "Internal networks block external routing; IPv6 can be enabled where daemon and network configuration support it.", "ISOLATE", "docker network create --internal backend")
      ]),
    m(11, "Docker Compose", "backend",
      "Define and operate a complete multi-container application in one readable YAML model.",
      "https://docs.docker.com/compose/",
      "Describe a web and database stack with health-aware startup, named storage, and an internal network.",
      [
        t("Compose application model", "Compose represents an application as services connected by networks and persistent resources.", "MODEL", "docker compose config"),
        t("services", "Each service defines how one application component is built or run.", "SERVICES", "services:\n  api:\n    image: example/api:1.0"),
        t("build and image", "build creates an image from source; image names the image to run or the tag assigned after building.", "BUILD", "services:\n  api:\n    build: .\n    image: example/api:dev"),
        t("ports, volumes and networks", "These sections declare host exposure, persistent mounts, and communication boundaries.", "RESOURCES", "ports: [\"8080:8080\"]\nvolumes: [\"data:/data\"]\nnetworks: [\"backend\"]"),
        t("environment and env files", "environment passes explicit values; env_file loads container variables from a file.", "ENVIRONMENT", "environment:\n  LOG_LEVEL: info\nenv_file: .env"),
        t("depends_on and health", "depends_on controls creation order and can wait for a dependency healthcheck, not just process start.", "DEPENDENCY", "depends_on:\n  db:\n    condition: service_healthy"),
        t("profiles and watch", "Profiles enable optional services; Compose Watch syncs or rebuilds as development files change.", "DEVELOP", "docker compose --profile debug up\ndocker compose watch")
      ]),
    m(12, "Runtime Configuration", "backend",
      "Control process behavior, resources, health, and restart policy without rebuilding.",
      "https://docs.docker.com/engine/containers/run/",
      "Run a service with a memory limit, healthcheck, restart policy, and read-only root filesystem.",
      [
        t("Environment variables", "-e supplies runtime configuration and overrides image ENV values without changing the image.", "ENV", "docker run -e LOG_LEVEL=debug app"),
        t("CPU and memory limits", "Resource flags stop one container from consuming unbounded host CPU or memory.", "LIMITS", "docker run --cpus 1.5 --memory 512m app"),
        t("Restart policies", "A restart policy tells the daemon when to relaunch a stopped container.", "RESTART", "docker run --restart unless-stopped app"),
        t("Healthchecks", "A healthcheck reports whether the service is functioning, independently of whether its process still exists.", "HEALTH", "HEALTHCHECK CMD curl -f http://localhost:8080/health || exit 1"),
        t("PID 1 and --init", "PID 1 handles signals and orphaned children specially; --init adds a small init process when needed.", "INIT", "docker run --init app"),
        t("Read-only root filesystem", "Read-only mode prevents writes to the image filesystem; add explicit writable mounts for required paths.", "READ ONLY", "docker run --read-only --tmpfs /tmp app"),
        t("Capabilities and sysctls", "Capabilities add or drop focused kernel privileges; sysctls tune allowed namespaced kernel parameters.", "KERNEL", "docker run --cap-drop ALL --cap-add NET_BIND_SERVICE app")
      ]),
    m(13, "Logs & Observability", "backend",
      "See what containers are doing and collect useful signals when something fails.",
      "https://docs.docker.com/engine/logging/",
      "Diagnose a restarting container using ps, logs, inspect, stats, and events in a sensible order.",
      [
        t("stdout and stderr", "Containers should usually write application logs to standard streams so Docker can collect them.", "STREAMS", "docker logs api"),
        t("Logging drivers", "A logging driver routes container output to json-file, local, journald, syslog, or another destination.", "DRIVER", "docker run --log-driver local app"),
        t("Log rotation", "Size and file limits stop local log files from silently filling the host disk.", "ROTATION", "docker run --log-opt max-size=10m --log-opt max-file=3 app"),
        t("Docker events", "events streams daemon activity such as create, start, die, network, and volume actions.", "EVENTS", "docker events --since 10m"),
        t("Resource stats", "stats reports live CPU, memory, network, block I/O, and process counts.", "STATS", "docker stats --no-stream"),
        t("Inspect and format", "inspect exposes low-level state and Go templates can select just the value you need.", "INSPECT", "docker inspect --format '{{.State.ExitCode}}' api"),
        t("Debugging tools", "exec can inspect a running container; docker debug can add tools without permanently bloating a slim image.", "DEBUG", "docker exec -it api sh")
      ]),
    m(14, "Container Security", "advanced",
      "Reduce privilege, protect the daemon, and make safer runtime boundaries the default.",
      "https://docs.docker.com/engine/security/",
      "Harden a container by dropping privileges, making filesystems read-only, and avoiding the Docker socket.",
      [
        t("Least privilege", "Grant only the users, mounts, networks, and kernel capabilities the process genuinely needs.", "LEAST PRIVILEGE", "docker run --cap-drop ALL --read-only app"),
        t("Rootless mode", "Rootless Docker runs daemon and containers without host root privileges, reducing daemon compromise impact.", "ROOTLESS", "dockerd-rootless-setuptool.sh install"),
        t("User namespaces", "User namespace remapping maps container root to an unprivileged host identity.", "USERNS", "\"userns-remap\": \"default\""),
        t("Seccomp", "The default seccomp profile blocks risky system calls while permitting common container workloads.", "SECCOMP", "docker run --security-opt seccomp=profile.json app"),
        t("AppArmor and SELinux", "Linux security modules add mandatory access rules beyond ordinary Unix permissions.", "LSM", "docker run --security-opt apparmor=docker-default app"),
        t("Docker socket risk", "Mounting docker.sock effectively grants control of the daemon and often the host; avoid it or proxy narrowly.", "SOCKET", "# Avoid: -v /var/run/docker.sock:/var/run/docker.sock"),
        t("Runtime secrets", "Provide secrets through a managed secret mechanism or temporary file, not an image layer or committed env file.", "SECRETS", "docker secret create db_password ./password.txt")
      ]),
    m(15, "Supply-chain Security", "advanced",
      "Inspect image contents, vulnerabilities, provenance, and policy before deployment.",
      "https://docs.docker.com/scout/",
      "Generate an SBOM, review critical CVEs, and explain why a signed provenance record matters.",
      [
        t("Docker Scout", "Scout analyzes image components and compares them with vulnerability and policy data.", "SCOUT", "docker scout quickview example/api:1.0"),
        t("SBOM", "A software bill of materials lists the packages and components present in an image.", "SBOM", "docker scout sbom example/api:1.0"),
        t("CVE analysis", "CVE reports connect vulnerable packages with severity and available fixes.", "CVES", "docker scout cves --only-severity critical,high example/api:1.0"),
        t("Base image refresh", "Rebuilding with a patched base can remove inherited vulnerabilities even when app code is unchanged.", "REFRESH", "docker build --pull --no-cache -t example/api:1.0.1 ."),
        t("Provenance attestations", "Provenance records how and where an image was built so consumers can verify its origin.", "PROVENANCE", "docker buildx build --provenance=mode=max --push -t example/api:1.0 ."),
        t("SBOM attestations", "An SBOM attestation travels alongside the image manifest in the registry.", "ATTEST", "docker buildx build --sbom=true --push -t example/api:1.0 ."),
        t("Policy gates", "A CI policy can block release when images violate approved base, severity, or freshness rules.", "POLICY", "docker scout policy example/api:1.0")
      ]),
    m(16, "Developer Workflow", "advanced",
      "Use Docker for fast, repeatable local development without hiding feedback.",
      "https://docs.docker.com/guides/",
      "Design a local workflow where source changes are synced but dependencies and database data remain cached.",
      [
        t("Development containers", "A development container standardizes tools and dependencies while the editor stays connected to the workspace.", "DEV CONTAINER", "docker run --rm -it -v \"$PWD\":/workspace dev-image"),
        t("Bind-mounted source", "Mounting source gives immediate file changes without rebuilding every edit.", "SOURCE", "docker run -v \"$PWD/src\":/app/src app:dev"),
        t("Compose overrides", "An additional Compose file can layer development-only ports, mounts, or commands onto a shared base.", "OVERRIDE", "docker compose -f compose.yaml -f compose.dev.yaml up"),
        t("Compose Watch", "Watch can sync files, restart a service, or rebuild when selected paths change.", "WATCH", "docker compose watch"),
        t("Hot reload", "A language-specific watcher reloads the process when mounted or synced source changes.", "RELOAD", "command: npm run dev"),
        t("Ephemeral test environments", "Disposable Compose projects make integration tests repeatable and easy to tear down.", "TEST STACK", "docker compose -p test-$BUILD_ID up --abort-on-container-exit"),
        t("Build Cloud and remote builders", "Remote builders can share cache and powerful build capacity while the developer keeps a local CLI.", "REMOTE BUILD", "docker buildx ls")
      ]),
    m(17, "CI/CD & Publishing", "advanced",
      "Build once, test predictably, and publish immutable images through automation.",
      "https://docs.docker.com/build/ci/",
      "Outline a pipeline that tests, builds, scans, and pushes a commit-tagged multi-platform image.",
      [
        t("Pipeline stages", "Separate test, build, scan, and publish steps so failures stop promotion at the right boundary.", "PIPELINE", "test -> build -> scan -> push -> deploy"),
        t("Immutable version tags", "Tag releases with a commit or version; do not depend on latest as the only production identity.", "TAGGING", "docker tag api qdb/api:$GIT_SHA"),
        t("Registry authentication in CI", "Use short-lived or scoped secrets and password-stdin so tokens do not appear in command arguments.", "CI LOGIN", "echo \"$TOKEN\" | docker login -u \"$USER\" --password-stdin"),
        t("Build cache in CI", "Export and import BuildKit cache so clean runners can reuse expensive dependency layers.", "CI CACHE", "docker buildx build --cache-from type=registry,ref=qdb/api:cache --cache-to type=registry,ref=qdb/api:cache,mode=max ."),
        t("Multi-platform publishing", "A buildx push can publish architecture variants and their manifest list in one operation.", "PUBLISH", "docker buildx build --platform linux/amd64,linux/arm64 --push -t qdb/api:1.0 ."),
        t("GitHub Actions integration", "Docker's maintained actions set up Buildx, authenticate, generate metadata, and build and push.", "ACTIONS", "uses: docker/build-push-action@v6"),
        t("Promotion by digest", "Promote the tested digest between environments so deployment cannot drift to different bytes.", "PROMOTE", "image: qdb/api@sha256:<tested-digest>")
      ]),
    m(18, "Production & Swarm", "advanced",
      "Operate services across nodes with controlled rollout, scale, configuration, and recovery.",
      "https://docs.docker.com/engine/swarm/",
      "Deploy a replicated service with a secret, health-aware rolling update, and safe rollback plan.",
      [
        t("Swarm nodes", "A swarm groups Engines into manager and worker nodes with an encrypted control plane.", "SWARM", "docker swarm init"),
        t("Services and tasks", "A service declares desired state; the orchestrator schedules individual task containers to match it.", "SERVICE", "docker service create --name web --replicas 3 nginx:alpine"),
        t("Stacks", "A stack deploys a group of services, networks, configs, and secrets from a Compose-style file.", "STACK", "docker stack deploy -c compose.yaml shop"),
        t("Overlay networking", "An overlay network lets swarm services communicate across nodes and supports routing mesh ingress.", "OVERLAY", "docker network create --driver overlay backend"),
        t("Scaling and placement", "Replica counts and placement constraints control capacity and where tasks may run.", "SCALE", "docker service scale web=6"),
        t("Rolling updates and rollback", "Update settings control parallelism and delay; rollback restores the previous service specification.", "UPDATE", "docker service update --image nginx:1.28 --update-parallelism 2 web\ndocker service rollback web"),
        t("Swarm secrets and configs", "Secrets are encrypted in the swarm and mounted only into authorized tasks; configs hold non-sensitive files.", "SWARM CONFIG", "docker secret create db_password ./password.txt\ndocker service create --secret db_password app")
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
    exampleComments[item.label] = item.note;
  }));

  window.QUICKDEV_COURSE = {
    key: "docker",
    name: "Docker",
    mark: "D",
    modules,
    quickNotes,
    groupedExamples,
    exampleComments,
    pageTitle: "Docker at a Glance | QuickDevBase",
    pageDescription: "QuickDevBase Docker — fast explanations for Docker essentials, with direct links to the official Docker documentation.",
    heroEyebrow: "Docker knowledge, at a glance",
    heroTitle: "Docker, without<br>the <em>container confusion.</em>",
    heroLede: "Scan the essentials from your first container to secure production delivery. Every module links directly to Docker's official documentation for full detail.",
    previewLabel: "DOCKER.RUN",
    previewCode: [
      '<span><b class="code-pink">FROM</b> node:22-alpine</span>',
      '<span><b class="code-blue">WORKDIR</b> /app</span>',
      '<span><b class="code-blue">COPY</b> . .</span>',
      '<span><b class="code-pink">CMD</b> ["npm", "start"]</span>'
    ].join(""),
    chipOne: "✓ Image ready",
    chipTwo: "⌁ Keep shipping",
    curriculumTitle: "One glance. Every Docker essential.",
    curriculumLede: "Start anywhere, learn the mental model, then use the official Docker docs when you need depth.",
    searchPlaceholder: "Search topics, e.g. volumes",
    certificateTitleHtml: "Docker Developer<br>Knowledge Path",
    completionNoun: "Docker developer",
    trademark: "Independent educational project—not affiliated with or endorsed by Docker, Inc. Docker and the Docker logo are trademarks or registered trademarks of Docker, Inc.",
    stageLabels: {
      foundation: "Foundation",
      core: "Images & Runtime",
      backend: "Operations",
      advanced: "Production"
    },
    fallbackNote: "A practical Docker concept to understand before operating containers in real environments.",
    fallbackCode: "# Try the command in a disposable local environment."
  };
}());
