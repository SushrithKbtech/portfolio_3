/* Everything the page renders from.
   Facts, dates and numbers come from the CV and the project repos — nothing invented.
   `img` is a real screenshot of the deployed site where one exists, and a drawn screen
   of what the system actually does where it doesn't. */

window.DATA = {

  work: [
    {
      id: 'satark', n: 'Satark.ai', y: '2026', k: 'Agentic AI',
      t: 'An agentic honeypot that keeps scam callers talking while it lifts their numbers, banks and playbook.',
      img: 'assets/art/shot-satark.jpg', live: 'https://adaptive-honeypot-agent.vercel.app/',
      repo: 'https://github.com/SushrithKbtech/finalguvi',
      d: `A conversational agent that answers scammers in character and quietly extracts
          intelligence while they think they are winning. "Bridge Logic" prompting keeps the
          cover story coherent across turns so the extraction never reads as an interrogation.
          Built in a weekend for the HCL GUVI AI Impact Summit and scored 88/100 — 8th
          nationwide out of 15,000+ teams, at Bharat Mandapam.`,
      stack: ['GPT-4.1-mini', 'Node.js', 'Express', 'Prompt Engineering', 'Railway'],
      metrics: [['8th', 'nationwide'], ['88/100', 'score'], ['15k+', 'teams beaten']],
    },
    {
      id: 'board', n: 'AI Boardroom', y: '2026', k: 'Multi-Agent',
      t: 'Twenty-three agents argue a startup pitch across two rounds — then an auditor checks every claim they made.',
      img: 'assets/art/shot-board.jpg', live: 'https://ai-boardroom-umber.vercel.app/',
      repo: 'https://github.com/SushrithKbtech/ai-boardroom',
      d: `Fifteen board-member archetypes, six specialists and two process agents. Every member
          forms an independent first read before seeing anyone else's, then a founder Q&A and a
          cross-examination round forces them to agree or disagree on the record. The board has
          no search tool of its own, so every outside fact has to come back from a specialist
          with a source attached — and an Evidence Auditor with no stake in the outcome checks
          the lot.`,
      stack: ['Relevance AI', 'Multi-Agent Orchestration', 'RAG', 'Next.js', 'TypeScript', 'Three.js'],
      metrics: [['23', 'agents'], ['2', 'debate rounds'], ['1', 'evidence auditor']],
    },
    {
      id: 'risk', n: 'Multi-Signal Risk', y: '2026', k: 'Orchestration',
      t: 'Four agents score risk in parallel, then resolve their own contradictions into one explainable verdict.',
      img: 'assets/art/shot-risk.jpg', live: 'https://prism-risk-rho.vercel.app/',
      d: `Description, Location, Historical Claims and Safety each score a case independently and
          simultaneously. A conflict-resolution layer reconciles contradictory signals rather than
          averaging them away, and every output carries a risk level, a premium-adjustment
          recommendation, a confidence score and the reasoning that produced it.`,
      stack: ['Relevance AI', 'Parallel Agents', 'Decision Systems', 'Explainable AI'],
      metrics: [['4', 'parallel agents'], ['3/6/9', 'scoring bands'], ['100%', 'traceable']],
    },
    {
      id: 'bhasha', n: 'BhashaBuddy', y: '2026', k: 'Full Stack',
      t: 'A language-learning platform helping NRI children keep their mother tongue, with live voice practice.',
      img: 'assets/art/shot-bhasha.jpg', live: 'https://parampara-one.vercel.app',
      d: `Interactive lessons and games for children growing up away from the language their family
          speaks. React/Vite on the front, Supabase for auth and progress, OpenAI for
          conversational practice and a text-to-speech layer that gives pronunciation feedback
          rather than just playing audio at them. Live, with a real user base.`,
      stack: ['React', 'Vite', 'Supabase', 'PostgreSQL', 'OpenAI API', 'Tailwind CSS'],
      metrics: [['4', 'team size'], ['8', 'languages'], ['live', 'on Vercel']],
    },
    {
      id: 'qbank', n: 'Outcome-QBank', y: '2026', k: 'RAG',
      t: 'Reads a syllabus, writes outcome-aligned exam papers, then critiques and retries its own questions.',
      img: 'assets/art/work-qbank.svg',
      live: 'https://question-bank-generator-bwvhnf3nfcblcmbhyf9zvt.streamlit.app/',
      d: `Ingests course PDFs and syllabus material into a ChromaDB vector store, retrieves the
          relevant outcomes with SentenceTransformer embeddings, and generates exam questions
          against them. The part that matters is the self-audit: a critique-retry loop checks every
          generated question back against the learning outcome and regenerates the ones that miss.
          In use by faculty.`,
      stack: ['ChromaDB', 'SentenceTransformers', 'Python', 'LLM critique loop', 'Streamlit'],
      metrics: [['top-k 6', 'retrieval'], ['3', 'retry attempts'], ['in use', 'by faculty']],
    },
    {
      id: 'ids', n: 'Hybrid DL IDS', y: '2025', k: 'Research',
      t: 'A supervised MLP and an unsupervised AutoEncoder, fused — 98.12% accuracy on CSE-CIC-IDS2018.',
      img: 'assets/art/work-ids.svg',
      d: `Intrusion detection that pairs a supervised MLP with an unsupervised AutoEncoder so the
          system can flag attacks it was never trained on. The fusion engine cuts false negatives
          on novel traffic where the RandomForest baseline quietly fails. Written up as
          "Hybrid AI-Powered Framework for Real-Time DDoS Detection" and presented at SWSIoT-2025
          in association with Springer.`,
      stack: ['PyTorch', 'MLP', 'AutoEncoder', 'Anomaly Detection', 'Python'],
      metrics: [['98.12%', 'accuracy'], ['96.95%', 'macro-F1'], ['Springer', 'published']],
    },
    {
      id: 'voice', n: 'Voice Translation', y: '2025', k: 'Edge AI',
      t: 'Real-time translation that keeps the speaker’s own voice across languages, on a Raspberry Pi.',
      img: 'assets/art/work-voice.svg',
      d: `Whisper for speech-to-text, M2M100 for translation and XTTS v2 for voice-cloned synthesis,
          wired into one low-latency pipeline. The hard part was not the accuracy — it was making
          all three fit on a Raspberry Pi without the latency making conversation impossible. You
          hear the other person's own voice, speaking your language.`,
      stack: ['Whisper', 'M2M100', 'XTTS v2', 'Raspberry Pi', 'Edge Inference'],
      metrics: [['3', 'models chained'], ['4 GB', 'target device'], ['real-time', 'latency']],
    },
    {
      id: 'eibp', n: 'EIBP on FABRIC', y: '2026', k: 'Networking',
      t: 'Implementing a routing protocol on a national research testbed, as an OSPF replacement.',
      img: 'assets/art/work-eibp.svg',
      d: `Ongoing research with Rochester Institute of Technology: implementing EIBP on the FABRIC
          testbed to replace OSPF. Protocol work on real distributed infrastructure rather than a
          simulator — convergence behaviour, routing-table correctness and failure recovery
          measured on live nodes.`,
      stack: ['FABRIC Testbed', 'Routing Protocols', 'C', 'Python', 'Network Programming'],
      metrics: [['RIT', 'research track'], ['OSPF', 'replacing'], ['2026', 'ongoing']],
    },
  ],

  /* the toolbox rails — real brand marks, downloaded by assets/get_icons.py */
  icons: [
    {
      "slug": "python",
      "label": "Python",
      "hex": "3776AB"
    },
    {
      "slug": "pytorch",
      "label": "PyTorch",
      "hex": "EE4C2C"
    },
    {
      "slug": "openai",
      "label": "OpenAI",
      "hex": "FFFFFF"
    },
    {
      "slug": "huggingface",
      "label": "Hugging Face",
      "hex": "FFD21E"
    },
    {
      "slug": "langchain",
      "label": "LangGraph",
      "hex": "5FD0A0"
    },
    {
      "slug": "scikitlearn",
      "label": "scikit-learn",
      "hex": "F7931E"
    },
    {
      "slug": "numpy",
      "label": "NumPy",
      "hex": "013243"
    },
    {
      "slug": "pandas",
      "label": "pandas",
      "hex": "150458"
    },
    {
      "slug": "jupyter",
      "label": "Jupyter",
      "hex": "F37626"
    },
    {
      "slug": "streamlit",
      "label": "Streamlit",
      "hex": "FF4B4B"
    },
    {
      "slug": "react",
      "label": "React",
      "hex": "61DAFB"
    },
    {
      "slug": "nextdotjs",
      "label": "Next.js",
      "hex": "FFFFFF"
    },
    {
      "slug": "typescript",
      "label": "TypeScript",
      "hex": "3178C6"
    },
    {
      "slug": "javascript",
      "label": "JavaScript",
      "hex": "F7DF1E"
    },
    {
      "slug": "threedotjs",
      "label": "Three.js",
      "hex": "FFFFFF"
    },
    {
      "slug": "tailwindcss",
      "label": "Tailwind",
      "hex": "06B6D4"
    },
    {
      "slug": "vite",
      "label": "Vite",
      "hex": "646CFF"
    },
    {
      "slug": "greensock",
      "label": "GSAP",
      "hex": "88CE02"
    },
    {
      "slug": "nodedotjs",
      "label": "Node.js",
      "hex": "999999"
    },
    {
      "slug": "express",
      "label": "Express",
      "hex": "FFFFFF"
    },
    {
      "slug": "supabase",
      "label": "Supabase",
      "hex": "3FCF8E"
    },
    {
      "slug": "postgresql",
      "label": "PostgreSQL",
      "hex": "4169E1"
    },
    {
      "slug": "mongodb",
      "label": "MongoDB",
      "hex": "47A248"
    },
    {
      "slug": "fastapi",
      "label": "FastAPI",
      "hex": "0FC9A0"
    },
    {
      "slug": "docker",
      "label": "Docker",
      "hex": "2496ED"
    },
    {
      "slug": "git",
      "label": "Git",
      "hex": "F05032"
    },
    {
      "slug": "github",
      "label": "GitHub",
      "hex": "FFFFFF"
    },
    {
      "slug": "vercel",
      "label": "Vercel",
      "hex": "FFFFFF"
    },
    {
      "slug": "linux",
      "label": "Linux",
      "hex": "FFFFFF"
    },
    {
      "slug": "c",
      "label": "C",
      "hex": "A8B9CC"
    },
    {
      "slug": "raspberrypi",
      "label": "Raspberry Pi",
      "hex": "A22846"
    },
    {
      "slug": "googlecloud",
      "label": "Google Cloud",
      "hex": "4285F4"
    }
  ],


  abilities: [
    ['Python', 92], ['Generative AI · LLMs', 90], ['Machine Learning', 88],
    ['RAG Systems', 87], ['Agentic AI', 85], ['Full-Stack Development', 84],
    ['React', 82], ['Node.js', 80],
  ],

  chips: ['Prompt Engineering', 'LangGraph', 'ChromaDB', 'Hugging Face', 'Whisper',
    'Supabase', 'Express', 'Tailwind CSS', 'Streamlit', 'Edge AI · Raspberry Pi',
    'Network Security'],

  /* the about section's counters — every one of these is on the CV */

  achievements: [
    { h: 'Top 8 Nationwide', w: 'HCL GUVI AI Impact Summit 2026 · Bharat Mandapam',
      p: 'Scored 88/100 among 15,000+ teams with Satark.ai, an agentic honeypot API for real-time scam detection, as part of Team n0l0ck.',
      m: '88/100' },
    { h: 'Research Paper, with Springer', w: 'SWSIoT-2025 · City Engineering College · Sept 2025',
      p: 'Co-authored and presented “Hybrid AI-Powered Framework for Real-Time DDoS Detection Using ML and Entropy-Based Analysis” at the Int’l Conference on Smart Wireless Systems and IoT.',
      m: '01' },
    { h: '1st Prize — Avishkar', w: 'Vemana Institute of Technology · ISTE & IEEE',
      p: 'First prize for a Traffic Management System at the inter-college project exhibition.',
      m: '₹3,000' },
  ],

  certs: [
    { bg: '#C6F24E', fg: '#0B0B0C', h: 'Software Testing', w: 'NPTEL · 12 weeks', s: 'Elite + Top 1%', m: '84/100',
      p: 'Test design, black- and white-box technique, automation and QA across the SDLC. Assignments 22.5/25, exam 61.5/75.' },
    { bg: '#2B3FA8', fg: '#F2F1EC', h: 'Affective Computing', w: 'NPTEL', s: 'Elite', m: '93/100',
      p: 'AI, psychology and design together — machines that recognise, process and respond to human emotion.' },
    { bg: '#0B0B0C', fg: '#F2F1EC', h: 'Transformer Models & BERT', w: 'Simplilearn × Google Cloud', s: 'Certified', m: '—',
      p: 'Attention mechanisms, transformer language modelling and BERT applied to NLP tasks. Certificate 10093578.' },
    { bg: '#E4452F', fg: '#FFFFFF', h: 'Open Source Models with Hugging Face', w: 'Simplilearn SkillUp', s: 'Certified', m: '—',
      p: 'The Hugging Face ecosystem, open-source model selection and practical NLP usage. Certificate 10093614.' },
    { bg: '#F2F1EC', fg: '#0B0B0C', h: 'Introduction to LangGraph', w: 'Simplilearn SkillUp', s: 'Certified', m: '—',
      p: 'Agentic workflow orchestration, stateful multi-step LLM pipelines and graph-based agent design. Certificate 10093427.' },
  ],

  /* the capability figure. [short, full, label x, label y, notch x, notch y] —
     coordinates are in the silhouette's own 460x520 viewBox. */
  caps: [
    ['Agentic AI',       'Agentic AI & multi-agent orchestration',   230, 110, 126, 108],
    ['RAG & Retrieval',  'RAG and retrieval pipelines that hold up', 230, 152, 336, 112],
    ['Applied ML',       'Applied ML research, end to end',          230, 194, 331, 240],
    ['Full-Stack',       'Full-stack product — React and Node',      230, 236, 129, 240],
    ['Edge Inference',   'Edge and on-device inference',             230, 272, 184, 316],
    ['Network Security', 'Network security and routing protocols',   230, 442, 276, 316],
    ['Data & SQL',       'Data, SQL and dashboards people read',     230, 484, 402, 398],
  ],

};
