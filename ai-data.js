(function () {
  "use strict";

  const t = (name, note, code, comment) => ({ name, note, code, comment });
  const m = (id, title, stage, description, officialUrl, challenge, topics, shortTitle) => ({
    id, title, stage, description, officialUrl, challenge, topics, shortTitle
  });

  function defaultExampleComment(item) {
    const concept = item.name.toLowerCase();
    const code = item.code.trim();

    if (code.includes("->")) {
      return `Read this sketch from left to right: the input moves through the shown stages to demonstrate ${concept}.`;
    }
    if (/^if\b/m.test(code)) {
      return `This condition is the decision point: the indented action runs only when the ${concept} check passes.`;
    }
    if (/^[A-Za-z_][\w.]*\s*=/.test(code)) {
      return `The name on the left stores the value produced or configured on the right, making ${concept} concrete.`;
    }
    if (/[A-Za-z_][\w.]*\([^\n]*\)/.test(code)) {
      return `This calls the shown operation with concrete inputs so you can see where ${concept} happens in the workflow.`;
    }
    return `This shorthand shows the concrete action, setting, or result an implementation uses for ${concept}.`;
  }

  function buildCourse(meta, source) {
    const modules = source.map((module) => ({
      ...module,
      officialLabel: module.officialLabel || meta.officialLabel,
      topics: module.topics.map((item) => item.name)
    }));
    const quickNotes = Object.fromEntries(source.map((module) => [
      module.id,
      module.topics.map((item) => [item.note, item.code])
    ]));
    const groupedExamples = {};
    const exampleComments = {};
    source.forEach((module) => module.topics.forEach((item) => {
      groupedExamples[item.name] = [[item.name, item.code]];
      exampleComments[item.name] = item.comment || defaultExampleComment(item);
    }));
    return {
      ...meta,
      modules,
      quickNotes,
      groupedExamples,
      exampleComments,
      hubPath: "/ai",
      hubLabel: "AI knowledge hub",
      fallbackNote: "A practical AI concept to understand before moving to the next module.",
      fallbackCode: "# Sketch the input, transformation, output, and validation step."
    };
  }

  const generativeAi = [
    m(1, "AI & Generative AI", "foundation",
      "Place generative models inside the wider AI landscape and learn what they can—and cannot—do.",
      "https://developers.google.com/machine-learning/resources/intro-llms",
      "Choose a real product idea and explain whether it needs prediction, generation, retrieval, or ordinary software.",
      [
        t("AI, ML & deep learning", "AI is the broad goal; machine learning learns patterns from data; deep learning uses layered neural networks.", "AI > machine learning > deep learning"),
        t("Generative vs discriminative models", "A discriminative model predicts a label or boundary; a generative model produces new content from learned patterns.", "classifier(input) -> label\ngenerator(prompt) -> new content"),
        t("Foundation models", "A foundation model is pretrained broadly and can be adapted to many downstream tasks.", "base_model + instructions + context -> task output"),
        t("Large language models", "An LLM predicts token sequences, which enables text generation, extraction, classification, and code assistance.", "next_token = model(previous_tokens)"),
        t("Model modalities", "Models may accept or produce text, images, audio, video, or combinations of them.", "text + image -> text answer"),
        t("Probabilistic output", "Generation samples from likely continuations, so the same request can produce different valid results.", "temperature=0.2  # more focused sampling"),
        t("Capabilities & limitations", "Models can transform patterns fluently but may hallucinate, inherit bias, or lack current/private facts.", "model answer -> verify facts before use")
      ]),
    m(2, "Neural & LLM Foundations", "foundation",
      "Understand the training vocabulary beneath modern language models without diving into the full mathematics.",
      "https://developers.google.com/machine-learning/crash-course/neural-networks",
      "Draw the lifecycle from raw examples to training loss, updated weights, and inference.",
      [
        t("Parameters & weights", "Parameters are learned numeric values that shape how inputs are transformed into predictions.", "prediction = network(input, learned_weights)"),
        t("Training vs inference", "Training updates parameters from examples; inference uses fixed parameters to answer new inputs.", "train: update weights\ninfer: use weights"),
        t("Pretraining", "Pretraining learns broad language and world patterns from a very large corpus.", "documents -> self-supervised training -> base model"),
        t("Self-supervised learning", "The training signal comes from the data itself, such as predicting hidden or next tokens.", "\"Java runs on the\" -> predict \"JVM\""),
        t("Loss & optimization", "Loss measures error; an optimizer adjusts parameters to reduce that error over many steps.", "weights = weights - learning_rate * gradient"),
        t("Epochs, batches & steps", "A batch is one sample group, a step is one update, and an epoch is one pass through the dataset.", "1000 examples / batch 100 = 10 steps per epoch"),
        t("Generalization & overfitting", "Generalization works on unseen inputs; overfitting memorizes training details and performs poorly elsewhere.", "train score high + test score low -> overfitting")
      ]),
    m(3, "Transformers & Attention", "foundation",
      "Build the mental model behind the architecture used by most modern language models.",
      "https://huggingface.co/docs/transformers/index",
      "Explain how tokens become contextual representations and then next-token probabilities.",
      [
        t("Transformer architecture", "A transformer processes token representations through repeated attention and feed-forward blocks.", "tokens -> transformer blocks -> token probabilities"),
        t("Self-attention", "Self-attention lets each token weigh other tokens that matter for interpreting its current context.", "\"bank\" attends to \"river\" or \"money\""),
        t("Queries, keys & values", "Attention compares a query with keys, then mixes the corresponding values using those scores.", "attention(Q,K,V) = softmax(QK^T)V"),
        t("Multi-head attention", "Several attention heads learn different relationships in parallel before their results are combined.", "head1: syntax | head2: reference | head3: position"),
        t("Positional information", "Position signals tell a transformer token order because attention alone does not encode sequence order.", "\"dog bites man\" != \"man bites dog\""),
        t("Encoder, decoder & encoder-decoder", "Encoders build representations, decoders generate sequences, and encoder-decoder models connect both.", "encoder: understand\ndecoder: generate"),
        t("Autoregressive generation", "An autoregressive model emits one token, appends it to context, and repeats until it stops.", "prompt -> token1 -> token2 -> ... -> stop")
      ]),
    m(4, "Tokens & Context Windows", "foundation",
      "See how text becomes model input and why context size affects quality, latency, and cost.",
      "https://platform.openai.com/tokenizer",
      "Estimate the context budget for a request containing instructions, retrieved text, user input, and a response.",
      [
        t("Tokenization", "A tokenizer splits content into model vocabulary units that may be words, word pieces, punctuation, or bytes.", "\"unbelievable\" -> [\"un\", \"believ\", \"able\"]"),
        t("Token IDs", "Each token maps to an integer ID that the model converts into a learned vector.", "\"hello\" -> token_id 15339 -> vector"),
        t("Context window", "The context window is the maximum combined input and output token budget visible in one model call.", "system + history + prompt + output <= context limit"),
        t("Input vs output tokens", "Input tokens provide context; output tokens are newly generated and often have their own maximum.", "input=1200 tokens, max_output=300 tokens"),
        t("Truncation", "When content exceeds the limit, the application must remove, summarize, or split information deliberately.", "old messages -> summarize -> compact context"),
        t("Long-context trade-offs", "More context can include useful evidence but increases cost and may make relevant details harder to find.", "more tokens != automatically better answer"),
        t("Token budgeting", "Reserve space for instructions, evidence, conversation state, and the answer before making a request.", "budget = instructions + evidence + history + response")
      ]),
    m(5, "Embeddings & Meaning", "core",
      "Understand vector representations and when similarity is more useful than keyword matching.",
      "https://platform.openai.com/docs/guides/embeddings",
      "Design a semantic FAQ search that embeds questions, compares vectors, and returns the closest entries.",
      [
        t("Embedding vectors", "An embedding converts content into a numeric vector that places related meanings near one another.", "embed(\"reset password\") -> [0.12, -0.04, ...]"),
        t("Semantic similarity", "Vector similarity can match concepts even when two texts use different words.", "\"car repair\" ~ \"automobile service\""),
        t("Cosine similarity", "Cosine similarity compares vector direction and commonly scores semantic closeness.", "score = dot(a,b) / (norm(a) * norm(b))"),
        t("Embedding dimensions", "Dimensions are vector coordinates; the chosen model fixes their count and compatibility.", "vector.length = model_dimension"),
        t("Normalization", "Normalized vectors have unit length, simplifying cosine or dot-product comparison.", "normalized = vector / norm(vector)"),
        t("Batch embedding", "Batching many inputs reduces request overhead while staying within provider limits.", "embeddings.create(input=[text1, text2, text3])"),
        t("Embedding use cases", "Embeddings power semantic search, clustering, recommendations, anomaly detection, and RAG retrieval.", "query_vector -> nearest documents")
      ]),
    m(6, "Models & Inference", "core",
      "Choose an appropriate model and control how it generates a response.",
      "https://platform.openai.com/docs/models",
      "Create a model-selection table for quality, latency, context, modality, privacy, and cost.",
      [
        t("Model selection", "Model selection means choosing the smallest affordable model that still meets the task's quality, input, context, and speed requirements.", "simple extraction -> small model\nhard reasoning -> stronger model"),
        t("Open vs hosted models", "Hosted APIs reduce operations; open-weight models offer more deployment control but require infrastructure.", "hosted: managed endpoint | open: operate weights"),
        t("Temperature", "Temperature changes sampling sharpness: lower is more focused, higher is more varied.", "temperature=0.1  # consistent extraction"),
        t("Top-p sampling", "Top-p samples only from the smallest token set whose cumulative probability reaches the threshold.", "top_p=0.9"),
        t("Stop conditions", "Stop conditions tell the model when to finish, preventing an answer from continuing past a marker or consuming unnecessary output tokens.", "stop=[\"END\"], max_output_tokens=400"),
        t("Latency & throughput", "Latency is time per response; throughput is work completed per unit time and improves with batching or concurrency.", "p95_latency=1.8s, requests_per_second=40"),
        t("Cost estimation", "Estimate cost from input/output token counts, model rates, tool calls, storage, and infrastructure.", "cost = input_tokens*rate_in + output_tokens*rate_out")
      ]),
    m(7, "Prompt Design", "core",
      "Turn a vague request into clear instructions, context, constraints, and success criteria.",
      "https://platform.openai.com/docs/guides/prompt-engineering",
      "Rewrite one ambiguous prompt with a role, task, input delimiters, rules, output format, and example.",
      [
        t("Instruction hierarchy", "System or developer rules set durable behavior, while user content supplies the current task and data.", "system: rules\nuser: request + input"),
        t("Clear task definition", "A clear task definition tells the model exactly what to do, who the answer is for, which rules apply, and what completion looks like.", "\"Summarize for a beginner in 5 bullets.\""),
        t("Delimiters & data boundaries", "Delimit untrusted or variable content so the model can distinguish data from instructions.", "<document>user supplied text</document>"),
        t("Zero-shot prompting", "Zero-shot prompts describe the task without showing an example.", "\"Classify as bug, feature, or question.\""),
        t("Few-shot prompting", "Few-shot prompts demonstrate representative input-output pairs to teach format or judgment.", "Input: slow page -> Output: performance"),
        t("Decomposition", "Decomposition breaks a complex request into smaller, clearly defined stages so each result can be checked before the next stage begins.", "extract facts -> compare -> write conclusion"),
        t("Prompt iteration", "Prompt iteration improves instructions through measured revisions, using the same test cases to compare versions fairly instead of trusting one example.", "prompt_v2 score 0.91 > prompt_v1 score 0.82")
      ]),
    m(8, "Structured Outputs & Tools", "core",
      "Make model responses dependable enough for software to validate and consume.",
      "https://platform.openai.com/docs/guides/structured-outputs",
      "Define a typed support-ticket schema, validate a response, and retry safely on invalid data.",
      [
        t("JSON output", "JSON is machine-readable, but plain JSON prompting alone does not guarantee a valid shape.", "{\"category\":\"billing\",\"urgent\":false}"),
        t("JSON Schema", "A schema defines required fields, types, enums, and nesting that a structured response must follow.", "{\"type\":\"object\",\"required\":[\"answer\"]}"),
        t("Schema validation", "Schema validation checks that model-generated data has the required fields, types, and allowed values before the application uses or stores it.", "parsed = schema.parse(model_output)"),
        t("Function calling", "Function calling lets a model select a named operation and provide typed arguments; application code performs it.", "get_weather({\"city\":\"Delhi\"})"),
        t("Tool result messages", "After executing a tool, send its result back with the matching call identity so generation can continue.", "tool_call_id=call_7 -> {\"temp_c\":31}"),
        t("Deterministic post-processing", "Deterministic post-processing uses ordinary code for exact calculations, permission checks, and irreversible actions instead of trusting uncertain generated text.", "total = items.reduce(sum)  # code calculates"),
        t("Failure handling", "Failure handling treats refusals, invalid output, timeouts, and tool errors as expected states with safe retries or clear messages.", "if invalid: repair once; else fail clearly")
      ]),
    m(9, "Multimodal Generation", "production",
      "Work with text, images, speech, and mixed inputs while respecting modality-specific limits.",
      "https://platform.openai.com/docs/guides/images",
      "Design an accessible product workflow that accepts an image and returns verified text plus alt text.",
      [
        t("Vision inputs", "Vision-capable models reason over supplied images, but small text, counting, and spatial precision can remain difficult.", "input = [question, product_photo]"),
        t("Image generation", "Image models create or edit pixels from prompts, masks, and reference images.", "prompt + optional mask/reference -> image"),
        t("Speech to text", "Speech recognition converts audio into transcripts and may support timestamps or speaker cues.", "audio.wav -> transcript"),
        t("Text to speech", "Speech synthesis turns text into audio; disclose synthetic voices where appropriate.", "response text -> generated speech"),
        t("Multimodal prompting", "Tell the model exactly which parts of each input to inspect and what output evidence to provide.", "\"Read the label; return product and expiry date.\""),
        t("Media preprocessing", "Resize, compress, sample, or segment media to fit limits while preserving task-relevant detail.", "video -> selected frames + transcript"),
        t("Accessibility & consent", "Provide alt text and captions, and obtain permission before processing identifiable voices or images.", "image output -> human-reviewed alt text")
      ]),
    m(10, "Customization & Fine-tuning", "production",
      "Know when prompting, retrieval, or parameter adaptation is the right customization tool.",
      "https://huggingface.co/docs/peft/index",
      "Choose between prompt engineering, RAG, supervised fine-tuning, and adapters for three concrete product needs.",
      [
        t("Prompting vs RAG vs fine-tuning", "Prompting changes instructions, RAG supplies facts, and fine-tuning changes learned behavior patterns.", "fresh facts -> RAG | stable style -> fine-tune"),
        t("Supervised fine-tuning", "SFT trains on desired input-output examples to make a behavior more consistent.", "{input: support note, output: approved summary}"),
        t("Training data quality", "Small, accurate, representative examples often teach more than large noisy datasets.", "deduplicate -> review -> split -> train"),
        t("Train, validation & test splits", "These splits keep model learning, tuning, and final evaluation on separate examples so reported performance reflects unseen data honestly.", "80% train | 10% validation | 10% test"),
        t("LoRA & adapters", "LoRA learns small low-rank updates while keeping base weights fixed, reducing training and storage cost.", "base weights frozen + trainable adapter"),
        t("Preference optimization", "Preference methods teach which of two responses better matches human or policy judgments.", "preferred answer > rejected answer"),
        t("Fine-tuning evaluation", "Compare the tuned model with a baseline on held-out quality, safety, latency, and regression tests.", "candidate must beat baseline and safety thresholds")
      ]),
    m(11, "Evaluation & Quality", "production",
      "Measure a system with repeatable datasets, task-specific criteria, and production feedback.",
      "https://platform.openai.com/docs/guides/evals",
      "Build a 25-case evaluation set with objective checks, a rubric, and regression thresholds.",
      [
        t("Evaluation datasets", "An eval set contains representative inputs, expected behavior, and difficult edge cases.", "cases = happy paths + edge cases + attacks"),
        t("Exact & programmatic graders", "Code can score structured fields, keywords, executable tests, or reference matches objectively.", "assert output.status in allowed_statuses"),
        t("Model-based graders", "A judge model can apply a rubric to open-ended output, but needs calibration against human ratings.", "judge(prompt, answer, rubric) -> score"),
        t("Human evaluation", "People remain essential for nuance, usefulness, risk, and validating automated graders.", "two reviewers + disagreement resolution"),
        t("Groundedness & factuality", "Groundedness asks whether claims follow supplied evidence; factuality asks whether claims are true.", "claim -> supporting passage or verified source"),
        t("Regression testing", "Regression testing reruns the same evaluation suite after model, prompt, tool, or data changes to detect quality that was accidentally lost.", "release only if critical evals pass"),
        t("Online monitoring", "Production metrics reveal latency, errors, user feedback, escalation rates, and distribution shifts.", "monitor p95 latency, refusal rate, helpfulness")
      ]),
    m(12, "Safety & Production", "production",
      "Ship generative features with privacy, security, reliability, and operational limits designed in.",
      "https://platform.openai.com/docs/guides/safety-best-practices",
      "Threat-model one AI feature and define input controls, output checks, human review, logging, and rollback.",
      [
        t("Hallucination controls", "Hallucination controls reduce unsupported claims by grounding answers in evidence, constraining output, checking facts, and refusing when evidence is insufficient.", "if confidence low: \"I do not have enough evidence\""),
        t("Prompt injection", "Prompt injection is a malicious instruction hidden in user or retrieved content that tries to override rules or trigger unauthorized actions.", "retrieved text = data, never authority"),
        t("Content safety", "Layer provider filters, application policy, age/use context, and human escalation around generated content.", "input moderation -> model -> output moderation"),
        t("Privacy & data retention", "Minimize personal data, document retention, and understand whether a provider stores or trains on inputs.", "redact PII before model request"),
        t("Rate limits & retries", "Rate limits control request volume, while bounded retries with increasing delays recover from temporary failures without repeatedly sending invalid requests.", "retry_after = min(cap, base * 2^attempt) + jitter"),
        t("Caching & fallbacks", "Cache suitable results and define a smaller model, static response, or graceful failure for outages.", "cache key = model + prompt_version + safe_input_hash"),
        t("Production checklist", "Version prompts, pin models where possible, evaluate changes, observe costs, and keep a rollback path.", "eval -> canary -> monitor -> expand or rollback")
      ])
  ];

  const rag = [
    m(1, "RAG Architecture", "foundation",
      "Understand how retrieval and generation combine to answer from external knowledge.",
      "https://docs.cloud.google.com/architecture/gen-ai-rag-vertex-ai-vector-search",
      "Draw the offline ingestion flow and online question-answering flow for an internal handbook.",
      [
        t("What RAG solves", "RAG supplies relevant external evidence so a model can answer beyond its fixed training knowledge.", "question -> retrieve evidence -> grounded answer"),
        t("Parametric vs external knowledge", "Parametric knowledge lives in model weights; external knowledge lives in documents, databases, or APIs.", "model memory + current source data"),
        t("Ingestion pipeline", "The offline pipeline loads, parses, chunks, enriches, embeds, and indexes source content.", "source -> parse -> chunk -> embed -> index"),
        t("Query pipeline", "The online pipeline understands a request, retrieves candidates, builds context, and generates an answer.", "query -> retrieve -> rerank -> prompt -> answer"),
        t("Retriever", "The retriever finds candidate passages using vector, keyword, metadata, graph, or combined search.", "retrieve(query, top_k=20)"),
        t("Generator", "The generator synthesizes an answer from instructions, the question, and selected evidence.", "LLM(system + evidence + question)"),
        t("RAG trade-offs", "RAG improves freshness and traceability but adds indexing, retrieval, latency, and evaluation complexity.", "quality depends on source + retrieval + generation")
      ]),
    m(2, "Sources, Loading & Parsing", "foundation",
      "Turn varied source files and systems into clean, permission-aware text and structure.",
      "https://docs.cloud.google.com/document-ai/docs/overview",
      "Design loaders for HTML, PDF, database, and API sources while preserving ownership and timestamps.",
      [
        t("Source inventory", "A source inventory records where knowledge comes from, who owns it, its format, update schedule, sensitivity, and whether it is authoritative.", "source_registry: uri, owner, cadence, classification"),
        t("Document loaders", "A loader reads from a source and emits normalized documents plus provenance metadata.", "load(uri) -> {text, metadata}"),
        t("HTML parsing", "HTML parsing extracts the useful page content while removing menus and boilerplate, but keeps headings, lists, tables, and source URLs meaningful.", "HTML -> main content + heading hierarchy"),
        t("PDF extraction", "PDFs may contain positioned text, tables, images, or scans, so extraction quality must be checked.", "PDF -> pages -> blocks -> reading order"),
        t("OCR", "Optical character recognition turns scanned pixels into text and should retain confidence and page coordinates.", "page_image -> OCR text + bounding boxes"),
        t("Tables & structured data", "Represent tables so rows, headers, and units stay connected rather than flattening into ambiguous text.", "row: {quarter: Q2, revenue_usd: 420000}"),
        t("Access-control metadata", "Carry source permissions into every chunk so retrieval cannot expose content a user may not read.", "chunk.allowed_groups = [\"finance\"]")
      ]),
    m(3, "Chunking Strategies", "foundation",
      "Split knowledge into retrievable units that retain enough meaning without flooding the prompt.",
      "https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/chunk-documents",
      "Compare fixed, recursive, and structure-aware chunking on one policy document.",
      [
        t("Chunk purpose", "A chunk is the unit retrieved and cited; it should answer a focused need while retaining essential context.", "document -> retrievable passages"),
        t("Fixed-size chunking", "Fixed windows are simple and predictable but may split sentences or logical sections.", "tokens[0:500], tokens[450:950]"),
        t("Recursive chunking", "Recursive splitters prefer larger boundaries such as sections, paragraphs, sentences, then words.", "split by heading -> paragraph -> sentence"),
        t("Structure-aware chunking", "Structure-aware chunking follows natural boundaries such as headings, functions, or table rows so each retrieved piece keeps its original meaning.", "chunk = heading + section body"),
        t("Chunk overlap", "Overlap repeats boundary context between adjacent chunks but increases index size and duplicates retrieval.", "chunk_size=500, overlap=75"),
        t("Parent-child retrieval", "Search small child chunks for precision, then return a larger parent section for sufficient context.", "match child -> fetch parent"),
        t("Chunk-size experiments", "Chunk-size experiments compare retrieval and answer quality at several sizes because no single token count works best for every document collection.", "test 256 vs 512 vs 900 tokens")
      ]),
    m(4, "Metadata & Document Lifecycle", "foundation",
      "Keep chunks traceable, filterable, current, and safe throughout their lifecycle.",
      "https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-overview",
      "Define a metadata contract and incremental update strategy for versioned product documentation.",
      [
        t("Stable document identity", "A stable source ID connects updated chunks to the same logical document over time.", "document_id = canonical repository path"),
        t("Chunk identity", "A chunk ID should be deterministic or version-aware so updates and deletes are reliable.", "chunk_id = hash(document_id + version + section)"),
        t("Provenance", "Provenance records where a chunk came from—such as its URL, author, page, ingestion time, and parser version—so it remains traceable.", "{source_url, page, ingested_at, parser_version}"),
        t("Filterable metadata", "Fields such as product, locale, date, tenant, and ACL narrow retrieval before ranking.", "filter: product=\"billing\" AND locale=\"en\""),
        t("Versioning", "Version metadata distinguishes current content from history and supports reproducible answers.", "effective_from <= now < effective_to"),
        t("Incremental updates", "Detect changed sources and reprocess only affected documents instead of rebuilding everything.", "content_hash changed -> reparse and reindex"),
        t("Deletion & tombstones", "Deletion must remove or hide every derived chunk and cache entry, including replicas.", "delete source -> delete vectors -> invalidate cache")
      ]),
    m(5, "Embedding Pipeline", "core",
      "Create consistent query and document vectors and migrate them without silent incompatibility.",
      "https://platform.openai.com/docs/guides/embeddings",
      "Specify an embedding job with batching, retries, model version metadata, and migration support.",
      [
        t("Document embeddings", "Document embeddings turn each searchable chunk and its useful metadata into a meaning-based vector that can be compared with user questions.", "vector = embed(title + \"\\n\" + chunk_text)"),
        t("Query embeddings", "A query embedding converts the user's question into a compatible vector so the search can find chunks with similar meaning.", "query_vector = embed(user_question)"),
        t("Model compatibility", "Vectors from different embedding models or dimensions cannot be compared directly.", "index.embedding_model == query.embedding_model"),
        t("Batching & rate limits", "Batching groups embedding inputs into efficient requests while respecting provider limits and saving progress so interrupted jobs can resume safely.", "for batch in batches: embed(batch); save_checkpoint()"),
        t("Vector normalization", "Normalize consistently when the chosen distance metric expects unit vectors.", "v = v / norm(v)"),
        t("Model migration", "Embedding-model migration builds and evaluates a separate index with the new model before traffic switches, avoiding incompatible vectors and sudden quality loss.", "index_v1 and index_v2 -> shadow test -> cutover"),
        t("Embedding observability", "Embedding observability tracks failures, speed, token volume, empty chunks, dimensions, and model versions so ingestion problems can be diagnosed quickly.", "metric: embedded_chunks_total by model_version")
      ]),
    m(6, "Vector Search & Indexes", "core",
      "Understand similarity metrics, approximate indexes, and the recall-latency choices beneath retrieval.",
      "https://docs.cloud.google.com/vertex-ai/docs/vector-search/overview",
      "Choose a vector index and top-k setting for a million-chunk support corpus, then measure recall.",
      [
        t("Vector databases", "A vector database stores embeddings with metadata and performs nearest-neighbor search.", "index.upsert(id, vector, metadata)"),
        t("Similarity metrics", "Cosine, dot product, and Euclidean distance rank vectors differently depending on normalization and model guidance.", "similarity = cosine(query, chunk)"),
        t("Exact nearest neighbors", "Exact search compares every vector and maximizes recall but becomes expensive at large scale.", "score query against all N vectors"),
        t("Approximate nearest neighbors", "ANN indexes trade a small amount of recall for much faster search at scale.", "ANN(query, top_k=20)"),
        t("HNSW", "HNSW navigates a layered proximity graph and offers strong low-latency recall with memory trade-offs.", "search graph from upper layers to neighbors"),
        t("Top-k", "Top-k controls how many candidates retrieval returns; too few miss evidence, too many add noise.", "candidates = search(query, k=30)"),
        t("Recall & latency tuning", "Recall-and-latency tuning balances how often relevant chunks are found against how quickly the vector index must return its results.", "recall@10 vs p95_search_ms")
      ]),
    m(7, "Hybrid Retrieval & Filtering", "core",
      "Combine semantic meaning, exact terms, metadata, and business constraints.",
      "https://www.elastic.co/docs/solutions/search/hybrid-search",
      "Build a hybrid search for product error codes that also understands plain-language symptoms.",
      [
        t("Keyword search", "Lexical search excels at exact names, IDs, error codes, and rare terms.", "BM25(\"ERR_AUTH_17\")"),
        t("Semantic search", "Dense vector search finds conceptually related text even when wording differs.", "vector_search(\"cannot sign in\")"),
        t("Hybrid search", "Hybrid retrieval combines lexical and semantic candidates to cover exact and conceptual matches.", "candidates = lexical(query) UNION vector(query)"),
        t("Reciprocal rank fusion", "RRF merges ranked lists using positions without requiring scores on the same scale.", "RRF score = sum(1 / (k + rank_i))"),
        t("Metadata pre-filtering", "Pre-filtering restricts the searchable set before vector ranking, enforcing scope and improving relevance.", "tenant_id=user.tenant AND locale=\"en\""),
        t("Post-filtering risk", "Filtering only after top-k search may leave too few valid results or leak timing and count signals.", "prefer ACL filter inside retrieval"),
        t("Diversification", "Maximal marginal relevance and similar methods reduce near-duplicate chunks while preserving relevance.", "pick relevant candidate unlike already selected ones")
      ]),
    m(8, "Query Understanding", "retrieval",
      "Transform conversational or ambiguous questions into better retrieval requests.",
      "https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-overview",
      "Create a query pipeline that detects filters, rewrites follow-ups, and decomposes multi-part questions.",
      [
        t("Query rewriting", "Query rewriting converts vague or conversational wording into a clear standalone search request while preserving what the user actually meant.", "\"what about its price?\" + history -> \"price of Product X\""),
        t("Conversation condensation", "Resolve references from recent dialogue so retrieval does not depend on hidden conversational context.", "history + follow-up -> standalone question"),
        t("Multi-query retrieval", "Multi-query retrieval creates several equivalent searches and merges their results, improving the chance of finding relevant evidence expressed with different wording.", "queries = [original, synonym version, technical version]"),
        t("Query decomposition", "Query decomposition splits a multi-part question into smaller searches so evidence for each required fact can be found independently.", "\"compare A and B\" -> facts(A) + facts(B)"),
        t("HyDE", "Hypothetical document embeddings search using an imagined answer-like passage rather than the short query alone.", "hypothetical_passage = LLM(query); embed(hypothetical_passage)"),
        t("Entity & filter extraction", "Entity and filter extraction turns details such as dates, products, regions, or tenants into validated filters that narrow the search correctly.", "\"EU policy after 2025\" -> region=EU, date>=2025"),
        t("Query routing", "Query routing examines a request and sends it to the most suitable source—documents, vector search, SQL, the web, or a direct-answer path.", "router(query) -> docs | database | web | direct")
      ]),
    m(9, "Reranking & Context Assembly", "retrieval",
      "Turn a broad candidate set into a compact, ordered evidence package.",
      "https://cloud.google.com/vertex-ai/generative-ai/docs/retrieval-and-ranking",
      "Retrieve 30 candidates, rerank them, deduplicate, and assemble a token-budgeted evidence block.",
      [
        t("Candidate generation", "Fast first-stage retrieval favors recall and returns more candidates than the prompt will receive.", "retrieve top_50 candidates", "This asks the retriever for 50 broad candidates first; reranking will later keep only the strongest evidence for the prompt."),
        t("Cross-encoder reranking", "A reranker jointly reads query and passage for a stronger relevance score at higher cost.", "score = reranker(query, passage)", "This sends one query-passage pair through the reranker and stores its relevance score for sorting."),
        t("LLM reranking", "An LLM can rank with nuanced instructions but adds latency, cost, and nondeterminism.", "rank passages by answer usefulness", "This instruction asks the model to reorder the retrieved passages by how directly they help answer the question."),
        t("Score thresholds", "A score threshold removes candidates that are not relevant enough and allows the system to report that no trustworthy evidence was found.", "if best_score < threshold: abstain", "This checks the best available score and refuses to answer when even the strongest passage is below the trusted minimum."),
        t("Deduplication", "Deduplication removes repeated or nearly identical passages so limited prompt space contains a wider range of useful evidence.", "dedupe by source section and semantic similarity", "This removes passages from the same section or with nearly identical meaning before they consume prompt space twice."),
        t("Context ordering", "Context ordering arranges selected evidence by relevance, source, time, or document structure so the model can combine it more reliably.", "context = highest relevance first", "This places the strongest passage at the beginning of the context, followed by progressively less relevant evidence."),
        t("Token-budgeted packing", "Token-budgeted packing selects and fits the most useful evidence chunks into the model prompt without exceeding its token limit, while keeping citation details.", "pack(chunks, max_tokens=6000)", "This adds the best chunks until the context reaches 6,000 tokens, while carrying their source details for later citations.")
      ]),
    m(10, "Grounded Generation & Citations", "retrieval",
      "Produce useful answers that stay faithful to evidence and reveal their sources.",
      "https://platform.openai.com/docs/guides/retrieval",
      "Write a grounded answer prompt with citation IDs, insufficient-evidence behavior, and claim-level attribution.",
      [
        t("Grounding instructions", "Grounding instructions require the model to use supplied evidence, label its inferences, and decline claims that the sources cannot support.", "\"Use only evidence below; say when evidence is insufficient.\""),
        t("Citation identifiers", "Attach stable source IDs to passages so the output can reference evidence without inventing URLs.", "[S3] title, page, URL, passage"),
        t("Claim-level citations", "Place citations next to the specific factual claims they support rather than only at the end.", "\"Retention is 30 days [S2].\""),
        t("Citation validation", "Citation validation checks that every cited source exists and that its passage genuinely supports the nearby claim instead of merely looking credible.", "assert cited_ids subset of provided_source_ids"),
        t("Abstention", "A good RAG system says it lacks evidence rather than filling gaps with plausible language.", "no relevant passage -> ask or abstain"),
        t("Conflicting sources", "Conflicting-source handling shows meaningful disagreement and uses authority, date, and version rules rather than silently choosing one answer.", "\"S1 says 30 days; newer policy S4 says 60.\""),
        t("Conversational RAG", "Conversational RAG uses recent dialogue to understand follow-up questions but retrieves fresh evidence for every turn that depends on external knowledge.", "history summary + current query + retrieved evidence")
      ]),
    m(11, "RAG Evaluation", "quality",
      "Locate quality failures in retrieval, context, generation, and end-to-end behavior.",
      "https://platform.openai.com/docs/guides/evals",
      "Create a labeled RAG test set and a dashboard for retrieval recall, groundedness, citation, and answer quality.",
      [
        t("Golden question sets", "A golden set pairs realistic questions with relevant source IDs, expected facts, or answer rubrics.", "{question, relevant_chunks, required_facts}"),
        t("Retrieval recall", "Recall measures how often at least one known relevant passage appears in the candidate set.", "recall@k = relevant_retrieved / relevant_total"),
        t("Retrieval precision", "Precision measures how much retrieved content is actually relevant and helps reveal noisy context.", "precision@k = relevant_retrieved / k"),
        t("Ranking metrics", "MRR and nDCG reward placing useful passages nearer the top, including graded relevance.", "MRR = mean(1 / first_relevant_rank)"),
        t("Context relevance", "Context relevance measures whether the passages placed in the prompt actually help answer the question without adding unrelated distractions.", "judge(question, context) -> relevance score"),
        t("Faithfulness & citation accuracy", "Score whether answer claims follow the evidence and whether citations support those claims.", "claims(answer) -> evidence entailment checks"),
        t("End-to-end answer quality", "End-to-end quality evaluates whether the complete RAG system gives useful, correct, complete, appropriately cautious answers at acceptable speed and cost.", "release gate = quality + safety + latency + cost")
      ]),
    m(12, "Production RAG", "quality",
      "Operate a secure, fresh, observable retrieval system as sources and usage evolve.",
      "https://docs.cloud.google.com/architecture/rag-capable-gen-ai-app-using-vertex-ai",
      "Design production controls for freshness, tenant isolation, monitoring, caching, and incident response.",
      [
        t("Freshness SLAs", "A freshness SLA defines how quickly changed source content must become searchable and measures whether the ingestion pipeline meets that target.", "freshness_lag = indexed_at - source_updated_at"),
        t("Tenant isolation", "Separate or filter indexes so one customer can never retrieve another customer's chunks.", "retrieval filter tenant_id = authenticated_tenant"),
        t("Prompt-injection defense", "Assume documents can contain malicious instructions; isolate content and restrict tools and secrets.", "document text cannot override system policy"),
        t("Caching", "RAG caching reuses embeddings, safe search results, or answers, while version and permission details prevent stale or unauthorized reuse.", "cache_key includes corpus_version + ACL scope"),
        t("Observability", "RAG observability records each transformation, retrieved chunk, score, citation, delay, and error so weak or failed answers can be investigated.", "trace: query -> chunks -> answer -> feedback"),
        t("Graph & multimodal RAG", "Graphs add explicit relationships; multimodal RAG retrieves images, tables, audio, or video alongside text.", "entity graph + text passages + figure embeddings"),
        t("Cost & capacity", "Budget storage, embedding updates, search, reranking, generation, and peak concurrency.", "monthly cost = ingest + index + retrieve + rerank + generate")
      ])
  ];

  const agenticAi = [
    m(1, "Agents & Workflows", "foundation",
      "Distinguish an agent that selects actions from a deterministic workflow and know when each is appropriate.",
      "https://huggingface.co/learn/agents-course/unit0/introduction",
      "Classify three product requirements as a direct model call, fixed workflow, or agent.",
      [
        t("What is an AI agent?", "An agent uses a model to decide which actions to take toward a goal and observes results before continuing.", "goal -> decide -> act -> observe -> repeat"),
        t("Agents vs workflows", "A workflow follows predefined transitions; an agent dynamically selects the next step.", "workflow: fixed graph | agent: model chooses"),
        t("When not to use an agent", "Ordinary code is safer than an agent when the steps are known, the rules are exact, or a wrong decision would create unacceptable risk.", "known formula -> code, not an agent"),
        t("Autonomy spectrum", "Systems range from suggestions to bounded tool use to longer-running autonomous execution.", "assist -> approve each action -> bounded autonomy"),
        t("Environment", "The environment is the external state an agent observes or changes through tools.", "environment = files + APIs + browser + database"),
        t("Goal & success criteria", "A useful goal states the desired outcome, constraints, and observable completion conditions.", "\"Resolve ticket with cited policy; never issue refund.\""),
        t("Agent boundaries", "Agent boundaries are explicit limits on time, steps, cost, data, permissions, and tools that keep autonomous behavior within an approved scope.", "max_turns=12, allowed_tools=[search, read]")
      ]),
    m(2, "The Agent Loop", "foundation",
      "Follow the reasoning-action-observation cycle and understand how runs terminate.",
      "https://openai.github.io/openai-agents-js/guides/running-agents/",
      "Sketch a three-turn agent trace that searches, reads a result, and produces a cited answer.",
      [
        t("Perceive, decide, act", "Each loop reads the current state, chooses an action or final answer, then updates state from the result.", "state -> model decision -> tool/final -> new state"),
        t("Messages & roles", "System, user, assistant, and tool messages carry policies, requests, decisions, and observations.", "messages = [system, user, assistant(tool_call), tool(result)]"),
        t("Tool calls", "A tool call is a structured request from the model; the runtime validates and executes it.", "search_docs({\"query\":\"refund policy\"})"),
        t("Observations", "A tool result becomes an observation the model can use for its next decision.", "tool result: {matches:[...]}"),
        t("Final output", "The run ends when the model returns the required output instead of requesting another action.", "final: {status:\"resolved\", summary:\"...\"}"),
        t("Maximum turns", "A turn limit prevents infinite loops and makes failure behavior predictable.", "run(agent, {maxTurns: 10})"),
        t("Termination conditions", "Termination conditions define exactly when an agent run ends: success, known failure, exhausted limits, cancellation, or a need for human input.", "if done || cancelled || limit_hit: stop")
      ]),
    m(3, "Tools & Function Calling", "foundation",
      "Give agents typed capabilities while application code keeps authority over execution.",
      "https://openai.github.io/openai-agents-js/guides/tools/",
      "Design a read-only order lookup tool and a refund tool that always requires approval.",
      [
        t("Tool definitions", "A tool has a clear name, purpose, input schema, output contract, and execution function.", "{name:\"lookup_order\", parameters: schema, execute}"),
        t("Schema design", "Tool schema design uses precise types, required fields, allowed values, and limits so the model produces arguments the application can validate reliably.", "{order_id:string, include_items:boolean}"),
        t("Tool descriptions", "A tool description explains its purpose, appropriate use, restrictions, and side effects so the model can choose it correctly.", "\"Read order status; does not modify the order.\""),
        t("Tool execution", "The runtime—not the model—validates arguments, checks authorization, runs code, and returns data.", "authorize -> validate -> execute -> sanitize result"),
        t("Read vs write tools", "Read tools inspect state; write tools mutate it and deserve stricter confirmation and idempotency controls.", "search_docs=read | issue_refund=write"),
        t("Tool errors", "Tool errors should return safe error codes and retry information that an agent can handle without exposing stack traces, credentials, or internal details.", "{error:\"ORDER_NOT_FOUND\", retryable:false}"),
        t("Tool output design", "Tool output design returns only the structured facts needed for the next decision, including source information when traceability matters.", "{order_id, status, refundable, source_version}")
      ]),
    m(4, "State, Context & Memory", "foundation",
      "Separate run state, model-visible context, persistent memory, and authoritative application data.",
      "https://openai.github.io/openai-agents-js/guides/context/",
      "Design a support agent state object and decide exactly what enters model context.",
      [
        t("Run context", "Run context stores application dependencies and state—such as identity, permissions, and database access—for code and tools without exposing everything to the model.", "context = {userId, db, permissions, traceId}"),
        t("Conversation state", "Conversation history preserves prior turns but should be trimmed or summarized as it grows.", "recent messages + verified summary"),
        t("Working memory", "Working memory holds temporary facts, plans, and intermediate results for the current task.", "state.notes = [verified fact A, pending question B]"),
        t("Long-term memory", "Persistent memory stores selected information across runs and requires consent, expiry, and correction controls.", "memory.write(user_id, preference, expires_at)"),
        t("Semantic memory retrieval", "Embeddings can recall relevant past facts, but retrieved memory must still be scoped and verified.", "retrieve memories where owner=user_id"),
        t("Context engineering", "Context engineering selects and organizes the smallest useful set of instructions, state, evidence, and tool results for the model's next decision.", "context = policy + goal + relevant state"),
        t("Memory risks", "Stale, poisoned, cross-user, or sensitive memories can cause wrong or unsafe actions.", "validate owner, source, freshness, and sensitivity")
      ]),
    m(5, "Planning & Reasoning Patterns", "core",
      "Use planning, decomposition, reflection, and verification only where they improve outcomes.",
      "https://huggingface.co/learn/agents-course/unit1/agent-steps-and-structure",
      "Break a research task into dependencies, evidence checks, and a concrete finish condition.",
      [
        t("Task decomposition", "Task decomposition splits a broad goal into smaller outcomes with clear dependencies, making each result easier to execute and verify.", "research -> compare -> verify -> summarize"),
        t("Plan-and-execute", "Plan-and-execute first creates a sequence of steps, then performs and revises them when real observations show that an assumption was wrong.", "plan = make_plan(goal); execute(plan.next)"),
        t("ReAct pattern", "ReAct interleaves model reasoning with actions and observations instead of planning everything upfront.", "reason -> action -> observation -> reason"),
        t("Reflection", "A reflection pass critiques a draft or trajectory against explicit criteria before finalizing.", "critique(draft, rubric) -> revise"),
        t("Self-correction limits", "A model can repeat the same misconception; correction works better with new evidence or deterministic feedback.", "failed test output -> targeted revision"),
        t("Verification steps", "Verification steps use tests, schemas, tools, or independent sources to confirm that claims and actions are correct before the agent finishes.", "draft code -> run tests -> inspect failures"),
        t("Planning cost control", "Extra planning consumes tokens and latency, so scale reasoning depth with task uncertainty and impact.", "simple task: direct | complex task: bounded plan")
      ]),
    m(6, "Workflow Patterns", "core",
      "Compose dependable agentic systems from routing, sequences, parallel branches, and evaluator loops.",
      "https://openai.github.io/openai-agents-js/guides/multi-agent/",
      "Model a content workflow using a router, parallel research, and an evaluator-revision loop.",
      [
        t("Prompt chaining", "A sequence passes a validated output from one focused stage into the next.", "extract -> validate -> summarize"),
        t("Routing", "A router classifies the request and sends it to the most suitable workflow, agent, or tool.", "route(ticket) -> billing | technical | abuse"),
        t("Parallelization", "Independent branches can run concurrently, then a reducer combines their results.", "await all([search_docs, search_db, check_status])"),
        t("Fan-out & fan-in", "Fan-out distributes subtasks; fan-in deduplicates, reconciles, and synthesizes their outputs.", "topics.map(research) -> merge evidence"),
        t("Evaluator-optimizer loop", "One stage produces, another scores against a rubric, and revision repeats within a limit.", "draft -> evaluate -> revise (max 2)"),
        t("State-machine workflows", "Explicit states and transitions make important business processes auditable and testable.", "DRAFT -> REVIEW -> APPROVED -> PUBLISHED"),
        t("Deterministic gates", "Deterministic gates are code-based checks between model stages that stop invalid schemas, missing permissions, exhausted budgets, or failed tests.", "if !schema.valid(output): stop")
      ]),
    m(7, "Multi-agent Orchestration", "orchestration",
      "Coordinate specialists through managers, handoffs, and shared protocols without needless complexity.",
      "https://openai.github.io/openai-agents-js/guides/handoffs/",
      "Design a triage agent that hands off to billing and technical specialists with a clear context contract.",
      [
        t("Manager pattern", "A central manager keeps control and invokes specialist agents as tools before producing the final result.", "manager -> specialist tools -> manager response"),
        t("Handoffs", "A handoff transfers control and selected context to a specialist that continues the conversation.", "triage -> handoff_to_billing(summary)"),
        t("Agents as tools", "A specialist can be wrapped as a callable tool so the orchestrator owns the user-facing run.", "research_agent({question}) -> findings"),
        t("Specialist agents", "A specialist agent has one narrow responsibility, a limited tool set, focused instructions, and a defined output that another component can use.", "security_agent tools=[scan, docs], output=RiskReport"),
        t("Context contracts", "Pass only the verified facts and identifiers the receiver needs, not an uncontrolled full transcript.", "{task, constraints, evidence_ids, open_questions}"),
        t("Shared-state coordination", "Shared-state coordination uses a structured store with ownership and conflict rules so several agents cannot silently overwrite one another's work.", "state.update(field, value, actor, version)"),
        t("Multi-agent trade-offs", "More agents add calls, latency, coordination failures, and security boundaries; use them for real specialization.", "benefit of specialization > orchestration overhead")
      ]),
    m(8, "MCP & External Integrations", "orchestration",
      "Connect agents to tools and context through standard protocols and tightly scoped credentials.",
      "https://modelcontextprotocol.io/docs/getting-started/intro",
      "Outline a read-only MCP integration with capability discovery, authentication, and output validation.",
      [
        t("Model Context Protocol", "MCP standardizes how AI applications discover and use external tools, resources, and prompts.", "client <-> MCP server <-> external system"),
        t("MCP clients & servers", "A client lives in the AI host; a server exposes capabilities backed by a local or remote system.", "host creates client connection to server"),
        t("Tools, resources & prompts", "Tools perform actions, resources expose readable context, and prompts provide reusable interaction templates.", "tools/list | resources/read | prompts/get"),
        t("Capability discovery", "Capability discovery lets an MCP client negotiate a compatible protocol version and ask a server which tools and resources are actually available.", "initialize -> list capabilities -> call"),
        t("Transport & authentication", "Local stdio and remote HTTP transports have different trust boundaries and credential needs.", "remote server -> TLS + scoped OAuth token"),
        t("Least-privilege integration", "Grant the minimum scopes, tenant access, and operations required for the agent's task.", "calendar.read != calendar.write"),
        t("Untrusted server output", "MCP server output is untrusted external data, so the application must validate its structure and prevent embedded text from requesting unrelated secrets or actions.", "validate result; isolate instructions inside returned text")
      ]),
    m(9, "Human Control & Sandboxing", "orchestration",
      "Keep people in control of high-impact actions and isolate code or browsing environments.",
      "https://openai.github.io/openai-agents-js/guides/human-in-the-loop/",
      "Create an approval matrix for read, draft, send, purchase, delete, and privilege-change actions.",
      [
        t("Human-in-the-loop", "HITL pauses a run so a person can inspect context and approve, reject, or edit a pending action.", "pending_action -> human decision -> resume or cancel"),
        t("Approval boundaries", "Approval boundaries specify which actions require a person to confirm them based on impact, reversibility, financial value, audience, and data sensitivity.", "external send or delete -> approval required"),
        t("Interrupt & resume", "Persist run state at an approval point so the same execution can safely resume later.", "save run_state + pending_tool_call"),
        t("Permission checks", "Authorize every tool call using the current user and resource, even if the model already requested it.", "can(user, \"refund\", order)"),
        t("Sandboxed execution", "Sandboxed execution runs generated code in an isolated environment with strict filesystem, network, process, time, memory, and CPU limits.", "sandbox(cpu=1, memory=256MB, network=off)"),
        t("Dry runs & previews", "Show the exact effect of a mutation before execution and support a no-change simulation.", "preview: would update 17 records"),
        t("Audit trails", "An audit trail records who requested, proposed, approved, executed, and observed every significant action so incidents can be reconstructed.", "{actor, action, args_hash, approval, result, time}")
      ]),
    m(10, "Reliability & Long-running Work", "reliability",
      "Make loops, tool use, retries, background runs, and recovery predictable.",
      "https://openai.github.io/openai-agents-js/guides/running-agents/",
      "Design a resumable report agent with checkpoints, idempotent writes, timeouts, and cancellation.",
      [
        t("Timeouts", "Timeouts place deadlines on individual tools and the complete run so an unavailable dependency cannot leave the agent waiting forever.", "tool_timeout=10s, run_deadline=2m"),
        t("Retries with backoff", "Retries with backoff repeat only temporary failures, waiting longer between attempts and stopping after a safe maximum instead of looping indefinitely.", "retry network 503; do not retry invalid schema forever"),
        t("Idempotency", "A repeated write with the same idempotency key should not apply the effect twice.", "create_payment(key=run_id + step_id)"),
        t("Checkpoints", "Persist validated progress after meaningful stages so a crashed run resumes without repeating completed work.", "checkpoint after fetch, analyze, and draft"),
        t("Background runs", "Background runs move long tasks outside the web request while exposing durable status, progress, cancellation, approval, and final-result states.", "queued -> running -> awaiting_approval -> completed"),
        t("Loop detection", "Detect repeated tool calls, unchanged state, or oscillating decisions and stop with diagnostics.", "same action + same args three times -> halt"),
        t("Graceful degradation", "When a tool or model is unavailable, fall back safely or return partial, clearly labeled work.", "search unavailable -> answer only from cached verified sources")
      ]),
    m(11, "Tracing, Evaluation & Cost", "reliability",
      "Observe complete trajectories and evaluate whether agents choose good actions, not just polished final text.",
      "https://openai.github.io/openai-agents-js/guides/tracing/",
      "Define trace spans and an evaluation suite for tool choice, argument quality, outcome, latency, and cost.",
      [
        t("Trace hierarchy", "A trace groups a run; spans represent model calls, tool calls, handoffs, and custom operations.", "trace -> agent span -> tool span -> model span"),
        t("Correlation IDs", "Carry a stable ID through model, application, queue, and tool logs to reconstruct one run.", "trace_id propagated in every call"),
        t("Sensitive-data controls", "Redact or omit secrets and personal data from traces while retaining useful diagnostics.", "log argument shape, not access token"),
        t("Trajectory evaluation", "Judge whether the agent selected appropriate actions and recovered well, not only its final wording.", "score tool choice + arguments + ordering + outcome"),
        t("Tool-call accuracy", "Tool-call accuracy measures whether the agent selected the right tool, supplied valid arguments, avoided unnecessary calls, and handled side effects safely.", "expected_tool == actual_tool and schema_valid"),
        t("Outcome & task success", "Task success is an observable change in the environment—such as a resolved record or passing artifact—not merely a confident final message.", "success = ticket.status == \"resolved\""),
        t("Token, latency & spend budgets", "These budgets cap calls, tokens, response time, and cost for each run so expensive loops or model choices are detected and stopped.", "budget: max_calls=20, max_tokens=50000")
      ]),
    m(12, "Guardrails & Agent Security", "reliability",
      "Layer input, output, tool, identity, and environment controls around non-deterministic decisions.",
      "https://openai.github.io/openai-agents-js/guides/guardrails/",
      "Threat-model an agent exposed to public documents and write controls for injection, exfiltration, and unsafe actions.",
      [
        t("Input guardrails", "Check requests for policy violations, malformed scope, or unsupported use before expensive agent work.", "validate request -> allow, route, or reject"),
        t("Output guardrails", "Output guardrails inspect final content for required structure, policy violations, sensitive data, and missing evidence before it reaches a user or external system.", "draft -> PII scan -> citation check -> return"),
        t("Tool guardrails", "Tool guardrails recheck the requested operation, arguments, permissions, risk, and expected impact immediately before application code executes it.", "authorize + validate + require approval"),
        t("Indirect prompt injection", "Web pages, emails, and retrieved files may contain hostile instructions aimed at the agent.", "external content is evidence, never higher-priority policy"),
        t("Data exfiltration", "Prevent tools from sending secrets or cross-tenant data through destinations chosen from untrusted input.", "egress allowlist + data classification check"),
        t("Identity & authorization", "Bind every action to an authenticated principal and enforce resource-level authorization in code.", "actor=user_123; can(actor, action, resource)"),
        t("Defense in depth", "Defense in depth combines several independent protections—least privilege, isolation, approval, validation, monitoring, limits, and recovery—so one failure is not enough.", "prevent + detect + contain + recover")
      ])
  ];

  window.QUICKDEV_AI_COURSES = {
    "generative-ai": buildCourse({
      key: "generative-ai",
      name: "Generative AI",
      mark: "G",
      officialLabel: "Official generative AI documentation",
      pageTitle: "Generative AI at a Glance | QuickDevBase",
      pageDescription: "Fast, vendor-neutral explanations of generative AI foundations, with direct links to primary documentation.",
      heroEyebrow: "Generative AI, at a glance",
      heroTitle: "Understand what<br><em>generation is doing.</em>",
      heroLede: "Build the model-level mental map—from tokens and transformers to prompting, multimodality, evaluation, and safe production use.",
      previewLabel: "GENERATION.FLOW",
      previewCode: [
        '<span><b class="code-blue">prompt</b> = instructions + context</span>',
        '<span><b class="code-pink">tokens</b> = tokenize(prompt)</span>',
        '<span><b class="code-blue">output</b> = model.generate(tokens)</span>',
        '<span><b class="code-pink">verify</b>(output)</span>'
      ].join(""),
      chipOne: "Model mapped",
      chipTwo: "Evaluate always",
      curriculumTitle: "One glance. Generative AI explained.",
      curriculumLede: "Learn the vocabulary quickly, then follow each primary-source link for implementation details and updates.",
      searchPlaceholder: "Search topics, e.g. tokens",
      certificateTitleHtml: "Generative AI Topics<br>at a Glance",
      completionNoun: "Generative AI learner",
      trademark: "Independent educational project—not affiliated with or endorsed by OpenAI, Google, Anthropic, Hugging Face, or any model provider.",
      stageLabels: { foundation: "Foundations", core: "Building Blocks", production: "Quality & Production" }
    }, generativeAi),
    rag: buildCourse({
      key: "rag",
      name: "RAG Systems",
      mark: "R",
      officialLabel: "Official retrieval and RAG documentation",
      pageTitle: "RAG Systems at a Glance | QuickDevBase",
      pageDescription: "Fast explanations for retrieval-augmented generation, from ingestion and embeddings to evaluation and production.",
      heroEyebrow: "RAG systems, at a glance",
      heroTitle: "Give models<br><em>evidence, not guesses.</em>",
      heroLede: "Trace the entire RAG pipeline—from source ingestion and chunking to hybrid retrieval, reranking, citations, evaluation, and secure operations.",
      previewLabel: "RAG.PIPELINE",
      previewCode: [
        '<span><b class="code-blue">query</b> = rewrite(question)</span>',
        '<span><b class="code-pink">chunks</b> = retrieve(query)</span>',
        '<span><b class="code-blue">evidence</b> = rerank(chunks)</span>',
        '<span><b class="code-pink">answer</b> = generate(evidence)</span>'
      ].join(""),
      chipOne: "Evidence found",
      chipTwo: "Citations checked",
      curriculumTitle: "One glance. The full RAG pipeline.",
      curriculumLede: "See where retrieval quality comes from, then use the linked primary documentation to build each component in depth.",
      searchPlaceholder: "Search topics, e.g. reranking",
      certificateTitleHtml: "RAG Systems Topics<br>at a Glance",
      completionNoun: "RAG systems learner",
      trademark: "Independent educational project. Provider names and marks belong to their respective owners; no vendor endorses this path.",
      stageLabels: { foundation: "Foundations", core: "Index & Search", retrieval: "Retrieval Quality", quality: "Evaluation & Production" }
    }, rag),
    "agentic-ai": buildCourse({
      key: "agentic-ai",
      name: "Agentic AI",
      mark: "A",
      officialLabel: "Official agents documentation",
      pageTitle: "Agentic AI at a Glance | QuickDevBase",
      pageDescription: "Fast explanations for agents, tools, memory, orchestration, MCP, human approval, evaluation, and security.",
      heroEyebrow: "Agentic AI, at a glance",
      heroTitle: "From one answer<br>to <em>bounded action.</em>",
      heroLede: "Understand how agents decide, use tools, hand off work, pause for people, recover from failure, and stay inside secure boundaries.",
      previewLabel: "AGENT.LOOP",
      previewCode: [
        '<span><b class="code-blue">state</b> = observe(environment)</span>',
        '<span><b class="code-pink">action</b> = agent.decide(state)</span>',
        '<span><b class="code-blue">result</b> = tools.execute(action)</span>',
        '<span><b class="code-pink">verify</b>(result)</span>'
      ].join(""),
      chipOne: "Tools scoped",
      chipTwo: "Human in control",
      curriculumTitle: "One glance. Agent systems mapped.",
      curriculumLede: "Learn the patterns and safety boundaries first, then follow official sources for framework-specific implementation.",
      searchPlaceholder: "Search topics, e.g. handoffs",
      certificateTitleHtml: "Agentic AI Topics<br>at a Glance",
      completionNoun: "Agentic AI learner",
      trademark: "Independent educational project. Provider names and marks belong to their respective owners; no vendor endorses this path.",
      stageLabels: { foundation: "Foundations", core: "Reasoning & Flow", orchestration: "Orchestration", reliability: "Reliability & Safety" }
    }, agenticAi)
  };
}());
