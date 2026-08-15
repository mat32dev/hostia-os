export type PostSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
};

export type Lang = 'en' | 'es';

export type Post = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string;
  readMinutes: number;
  category: string;
  icon: string;
  accent: string;
  excerpt: string;
  sections: PostSection[];
  faq: { q: string; a: string }[];
  cta: string;
  /** Idioma del post. Por defecto 'en' para no romper posts existentes. */
  lang?: Lang;
};

export const posts: Post[] = [
  {
    slug: 'whatsapp-business-ai-agent',
    title: 'WhatsApp Business AI Agent: The 2026 Guide to Automating Sales & Support',
    description:
      'Everything you need to know about WhatsApp Business AI agents: how they work, real use cases for sales and support, pricing, Meta compliance, and how to launch one in under 30 days.',
    keywords: [
      'whatsapp business ai agent',
      'whatsapp automation for business',
      'whatsapp api for business',
      'ai whatsapp chatbot',
      'whatsapp commerce',
      'automate whatsapp messages',
    ],
    date: '2026-08-06',
    readMinutes: 9,
    category: 'WhatsApp',
    icon: 'message-circle',
    accent: 'from-emerald-500 to-teal-500',
    excerpt:
      'Over 2 billion people use WhatsApp every month, yet most businesses still reply by hand. Here is how an AI agent turns WhatsApp into your hardest-working sales and support channel.',
    sections: [
      {
        heading: 'Why WhatsApp is the highest-leverage channel you are ignoring',
        paragraphs: [
          'WhatsApp is not "just another messaging app". It is the channel where your customers already are: more than 2 billion monthly users, 100 billion messages sent every day, and open rates above 90% — several times higher than email or SMS.',
          'For a business, the gap is obvious. Email sits unread in an inbox. Phone calls ring unanswered. But a WhatsApp message gets read within minutes, and most customers expect a reply within the hour. That expectation is exactly what an AI agent is built to meet — instantly, politely, in any language, 24/7.',
        ],
        bullets: [
          'Open rates of 90%+ vs ~20% for email',
          'Native in Europe, LATAM, Africa and much of Asia — where your customers live',
          'Supports text, images, catalogs, payments and files natively',
          'A conversation thread your agent can continue for months',
        ],
      },
      {
        heading: 'What a WhatsApp Business AI agent actually is',
        paragraphs: [
          'A WhatsApp Business AI agent is an AI system connected to your WhatsApp Business number through the official Business Platform API. It reads incoming messages, understands intent, and responds automatically — using your data, your tone and your business rules.',
          'It is not a rigid chatbot with 20 hard-coded buttons. It uses a large language model (LLM) to understand open-ended questions, then calls your tools — CRM, calendar, catalog, payment links — to take real action. A human only steps in when the agent decides it is out of its depth.',
        ],
        bullets: [
          'LLM reasoning understands unscripted questions in any language',
          'Tool access: books appointments, updates CRM records, sends payment links',
          'Escalation to a human with full conversation context',
          'Runs on the official API — green-tick eligible, no ban risk from automation',
        ],
      },
      {
        heading: 'The 6 use cases that pay for the agent by month two',
        table: {
          headers: ['Use case', 'What the agent does', 'Typical impact'],
          rows: [
            ['Sales & lead qualification', 'Greets, qualifies, answers objections, sends quotes', '+40% conversion, −60% cost/lead'],
            ['Customer service', 'Answers FAQs, tracks orders, handles returns and surveys', '80%+ of tickets resolved without a human'],
            ['Appointment booking', 'Shows real-time availability, confirms and reminds', '−30% no-shows with smart reminders'],
            ['E-commerce', 'Interactive catalog, answers questions, checkout in-chat', 'Higher AOV, fewer abandoned carts'],
            ['Collections', 'Payment reminders with links, plans and proof of payment', 'Recovers 10–30% of late invoices'],
            ['Marketing & loyalty', 'Personalized broadcasts, promos, loyalty and events', 'Repeat purchases and higher LTV'],
          ],
        },
        paragraphs: [
          'Most clients start with one use case — usually sales or customer service — and add the others as the agent proves itself. Because it is the same agent with the same memory, every new use case reuses what it already learned.',
        ],
      },
      {
        heading: 'How the technology works (without the hype)',
        paragraphs: [
          'Under the hood there are three layers. The WhatsApp Business API handles message delivery and compliance. The AI layer — an LLM plus a conversation framework — decides what to reply and when to use a tool. The integration layer connects the agent to your CRM, calendar, helpdesk and payment provider.',
          'A well-built agent has explicit guardrails: an allowed set of tasks, a confident-enough threshold, and an escalation policy for everything else. It never hallucinates prices or promises a refund policy it cannot enforce.',
        ],
        bullets: [
          'Messages → API → agent → tool call → reply, typically in under 2 seconds',
          'Business rules (prices, policies, hours) loaded from your own data',
          'Every action logged; humans can take over in one click',
          'GDPR-compliant data handling and an AI-disclosure policy before launch',
        ],
      },
      {
        heading: 'Pricing: what it really costs in 2026',
        paragraphs: [
          'Costs fall into three buckets. The API and AI usage is per conversation — realistically a few euros per thousand conversations, often under 10–40 EUR/month for a small business. The bigger cost is setup: design, integrations and testing. On top sits optional managed operation (monitoring, updates, escalation handling).',
          'As a rule of thumb, a sales agent pays for itself if it qualifies just a handful of extra leads per month. A customer-service agent pays for itself by removing one part-time role. Measure against your current cost per lead and per ticket.',
        ],
      },
      {
        heading: 'Compliance: Meta rules you must respect',
        paragraphs: [
          'Meta regulates business messaging tightly. You must use the official Business Platform API (not personal WhatsApp automation), obtain opt-in consent before messaging, respect message templates for proactive outreach, and include a way to reach a human.',
          'Using unofficial automation on a personal number is the fastest way to get banned — and you lose your number and your customer conversations. If volume and reliability matter, do it through the API from day one.',
        ],
      },
      {
        heading: 'How to launch in under 30 days',
        paragraphs: [
          'A focused WhatsApp agent does not need six months. A pragmatic launch path: map your two or three highest-value conversations, design the flows and allowed tasks, connect CRM and calendar, test against real transcripts, then go live behind a human who can take over.',
          'HosT.ia builds exactly these agents — sales, support, booking, e-commerce and collections on WhatsApp Business — with managed 24/7 operation and SLA-backed uptime. We ship production-ready agents in under 30 days.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is a WhatsApp Business AI agent different from a normal chatbot?',
        a: 'Yes. A normal chatbot follows scripted buttons; an AI agent understands open-ended questions with a large language model and takes real actions — booking, quoting, updating CRM, sending payment links — instead of only answering.',
      },
      {
        q: 'Can I get banned for using an AI agent on WhatsApp?',
        a: 'Not if you use the official Business Platform API with opt-in consent and compliant message templates. Unofficial automation on a personal number is what gets numbers banned.',
      },
      {
        q: 'How much does a WhatsApp Business AI agent cost?',
        a: 'AI and API usage typically run tens of euros per month for a small business, plus one-time setup and optional managed operation. A sales agent usually pays for itself within two months.',
      },
      {
        q: 'How fast can we go live?',
        a: 'Simple use cases can be live in 7 days; the standard timeline is under 30 days including design, integration, testing and launch.',
      },
    ],
    cta: 'Deploy a WhatsApp Business AI agent in under 30 days',
  },
  {
    slug: 'ai-phone-receptionist',
    title: 'AI Phone Receptionist: Replacing Voicemail & Hold Music with a Voice Agent',
    description:
      'How AI phone receptionists work, what they cost versus a human front desk, and the inbound/outbound use cases that deliver a fast ROI — plus the privacy and quality limits to know before you buy.',
    keywords: [
      'ai phone receptionist',
      'ai answering service for business',
      'voice ai agent',
      'ai call answering',
      'virtual receptionist',
      'ai inbound call handling',
    ],
    date: '2026-08-06',
    readMinutes: 8,
    category: 'Voice',
    icon: 'phone',
    accent: 'from-violet-500 to-indigo-500',
    excerpt:
      'Missed calls are silent revenue leakage. A voice agent answers in seconds, never puts anyone on hold, and hands complex calls to a human with full context.',
    sections: [
      {
        heading: 'The cost of a missed call',
        paragraphs: [
          'Every missed call is a lead that went to voicemail, then to your competitor. Studies consistently show that the majority of callers who reach voicemail never leave a message — and most of those never call back. For a service business, that is direct revenue lost every single day.',
          'An AI phone receptionist exists to make "missed call" a thing of the past. It answers on the first ring, understands what the caller needs, and either resolves it or transfers to the right person with full context — no menus, no hold music.',
        ],
        bullets: [
          'Answers on the first ring, 24/7 — no voicemail black hole',
          'Natural-language understanding instead of "press 1 for…" trees',
          'Transfers with context: the human already knows who is calling and why',
          'Available in your customers\u2019 language, not just yours',
        ],
      },
      {
        heading: 'Inbound: the front desk you do not pay to keep warm',
        paragraphs: [
          'The highest-ROI inbound use cases are reception, routing, booking and basic support. The agent recognizes intent ("Do you have an appointment for a root canal?"), looks up real availability, books it, sends a confirmation by SMS or WhatsApp, and adds a reminder.',
          'For clinics, agencies, law firms, restaurants and property managers, that removes the most repetitive calls from the phone line entirely — and a human receptionist is freed to handle the calls that actually need judgment.',
        ],
        bullets: [
          'Receptionist: greeting, intent detection, smart routing',
          'Appointment booking against live calendars',
          'FAQs: hours, location, prices, policies, procedures',
          'After-hours coverage without paying overtime',
        ],
      },
      {
        heading: 'Outbound: calling at the scale a team never could',
        paragraphs: [
          'The same voice agent can call out — B2B cold outreach, follow-ups after a quote or a cart, payment reminders, and CSAT surveys. Modern text-to-speech is indistinguishable from a human to most callers, and it never tires of rejection.',
          'Outbound agents typically contact ten times more accounts per day than a human team, at a fraction of the cost, and can leave voicemails, book callbacks or transfer a qualified prospect live to a closer.',
        ],
        bullets: [
          'B2B cold calling: qualification scripts, objection handling, scheduling',
          'Collections: reminders and payment-plan negotiation by phone',
          'CSAT / NPS surveys after a service interaction',
          'Lead re-engagement: calling back every lead that went quiet',
        ],
      },
      {
        heading: 'What the technology stack looks like',
        paragraphs: [
          'A voice agent is speech-to-text (STT) → language model → text-to-speech (TTS), with a small orchestration layer for interruption handling, barge-in, and transfers. Latency matters: the best systems respond in under a second so the conversation feels natural.',
          'Quality is the differentiator. Sloppy STT on an accented caller, robotic TTS, or an agent that "um"s in the wrong places destroys trust in seconds. This is where an experienced build — and careful voice selection — pays for itself.',
        ],
      },
      {
        heading: 'Costs: AI vs a human front desk in 2026',
        table: {
          headers: ['Option', 'Monthly cost', 'Coverage', 'Scaling'],
          rows: [
            ['Full-time receptionist (incl. taxes)', '€2,000–3,500', 'Office hours only', 'Adds one headcount per line'],
            ['Traditional IVR / auto-attendant', '€50–300', '24/7 but scripted', 'Rigid, frustrating to callers'],
            ['AI phone receptionist (managed)', '€500–2,000', '24/7, any language', 'Scales with no extra headcount'],
          ],
        },
        paragraphs: [
          'The AI option is not about replacing every receptionist — it is about never losing a call, covering nights and weekends, and letting your people focus on conversations that need a human. Most clients keep the same headcount and simply get more revenue from the same team.',
        ],
      },
      {
        heading: 'Privacy and the limits you should know',
        paragraphs: [
          'Voice is personal data. The agent must be GDPR-compliant: consent or legitimate-interest handling, limited retention of recordings, no training on your customers, and a disclosure that the caller is speaking with an AI where required.',
          'There are also honest limits. A voice agent is not a substitute for deep human empathy in a crisis, a medical emergency or a complex complaint. The right architecture detects those moments and hands off immediately — which is exactly how an enterprise-grade system behaves.',
        ],
      },
      {
        heading: 'How to start without buying a POC that disappoints',
        paragraphs: [
          'Start with one phone line and one use case — typically after-hours reception or appointment booking — and measure missed-call recovery, first-call resolution and transfer rates. If the agent lifts those in a month, roll it out to the rest of the lines.',
          'HosT.ia builds managed voice agents — inbound reception, outbound sales and collections, natural-language IVR replacement — with human-like latency, live dashboards and SLA-backed uptime.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can callers tell they are talking to an AI?',
        a: 'With current speech synthesis, most callers cannot reliably tell — which is exactly why disclosure is important where required by law or policy. A well-built agent is honest and transparent, not deceptive.',
      },
      {
        q: 'What happens if the AI cannot help?',
        a: 'The agent detects low confidence or an out-of-scope request and transfers to a human with full conversation context, so the caller never explains themselves twice.',
      },
      {
        q: 'Is an AI receptionist cheaper than hiring a person?',
        a: 'For 24/7 coverage, yes — a fraction of one FTE. The highest-value use is supplementing your existing team so no call is ever missed, rather than replacing a receptionist outright.',
      },
      {
        q: 'Does it work in multiple languages?',
        a: 'Yes. The same agent can answer in any language you configure, which is a genuine advantage for clinics, hotels and international businesses.',
      },
    ],
    cta: 'Never miss another call — deploy a voice agent',
  },
  {
    slug: 'ai-collections-agent',
    title: 'AI Collections Agent: Recovering Late Payments Without a Single Angry Call',
    description:
      'Automated accounts receivable: how AI collections agents use WhatsApp, SMS, email and voice with payment links to recover late invoices — ethically, compliantly and measurably.',
    keywords: [
      'ai collections software',
      'automated payment reminders',
      'accounts receivable automation',
      'ai debt collection',
      'payment reminder whatsapp',
      'invoice chasing automation',
    ],
    date: '2026-08-06',
    readMinutes: 8,
    category: 'Operations',
    icon: 'coins',
    accent: 'from-amber-500 to-orange-500',
    excerpt:
      'Late payments are a loan you did not agree to. An AI agent chases every invoice across every channel — politely, consistently and without burning relationships.',
    sections: [
      {
        heading: 'Late payments are your most expensive silent cost',
        paragraphs: [
          'The average business waits far beyond its payment terms, and small companies are hit hardest — a few late invoices can threaten payroll. Every late payment is effectively an unsecured, zero-interest loan you gave to someone else, funded by your own cash flow.',
          'The painful part is that most late payments are not malicious; they are forgotten. The invoice sits in a pile, the reminder email goes to spam, and nobody calls. An AI collections agent exists to remove that friction — politely and persistently, in the channel each customer actually reads.',
        ],
        bullets: [
          'Most late payers are forgetful, not unwilling',
          'The first reminder is the single highest-yield step',
          'Automation removes the awkwardness of chasing friends and clients',
          'Consistency beats volume: 7 touches across channels is the classic threshold',
        ],
      },
      {
        heading: 'How an AI collections agent works',
        paragraphs: [
          'The agent watches your open invoices, segments them by age and risk, and runs a scheduled sequence: a WhatsApp or SMS reminder with a payment link, then an email, then a voice call that lets the customer negotiate a plan. Every response is understood and acted on — a payment link clicked, a plan agreed, a dispute escalated.',
          'Because it negotiates in natural language, it can handle the real reasons people do not pay — "can I split it?", "the invoice number is wrong", "I\u2019m waiting on my client" — instead of sending the same email three times.',
        ],
        bullets: [
          'Multi-channel: WhatsApp, SMS, email and voice in one sequence',
          'Pay-now links that go straight to your payment provider',
          'Payment-plan negotiation in natural language',
          'Proof-of-payment and receipts handled automatically',
        ],
      },
      {
        heading: 'Ethical and regulatory guardrails',
        paragraphs: [
          'Debt collection is regulated, and AI makes the stakes higher. A compliant system has hard guardrails: reasonable contact hours, capped contact frequency, respect for "do not contact" requests, accurate and non-coercive language, and GDPR-compliant data handling.',
          'The right framing matters commercially too. An agent that shames or pressures customers destroys the relationship you are trying to preserve. The most effective tone is helpful and firm — "here is an easy way to settle this" — not threatening.',
        ],
        bullets: [
          'Never harasses: frequency caps and quiet hours enforced',
          'Full audit log of every touch and every promise',
          'Human escalation for disputes, hardship and legal cases',
          'GDPR-compliant by design, data kept separate per client',
        ],
      },
      {
        heading: 'What results to expect',
        paragraphs: [
          'Agencies and SaaS companies typically recover between 10% and 30% of aged receivables in the first quarter of automation, with the biggest gains in the 30–90 day bucket where human teams lose track. Days Sales Outstanding (DSO) drops because the first reminder goes out the day after the due date, not three weeks later.',
          'The economics are unusually clean: an AI agent costs a small monthly fee and recovers real money, so the ROI is directly measurable on the bank statement.',
        ],
        table: {
          headers: ['Metric', 'Before automation', 'With an AI collections agent'],
          rows: [
            ['Time to first reminder', '3–6 weeks', '1 day after due date'],
            ['Channels used', 'Email only', 'WhatsApp + SMS + email + voice'],
            ['Touchpoints per invoice', '1–2', 'Up to 7, adaptive'],
            ['DSO (days sales outstanding)', '45–70 days', 'Often 10–20 days lower'],
            ['Recovered aged receivables (90d+)', 'Rarely tracked', '10–30% in the first quarter'],
          ],
        },
      },
      {
        heading: 'Implementation: 4 steps to a working pipeline',
        paragraphs: [
          'First, connect your accounting or CRM data so the agent sees invoices, aging and contacts. Second, define your sequence: channels, timing, tone and escalation rules per risk bucket. Third, test against real customer transcripts and tune the language. Fourth, launch with a human supervising — and switch to autonomous once accuracy proves out.',
          'HosT.ia builds managed collections agents across WhatsApp, SMS, email and voice, with payment links, plan negotiation, live dashboards and full audit trails — launched in under 30 days.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is automated collections chasing legal?',
        a: 'Yes, when done within the law: reasonable hours, capped frequency, accurate language and respect for opt-outs. A compliant agent enforces these automatically — better than most manual processes.',
      },
      {
        q: 'Won\u2019t an AI agent annoy my customers?',
        a: 'Done right, it has the opposite effect: customers appreciate a fast, easy way to pay with a link and a plan option. Frequency caps and tone rules prevent it from ever becoming harassment.',
      },
      {
        q: 'Does it integrate with my accounting software?',
        a: 'Yes. The agent connects to your invoicing or CRM so aging, contacts and payments stay in sync — no double data entry.',
      },
      {
        q: 'How quickly do we see results?',
        a: 'Most clients see recovered payments within the first month, with meaningful impact on DSO within a quarter.',
      },
    ],
    cta: 'Recover late payments automatically — get started',
  },
  {
    slug: 'ai-for-restaurants',
    title: 'AI for Restaurants in 2026: WhatsApp Orders, AI Waiters & Cash Reconciliation',
    description:
      'The practical AI stack for hospitality: WhatsApp ordering and reservations, POS-aware AI waiters, review automation, and AI that reconciles cash to stop revenue leakage.',
    keywords: [
      'ai for restaurants',
      'whatsapp ordering for restaurants',
      'ai waiter',
      'restaurant automation',
      'hospitality ai',
      'pos ai',
      'ai cash reconciliation',
    ],
    date: '2026-08-06',
    readMinutes: 9,
    category: 'Hospitality',
    icon: 'utensils',
    accent: 'from-rose-500 to-pink-500',
    excerpt:
      'Hospitality is a margin business, and margins are won in small increments: orders taken right, tables filled, reviews answered, and every euro reconciled.',
    sections: [
      {
        heading: 'The restaurant industry has an AI problem — and it is a good one',
        paragraphs: [
          'Hospitality has brutal economics: thin margins, high turnover, and revenue lost in a dozen small leaks — missed reservation calls, abandoned orders, unanswered reviews, and cash that does not reconcile at the end of the night.',
          'AI in 2026 finally targets those specific leaks instead of adding another dashboard nobody opens. The best deployments are small, boring and profitable: a WhatsApp ordering line, a POS-aware AI waiter, automated review responses, and a system that checks the CCTV against the till.',
        ],
      },
      {
        heading: 'WhatsApp ordering: the channel your guests already use',
        paragraphs: [
          'In most markets, guests would rather message than call. A WhatsApp ordering agent takes reservations, orders for pickup and delivery, and answers menu questions — in any language — while integrating with your POS and payment links. No app to install, no "order through our new platform" friction.',
          'The economics are immediate: a full-time phone can take 10–15 calls an hour, while an AI agent handles hundreds of conversations concurrently and never puts a guest on hold during the dinner rush.',
        ],
        bullets: [
          'Reservations with live table availability and confirmations',
          'Takeaway and delivery orders with payment links',
          'Menu questions, allergens and recommendations in any language',
          'POS-aware: knows stock and table status, so it never oversells',
        ],
      },
      {
        heading: 'The POS-aware AI waiter',
        paragraphs: [
          'The difference between a chatbot and an AI waiter is context. A POS-aware agent sees real inventory, open tables and order state — so "can I still order the cod?" is answered against actual stock, and "can I get the bill?" triggers the real checkout flow.',
          'That context is what turns a novelty into an operator. It reduces training time for new staff, keeps the service consistent during a rush, and captures upsells a busy human would miss.',
        ],
      },
      {
        heading: 'Stop the biggest silent leak: cash that does not reconcile',
        paragraphs: [
          'In bars, cafés and restaurants, a proportion of revenue quietly disappears — a tab modified, an item not entered, a cash sale short-recorded. Most operators only notice at audit time, if ever.',
          'AI security for cash handling cross-references the till and the cameras: it watches each cash transaction at the register and matches it against what was actually rung up. Discrepancies are flagged in near real-time with the video evidence attached. It is the difference between hoping the team is honest and knowing it.',
        ],
        bullets: [
          'Video + POS cross-checking on every cash transaction',
          'Near-real-time alerts with frame-level evidence',
          'Deters shrinkage before it becomes a habit',
          'Runs on your existing CCTV — no new hardware required',
        ],
      },
      {
        heading: 'Reviews, ratings and the 5-minute response rule',
        paragraphs: [
          'Restaurants live and die by their Google rating, and the algorithm rewards fast responses. An AI agent answers every review in the guest\u2019s language within minutes — thanking, apologizing, and offering a genuine fix offline — and escalates the serious ones to the manager before they go viral.',
        ],
        bullets: [
          'Instant responses to every review, in any language',
          'Escalation for health, safety and VIP complaints',
          'Sentiment trends so you spot kitchen or service problems early',
          'No more unpaid hours spent replying to reviews by hand',
        ],
      },
      {
        heading: 'Putting it together: a stack that pays for itself',
        table: {
          headers: ['Area', 'AI tool', 'Measurable outcome'],
          rows: [
            ['Ordering & reservations', 'WhatsApp AI waiter', 'Fewer missed calls, no-show reminders, POS-aware upsells'],
            ['Review management', 'AI review responder', 'Higher rating, faster reply time, early problem detection'],
            ['Cash handling', 'AI security analyst (video+POS)', 'Real shrinkage detected with evidence'],
            ['Front of house', 'Voice receptionist', '24/7 coverage without adding headcount'],
          ],
        },
        paragraphs: [
          'None of these require a six-figure budget or a tech team. Each one solves one measurable problem, and together they take a meaningful percentage point or two back to the bottom line — which, at restaurant margins, is everything.',
          'HosT.ia builds the hospitality stack on open-source foundations: a free POS that runs offline on any tablet, a WhatsApp AI waiter, and Guard, an AI security analyst for cash handling. Production-ready and managed end to end.',
        ],
      },
    ],
    faq: [
      {
        q: 'Does a WhatsApp ordering agent need an app?',
        a: 'No. Guests message your existing number. The agent handles reservations, takeaway orders and menu questions directly in WhatsApp.',
      },
      {
        q: 'Is AI cash reconciliation legal to monitor staff?',
        a: 'Yes, within labor-law bounds. It monitors the cash register and store cameras, not employees\u2019 private spaces, and operators should disclose camera use as they already do.',
      },
      {
        q: 'Can it work with my existing POS?',
        a: 'Yes. The AI waiter and cash analyst integrate with your current POS; they do not require switching systems.',
      },
      {
        q: 'What is the fastest way to start?',
        a: 'Pick one leak — usually reservations or cash reconciliation — launch that first, measure it for a month, then add the rest of the stack.',
      },
    ],
    cta: 'Build your restaurant AI stack — book a strategy call',
  },
  {
    slug: 'deepseek-harness-guia-completa',
    title:
      'DeepSeek Harness: la guía completa del agente open-source que rivaliza con Claude Code',
    description:
      'Todo sobre DeepSeek Harness v0.1: qué es, cómo instalar el CLI dsh, la arquitectura "everything is a plugin" sobre Cordis, y cómo se compara con Claude Code, Codex y el resto de agent harnesses.',
    keywords: [
      'deepseek harness',
      'deepseek harness guia',
      'deepseek harness vs claude code',
      'deepseek harness cordis',
      'agente de codigo ia deepseek',
      'dsh cli',
      'agent harness open source',
      'deepseek v4 flash harness',
    ],
    date: '2026-08-15',
    readMinutes: 9,
    category: 'DeepSeek',
    icon: 'terminal',
    accent: 'from-blue-500 to-cyan-500',
    lang: 'es',
    excerpt:
      'El 13 de agosto DeepSeek abrió su primer agente de código: DeepSeek Harness. Todo es un plugin. Esto es lo que trae, cómo se instala y por qué compite de frente con Claude Code y Codex.',
    sections: [
      {
        heading: 'DeepSeek dejó de ser solo un modelo',
        paragraphs: [
          'DeepSeek abrió el 13 de agosto de 2026 su primer producto de agentes: DeepSeek Harness v0.1, un runtime de agentes open-source publicado bajo licencia MIT como Developer Preview. Con él, la compañía da un paso más allá de los modelos y empieza a controlar la capa de software que las rodea.',
          'Durante años DeepSeek fue conocido por un único asset: los modelos. Con este lanzamiento apuesta por lo que llaman "infraestructura digital para agentes autónomos": sistemas capaces de usar una IA para operar software externo, ejecutar código y completar tareas complejas por su cuenta. Es el mismo giro hacia la agentic AI que están dando Anthropic con Claude Code y OpenAI con Codex — pero en open-source.',
        ],
        bullets: [
          'Un paso más allá del modelo: controla la capa de software de los agentes.',
          'Open-source bajo MIT, no un clon cerrado.',
          'Arquitectura de plugins donde modelos, tools y UI son intercambiables — sin lock-in de vendor.',
        ],
      },
      {
        heading: 'Qué es exactamente DeepSeek Harness',
        paragraphs: [
          'DeepSeek Harness es un agent runtime — el "armazón" (harness) que envuelve a un modelo y lo convierte en un agente capaz de razonar, usar herramientas y ejecutar tareas de principio a fin. Es el equivalente open-source de Claude Code y Codex, pero con una filosofía radicalmente distinta: "everything is a plugin".',
          'En un harness tradicional el modelo, las tools y el loop de agente están más o menos fijados por el fabricante. En DeepSeek Harness casi cada capacidad es un plugin: modelos, tools, skills, sesiones, sandboxes, filesystems, loops de agente, orquestación y hasta la capa de UI.',
        ],
        bullets: [
          'Modelos: conecta DeepSeek, OpenAI, Anthropic o locales vía Ollama.',
          'Tools: shell, editor, búsqueda — lo que definas.',
          'Skills: capacidades reutilizables como plugins.',
          'Si puedes cambiar modelo, herramientas y loop como piezas separadas, el harness se adapta a tu flujo en vez de obligarte a adaptarte tú.',
        ],
      },
      {
        heading: 'La arquitectura: todo sobre Cordis',
        paragraphs: [
          'La pieza técnica más interesante es Cordis, el meta-framework sobre el que está construido. Cordis no implementa el agente en sí: solo gestiona la carga, descarga y dependencias de plugins. Los plugins colaboran entre sí mediante dos mecanismos — servicios y eventos — lo que los mantiene desacoplados y fáciles de sustituir.',
          'Esto tiene dos consecuencias prácticas: añadir una tool nueva es añadir un plugin sin tocar el núcleo, y cada pieza individual puede mejorarse o cambiarse sin romper el resto. Se ejecuta sobre Node.js y el arranque se hace con npx @deepseek-ai/dsh web.',
        ],
        bullets: [
          'Extensible: añadir una tool nueva = añadir un plugin.',
          'Reemplazable: cada pieza se cambia sin romper el resto.',
          'Node.js: npx @deepseek-ai/dsh web lanza la Web UI; también funciona como CLI.',
        ],
      },
      {
        heading: 'Cómo instalarlo en 5 minutos',
        paragraphs: [
          'La instalación es directa porque es un paquete de Node. Con Node.js instalado basta con lanzar el comando y listo.',
          'Es una Developer Preview: también puedes clonar el repo de GitHub e instalar desde fuente. Al ser open-source (MIT), puedes forkearlo, inspeccionarlo y adaptarlo a tus necesidades.',
        ],
        bullets: [
          'npx @deepseek-ai/dsh web — arranca la interfaz Web UI.',
          'npx @deepseek-ai/dsh — uso como CLI.',
          'Clonar el repositorio e instalar desde fuente si prefieres.',
        ],
      },
      {
        heading: 'Comparativa: DeepSeek Harness vs Claude Code vs Codex',
        table: {
          headers: ['Criterio', 'DeepSeek Harness', 'Claude Code', 'OpenAI Codex'],
          rows: [
            ['Código', 'Open-source (MIT)', 'Cerrado', 'Cerrado'],
            ['Cambio de modelo', 'Cualquiera (plugin)', 'Claude (fijado)', 'GPT (fijado)'],
            ['Tools', 'Plugins intercambiables', 'Ecosistema cerrado', 'Ecosistema cerrado'],
            ['Arquitectura', 'Todo-por-plugin (Cordis)', 'Caja cerrada', 'Caja cerrada'],
            ['Coste modelo', 'El que conectes', 'Claude API', 'GPT API'],
            ['Vendor lock-in', 'No', 'Sí', 'Sí'],
          ],
        },
        paragraphs: [
          'La ventaja estructural del harness de DeepSeek frente a Claude Code y Codex es que no te encierra en un modelo. Puedes conectar el modelo que quieras — incluidas las propias V4 Flash o V4 Pro — y cambiar de proveedor sin migrar de herramienta. Para equipos que ya trabajan con varios modelos es un diferenciador real.',
        ],
      },
      {
        heading: 'El ecosistema: no es el único harness',
        paragraphs: [
          'DeepSeek Harness entra en un ecosistema ya poblado. The Register sitúa junto a Claude Code y Codex a otros harnesses: Aider, Cline, Goose, OpenCode, OpenHands y Pi, entre otros. Cada uno tiene su enfoque — algunos más centrados en terminal, otros en IDE, otros en autonomía multi-agente.',
          'Lo que distingue a DeepSeek Harness es la arquitectura de plugins todo-intercambiable y la apuesta de una compañía de primer nivel por liberarlo en MIT. No es un proyecto de comunidad que espera madurar: es un movimiento estratégico de DeepSeek para competir en la capa de agentes, con un equipo dedicado ("DeepSeek Harness Team") que ya está contratando.',
        ],
      },
      {
        heading: 'Por qué esto te importa',
        paragraphs: [
          'Si construyes agentes o automatizaciones, DeepSeek Harness te da una alternativa abierta a las cajas cerradas de Anthropic y OpenAI. Puedes probar el mismo loop de agente con distintos modelos y elegir el mejor por calidad, precio y latencia; extenderlo con tus propias tools sin pelear contra una API privada; y desplegarlo en self-hosting manteniendo el control de tus datos y de tu coste.',
          'Y si usas los modelos DeepSeek — especialmente la V4 Flash por su relación calidad-precio — el harness es la forma natural de ejecutarlos como agente de principio a fin.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Hay que pagar por DeepSeek Harness?',
        a: 'No. Es open-source bajo licencia MIT, publicado en GitHub como Developer Preview. Solo pagas el uso del modelo que conectes (por ejemplo, la API de DeepSeek).',
      },
      {
        q: '¿Sirve solo con modelos DeepSeek?',
        a: 'No. Como todo es un plugin, puedes conectar modelos de distintos proveedores (DeepSeek, OpenAI, Anthropic, locales vía Ollama, etc.). Esa es precisamente su ventaja.',
      },
      {
        q: '¿Es estable para producción?',
        a: 'Está en Developer Preview (v0.1, lanzado el 13/8/2026). Es prometedor y muy flexible, pero aún es joven: prodúcelo con cautela y evalúa según tu caso.',
      },
      {
        q: '¿Qué diferencia hay entre DeepSeek Harness y Claude Code?',
        a: 'La clave es la apertura: DeepSeek Harness es MIT con arquitectura de plugins intercambiables y modelo libre, mientras Claude Code es un producto cerrado atado al ecosistema de Anthropic.',
      },
      {
        q: '¿Cómo lo instalo?',
        a: 'Con Node.js: npx @deepseek-ai/dsh web para la interfaz Web UI, o npx @deepseek-ai/dsh como CLI. También puedes clonar el repo e instalar desde fuente.',
      },
    ],
    cta: '¿Construyes agentes con IA? Hablemos de tu stack.',
  },
  {
    slug: 'instalar-deepseek-harness',
    title: 'Cómo instalar DeepSeek Harness en 5 minutos (npx dsh)',
    description:
      'Instala DeepSeek Harness v0.1 con npx dsh en menos de 5 minutos. Guía paso a paso del CLI y la Web UI, requisitos y cómo lanzar tu primer agente. Tutorial directo para developers.',
    keywords: [
      'instalar deepseek harness',
      'deepseek harness npx dsh',
      'como instalar deepseek harness',
      'deepseek hardware install',
      'dsh cli deepseek',
      'deepseek harness web ui',
    ],
    date: '2026-08-15',
    readMinutes: 4,
    category: 'DeepSeek',
    icon: 'download',
    accent: 'from-blue-500 to-cyan-500',
    lang: 'es',
    excerpt:
      'DeepSeek Harness se instala en 5 minutos: npx @deepseek-ai/dsh web lanza la Web UI y npx @deepseek-ai/dsh funciona como CLI. Aquí está el paso a paso exacto, sin rodeos.',
    sections: [
      {
        heading: 'Requisitos previos',
        paragraphs: [
          'Lo único que necesitas es Node.js instalado en tu máquina. DeepSeek Harness v0.1 (Developer Preview, licencia MIT, lanzado el 13/8/2026) corre sobre Node.js, así que con un Node moderno (v18+) tienes suficiente. No requiere GPU: los modelos se conectan por API (DeepSeek, OpenAI, Anthropic) o vía Ollama para locales.',
        ],
        bullets: [
          'Node.js v18 o superior (recomendado Node LTS).',
          'Sin GPU requerida para el harness en sí — el procesado lo hace el modelo que conectes.',
          'Una API key del proveedor de modelo (DeepSeek, OpenAI, Anthropic) o un modelo local vía Ollama.',
        ],
      },
      {
        heading: 'Paso 1: lanza la Web UI con npx',
        paragraphs: [
          'El arranque más rápido es la interfaz web. Abre tu terminal y ejecuta:',
          'npx @deepseek-ai/dsh web',
        ],
        bullets: [
          'npx descarga el paquete y lanza la Web UI en tu navegador.',
          'Es una Developer Preview: la primera ejecución puede tardar un poco en descargar el paquete.',
          'Desde la interfaz eliges el modelo, configuras tus tools y lanzas la primera sesión de agente.',
        ],
      },
      {
        heading: 'Paso 2: o úsalo como CLI',
        paragraphs: [
          'Si prefieres línea de comandos, el mismo paquete funciona como CLI:',
          'npx @deepseek-ai/dsh',
        ],
        bullets: [
          'Ideal para automatizar, scripts y entornos headless (CI/CD, cron, self-hosting).',
          'El harness es multiplataforma porque es Node.js: funciona en macOS, Linux y Windows.',
          'Toda la configuración de modelos, tools y skills se gestiona como plugins — ver el deep dive de Cordis.',
        ],
      },
      {
        heading: 'Paso 3: conecta un modelo y arranca',
        paragraphs: [
          'DeepSeek Harness sigue la filosofía "everything is a plugin" (sobre el meta-framework Cordis): el modelo, las tools y el loop de agente son piezas intercambiables que conectas a tu gusto. No te encierra en DeepSeek — puedes usar OpenAI, Anthropic o un modelo local vía Ollama.',
          'En la Web UI eliges el provider, pegas tu API key, y con un botón lanzas la primera sesión. El harness se encarga del loop: razonar, usar herramientas, ejecutar código y completar la tarea de principio a fin. Si quieres el detalle de arquitectura, tienes la guía completa del agente open-source que rivaliza con Claude Code.',
        ],
        bullets: [
          'Cambiar de modelo = cambiar un plugin, sin migrar de herramienta.',
          'Self-hosting total: tus datos y tu coste quedan bajo tu control.',
          'Si usas DeepSeek V4 Flash, el harness es la forma natural de ejecutarlo como agente end-to-end.',
        ],
      },
      {
        heading: 'Solución de problemas rápida',
        paragraphs: [
          'Si algo falla en el arranque, lo más común es un Node desactualizado o una API key mal configurada. Comprueba la versión con node -v (necesitas v18+) y que la key esté activa en el panel del provider.',
        ],
        bullets: [
          'node -v debe devolver v18 o superior; si no, actualiza Node.',
          'Al ser Developer Preview, revisa el repo de GitHub por issues conocidos de tu sistema operativo.',
          'Prueba primero un modelo rápido (como V4 Flash) antes de pasar a modelos más pesados.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Necesito una GPU para instalar DeepSeek Harness?',
        a: 'No. El harness es solo el runtime (Node.js); el procesado lo hace el modelo que conectes por API o vía Ollama local. Para modelos grandes locales sí necesitarías hardware, pero con la API no.',
      },
      {
        q: '¿Funciona en Windows?',
        a: 'Sí. Al estar construido sobre Node.js, DeepSeek Harness funciona en macOS, Linux y Windows.',
      },
      {
        q: '¿Hay que pagar por DeepSeek Harness?',
        a: 'No, es open-source bajo licencia MIT. Solo pagas el uso del modelo que conectes (por ejemplo, la API de DeepSeek).',
      },
      {
        q: '¿Con qué comando arranco la Web UI?',
        a: 'npx @deepseek-ai/dsh web. Para uso CLI: npx @deepseek-ai/dsh.',
      },
      {
        q: '¿Es estable para producción?',
        a: 'Está en Developer Preview (v0.1). Es prometedor y flexible, pero joven: prodúcelo con cautela y evalúa según tu caso.',
      },
    ],
    cta: '¿No quieres montar tu propio harness? Déjanos construirlo por ti en producción.',
  },
  {
    slug: 'deepseek-v4-flash-mejor-calidad-precio',
    title: 'DeepSeek V4 Flash: el mejor modelo calidad-precio de 2026 (benchmarks reales)',
    description:
      'DeepSeek V4 Flash rinde a la altura de modelos 3x más caros: en GPQA Diamond (90%) supera a la V4 Pro (87.7%) por una fracción del coste. Con los benchmarks y precios reales de OpenRouter, esta es tu tesis calidad/precio del 2026.',
    keywords: [
      'deepseek v4 flash',
      'deepseek v4 flash precio',
      'deepseek v4 flash benchmarks',
      'deepseek v4 flash vs v4 pro',
      'mejor modelo calidad precio 2026',
      'deepseek pricing 2026',
      'v4 flash gpqa',
    ],
    date: '2026-08-16',
    readMinutes: 8,
    category: 'DeepSeek',
    icon: 'zap',
    accent: 'from-amber-500 to-orange-500',
    lang: 'es',
    excerpt:
      'El dato que sostiene la tesis calidad/precio: la V4 Flash marca un 90% en GPQA Diamond (por encima del 87.7% de la V4 Pro) costando ~3x menos. Benchmarks y precios reales de OpenRouter.',
    sections: [
      {
        heading: 'El benchmark que sostiene la tesis',
        paragraphs: [
          'La tesis calidad/precio de la V4 Flash (versión 0731) se apoya en los benchmarks reales que publica OpenRouter para este modelo. En GPQA Diamond, el benchmark de razonamiento científico de nivel doctoral, la Flash marca un 90.0% en el provider de DeepSeek, por encima del 87.7% (routing ponderado) de la V4 Pro 0813.',
          'Que un modelo más barato iguale o supere a su hermano mayor en razonamiento no es casualidad: refleja un diseño optimizado para la inferencia rápida sin sacrificar la capacidad de razonar. Para la mayoría de tareas de productividad y automatización, la Flash es la mejor elección coste/beneficio.',
        ],
        bullets: [
          'GPQA Diamond: Flash 90.0% vs Pro 87.7% — la barata supera a la cara en razonamiento científico.',
          'Tau-Bench: la Pro marca un 79.3% frente al 77.8% de la Flash (en agentes la Pro gana ligeramente).',
          'Sea cual sea el benchmark, la Flash iguala o roza a la Pro a una fracción del coste.',
        ],
      },
      {
        heading: 'Precios reales en OpenRouter: cuánto cuesta de verdad',
        paragraphs: [
          'Los precios oficiales en OpenRouter (USD por millón de tokens) son la referencia real de coste. La V4 Flash 0731 cuesta $0.14 por millón de tokens de entrada y $0.28 por millón de salida. La V4 Pro 0813 cuesta $0.435 por millón de entrada y $0.87 por millón de salida.',
          'En la práctica, la Flash es unas 3x más barata que la Pro. Esa diferencia, multiplicada por un volumen alto de tokens en cargas de agentes y automatizaciones, se traduce en un ahorro enorme sin renunciar a rendimiento de gama alta.',
        ],
        table: {
          headers: ['Métrica', 'V4 Flash 0731', 'V4 Pro 0813'],
          rows: [
            ['Input (/M tokens)', '$0.14', '$0.435'],
            ['Output (/M tokens)', '$0.28', '$0.87'],
            ['Razón de coste', '1x', '~3.1x más cara'],
            ['GPQA Diamond', '90.0%', '87.7%'],
            ['Tau-Bench', '77.8%', '79.3%'],
          ],
        },
      },
      {
        heading: 'Por qué la Flash es tu mejor apuesta calidad-precio',
        paragraphs: [
          'La gran ventaja no es solo el precio bruto, sino lo que obtienes por él. Para el 90% de las tareas reales — agentes, automatizaciones, chatbots, resúmenes, razonamiento multi-paso — la Flash ofrece rendimiento de gama alta a una fracción del coste.',
          'Además, el thinking (chain-of-thought) viene habilitado por defecto en la API tanto en V4 Pro como en V4 Flash, lo que significa que incluso la opción económica razona de forma transparente antes de responder.',
        ],
        bullets: [
          'Usa la Flash para el 90% de tus tareas; reserva la Pro solo para casos edge que lo justifiquen.',
          'El reasoning-by-default hace a la Flash competente en tareas de agente complejas, no solo en preguntas simples.',
          'Con el harness open-source de DeepSeek puedes usar la Flash como motor de agente end-to-end a coste mínimo.',
        ],
      },
      {
        heading: 'La tesis que sostiene el ecosistema DeepSeek',
        paragraphs: [
          'Este rendimiento es el argumento central de por qué DeepSeek está ganando tracción en 2026: un modelo open-weight, barato y de alto rendimiento rompe el dogma de que "lo caro es mejor". Para developers, startups y self-hosters, la Flash elimina la excusa de no automatizar por coste.',
          'Si además corres el harness de DeepSeek (licencia MIT) con la Flash, tienes un stack de agentes completo y de bajo coste, sin lock-in de vendor. Es el posicionamiento en el que se apoya todo el ecosistema HosT.ia.',
        ],
      },
    ],
    faq: [
      {
        q: '¿La V4 Flash es mejor que la V4 Pro?',
        a: 'En razonamiento científico (GPQA Diamond) la Flash 0731 marca un 90.0% frente al 87.7% de la Pro 0813: la barata supera a la cara. En tareas de agente (Tau-Bench) la Pro gana ligeramente (79.3% vs 77.8%). En conjunto, para la mayoría de tareas la Flash ofrece el mejor balance calidad-precio.',
      },
      {
        q: '¿Cuánto cuesta DeepSeek V4 Flash en OpenRouter?',
        a: 'La V4 Flash 0731 cuesta $0.14 por millón de tokens de entrada y $0.28 por millón de salida. Es aproximadamente 3x más barata que la V4 Pro 0813 ($0.435 de entrada y $0.87 de salida).',
      },
      {
        q: '¿Dónde se publican los benchmarks de la V4 Flash?',
        a: 'OpenRouter y Artificial Analysis publican los benchmarks por provider. Para la Flash 0731, el provider de DeepSeek marca 90.0% en GPQA Diamond y 77.8% en Tau-Bench.',
      },
      {
        q: '¿La V4 Flash razona?',
        a: 'Sí. El thinking (chain-of-thought) está habilitado por defecto en la API, tanto en V4 Pro como en V4 Flash.',
      },
      {
        q: '¿Debo usar siempre la Flash?',
        a: 'Para la mayoría de tareas de agente y productividad, sí. Reserva la Pro para casos que exijan el máximo en agentes/tool-use y justifiquen su coste ~3x mayor.',
      },
    ],
    cta: '¿Quieres agentes en producción al menor coste posible? Hablemos.',
  },
  {
    slug: 'agentes-de-codigo-ia-2026',
    title: 'Los mejores agentes de código IA en 2026: comparativa completa',
    description:
      'Comparativa 2026 de los agentes de código IA: Claude Code, OpenAI Codex, DeepSeek Harness, Aider, Cline, Goose, OpenCode, OpenHands y Pi. Cuál elegir según tu modelo, tu presupuesto y tu flujo.',
    keywords: [
      'agentes de codigo ia 2026',
      'agentes de codigo ia comparativa',
      'claude code vs codex vs deepseek harness',
      'mejores agentes de codigo ia',
      'ai coding agents 2026',
      'aider cline goose opencode openhands pi',
      'agente de codigo open source',
    ],
    date: '2026-08-16',
    readMinutes: 11,
    category: 'Comparativa',
    icon: 'git-branch',
    accent: 'from-violet-500 to-fuchsia-500',
    lang: 'es',
    excerpt:
      'Claude Code, Codex, DeepSeek Harness, Aider, Cline, Goose, OpenCode, OpenHands y Pi: el mapa completo de los agentes de código IA en 2026 y cómo elegir el tuyo sin equivocarte.',
    sections: [
      {
        heading: 'El ecosistema de agentes de código en 2026',
        paragraphs: [
          'Los agentes de código IA dejaron de ser una novedad y se convirtieron en el estándar de trabajo de muchos developers. En 2026 el mercado está poblado: junto a los productos cerrados de las grandes (Claude Code y OpenAI Codex) conviven decenas de harnesses open-source y herramientas de terminal.',
          'The Register sitúa a la cabeza de la conversación a Claude Code y Codex, y junto a ellos a una familia de alternativas: Aider, Cline, Goose, OpenCode, OpenHands y Pi, más el recién llegado DeepSeek Harness. Cada uno tiene una filosofía distinta: algunos viven en el terminal, otros en el IDE, otros apuestan por la autonomía multi-agente.',
        ],
        bullets: [
          'Dos bloques: productos cerrados (Claude Code, Codex) vs harnesses abiertos.',
          'Terminal-first (Aider, Goose, OpenCode), IDE-first (Cline) y multi-agente (OpenHands).',
          'DeepSeek Harness irrumpió en agosto de 2026 con arquitectura todo-por-plugin y licencia MIT.',
        ],
      },
      {
        heading: 'Comparativa rápida: las 9 herramientas',
        paragraphs: [
          'Para decidir, no basta con mirar el nombre: hay que mirar el modelo que usas, lo cerrado o abierto que es el flujo, y el coste. Esta tabla resume lo esencial.',
        ],
        table: {
          headers: ['Herramienta', 'Enfoque', 'Código', 'Modelo', 'Coste'],
          rows: [
            ['Claude Code', 'Terminal/agente', 'Cerrado', 'Claude (fijado)', 'Claude API'],
            ['OpenAI Codex', 'Terminal/agente', 'Cerrado', 'GPT (fijado)', 'GPT API'],
            ['DeepSeek Harness', 'Agente plugin-first', 'MIT', 'Cualquiera', 'El que conectes'],
            ['Aider', 'Terminal pair', 'Open', 'Varios', 'El que conectes'],
            ['Cline', 'IDE (VS Code)', 'Open', 'Varios', 'El que conectes'],
            ['Goose', 'Terminal/agente', 'Open', 'Varios', 'El que conectes'],
            ['OpenCode', 'Terminal/TUI', 'Open', 'Varios', 'El que conectes'],
            ['OpenHands', 'Multi-agente', 'Open', 'Varios', 'El que conectes'],
            ['Pi', 'Terminal/agente', 'Open', 'Varios', 'El que conectes'],
          ],
        },
      },
      {
        heading: 'Los cerrados: Claude Code y Codex',
        paragraphs: [
          'Son los más pulidos y con mejor integración con sus ecosistemas, pero te encierran en su modelo y su pricing. Si trabajas a fondo con Claude o GPT y valoras una experiencia pulida, son opciones sólidas. La contra: no puedes cambiar de modelo sin cambiar de herramienta, y el coste escala con el uso intensivo.',
        ],
        bullets: [
          'Claude Code: la referencia de UX para quien ya vive en el ecosistema Anthropic.',
          'Codex: el agente nativo de OpenAI, alineado con GPT y el tooling de OpenAI.',
          'Ambos: vendor lock-in y pricing atado a su API.',
        ],
      },
      {
        heading: 'Los abiertos: la familia open-source',
        paragraphs: [
          'Aider, Cline, Goose, OpenCode, OpenHands y Pi comparten una ventaja: no te atan a un modelo. Puedes conectar distintos LLMs (incluidos locales vía Ollama) y elegir por calidad, precio y latencia. La diferencia entre ellos está en la experiencia: Aider brilla en pair-programming por terminal, Cline en el IDE de VS Code, OpenCode en una TUI cuidada, OpenHands en la autonomía multi-agente.',
          'Si tu prioridad es el control de coste y datos — típico de self-hosters y startups — esta familia es la apuesta natural. El coste depende del modelo que conectes, y con la DeepSeek V4 Flash el resultado calidad/precio es difícil de igualar.',
        ],
        bullets: [
          'Aider: pair programming por terminal, con git nativo.',
          'Cline: agente dentro de VS Code.',
          'Goose: agente de terminal de código abierto de Block.',
          'OpenCode: TUI terminal elegante y moderna.',
          'OpenHands: variante multi-agente para tareas autónomas.',
          'Pi: terminal, minimalista y ágil.',
        ],
      },
      {
        heading: 'El disruptor: DeepSeek Harness',
        paragraphs: [
          'DeepSeek Harness (v0.1, agosto 2026) entra con una apuesta distinta: todo es un plugin, sobre el meta-framework Cordis. Modelos, tools, skills, sesiones, sandboxes, filesystems, loops, orquestación y hasta la UI son piezas intercambiables. Es la opción que más se acerca a un harness "agnóstico de modelo" con respaldo de una compañía de primer nivel, y además es MIT.',
          'Es la alternativa real al lock-in de Claude Code y Codex: puedes conectar la DeepSeek V4 Flash, OpenAI, Claude o un local, y cambiar de proveedor sin migrar de herramienta. Es joven (Developer Preview), pero marca la dirección del ecosistema. Ver el detalle en la guía completa de DeepSeek Harness.',
        ],
        bullets: [
          'Licencia MIT, open-source, Developer Preview.',
          'Arquitectura todo-por-plugin sobre Cordis.',
          'Sin vendor lock-in: conecta el modelo que quieras.',
        ],
      },
      {
        heading: 'Cómo elegir el tuyo en 2026',
        paragraphs: [
          'No hay un ganador absoluto: hay un ganador para tu caso. La regla práctica es esta: si quieres la mejor integración con un ecosistema cerrado, Claude Code o Codex; si quieres control de coste, datos y portabilidad de modelo, la familia open-source (Aider, Cline, OpenCode) o DeepSeek Harness.',
          'Si tu prioridad es el coste, elige un harness abierto con la DeepSeek V4 Flash: obtienes rendimiento de gama alta (90.0% en GPQA Diamond, a la altura de la V4 Pro) por ~3x menos de coste.',
        ],
        bullets: [
          'UX pulida + ecosistema → Claude Code o Codex.',
          'Control de coste y datos → open-source (Aider, Cline, OpenCode).',
          'Agnóstico de modelo + open → DeepSeek Harness.',
          'Rendimiento barato → V4 Flash con cualquier harness abierto.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Cuál es el mejor agente de código IA en 2026?',
        a: 'Depende de tu caso: Claude Code y Codex ganan en integración con su ecosistema; la familia open-source (Aider, Cline, OpenCode) gana en control de coste y datos; DeepSeek Harness gana en agnosticismo de modelo y apertura.',
      },
      {
        q: '¿Qué agente de código es gratis?',
        a: 'La familia open-source (Aider, Cline, Goose, OpenCode, OpenHands, Pi) y DeepSeek Harness son de código abierto. Solo pagas el modelo que conectes.',
      },
      {
        q: '¿DeepSeek Harness es mejor que Claude Code?',
        a: 'No es mejor ni peor: es distinto. Es MIT, con plugins intercambiables y modelo libre; Claude Code es cerrado. Si valoras no tener lock-in, Harness gana. Si quieres la UX pulida de Anthropic, Claude Code.',
      },
      {
        q: '¿Qué modelo usar con un harness open-source?',
        a: 'La DeepSeek V4 Flash es la referencia calidad/precio: rinde a la altura de la V4 Pro (90.0% vs 87.7% en GPQA Diamond) por ~3x menos de coste.',
      },
      {
        q: '¿Puedo usar modelos locales?',
        a: 'Sí, la mayoría de harnesses open-source se conectan a Ollama para modelos locales, manteniendo tus datos y coste bajo control.',
      },
    ],
    cta: '¿Montamos tu stack de agentes en producción? Hablemos de tu caso.',
  },
  {
    slug: 'deepseek-harness-vs-claude-code-vs-codex',
    title: 'DeepSeek Harness vs Claude Code vs Codex: comparativa 2026',
    description:
      'Comparamos DeepSeek Harness con Claude Code y OpenAI Codex en 2026: apertura, cambio de modelo, tools, coste y vendor lock-in. Cuál elegir por tu stack, no por hype.',
    keywords: [
      'deepseek harness vs claude code',
      'deepseek harness vs codex',
      'deepseek harness vs claude code vs codex',
      'claude code vs codex 2026',
      'mejor agente de codigo 2026',
    ],
    date: '2026-08-16',
    readMinutes: 7,
    category: 'Comparativa',
    icon: 'scale',
    accent: 'from-blue-500 to-cyan-500',
    lang: 'es',
    excerpt:
      'Tres formas de hacer agentes de código: cerrado y pulido (Claude Code, Codex) vs abierto y agnóstico (DeepSeek Harness). Esto es lo que cambia de verdad para tu equipo.',
    sections: [
      {
        heading: 'Dos filosofías enfrentadas',
        paragraphs: [
          'En 2026 hay dos formas de entender un agente de código. La americana (Claude Code, Codex) apuesta por una caja cerrada y pulida, atada a un ecosistema. La china y open-source (DeepSeek Harness) apuesta por un armazón abierto donde modelo, tools y loop son piezas intercambiables.',
          'La pregunta no es "cuál es mejor", sino "cuál encaja con tu stack y tu presupuesto". Esta comparativa te da los criterios para decidir sin dejarte llevar por el nombre.',
        ],
      },
      {
        heading: 'Tabla comparativa 2026',
        table: {
          headers: ['Criterio', 'DeepSeek Harness', 'Claude Code', 'OpenAI Codex'],
          rows: [
            ['Código', 'Open-source (MIT)', 'Cerrado', 'Cerrado'],
            ['Cambio de modelo', 'Cualquiera (plugin)', 'Claude (fijado)', 'GPT (fijado)'],
            ['Arquitectura', 'Todo-por-plugin (Cordis)', 'Caja cerrada', 'Caja cerrada'],
            ['Self-hosting', 'Sí', 'No', 'No'],
            ['Vendor lock-in', 'No', 'Sí', 'Sí'],
            ['Coste modelo', 'El que conectes', 'Claude API', 'GPT API'],
          ],
        },
        paragraphs: [
          'La diferencia estructural es la apertura. Con DeepSeek Harness puedes conectar DeepSeek, OpenAI, Claude o un modelo local vía Ollama; con Claude Code y Codex estás atado al modelo del fabricante. Para equipos que ya mezclan modelos, o que quieren controlar coste, esto es decisivo.',
        ],
      },
      {
        heading: 'Cuándo elegir Claude Code o Codex',
        paragraphs: [
          'Si ya vives en el ecosistema de Anthropic u OpenAI, su UX, integración y soporte son imbatibles. Son herramientas maduras, con buena documentación y un flujo pulido. La contra es el pricing atado a su API y el lock-in: si mañana quieres cambiar de modelo, cambias de herramienta.',
        ],
        bullets: [
          'Máxima integración con su ecosistema (Claude / GPT).',
          'UX madura y soporte empresarial.',
          'Lock-in: no puedes cambiar de modelo sin migrar.',
          'Coste escala con uso intensivo en su API.',
        ],
      },
      {
        heading: 'Cuándo elegir DeepSeek Harness',
        paragraphs: [
          'Si tu prioridad es no depender de un proveedor, controlar el coste o ejecutar tu propio stack, DeepSeek Harness gana. Es MIT, self-hostable, y como todo es un plugin puedes conectar la DeepSeek V4 Flash (la referencia calidad/precio del 2026) o cualquier otro modelo.',
          'Es joven (Developer Preview, agosto 2026) y menos pulido, pero marca la dirección del ecosistema abierto. Para un equipo técnico que valora control, es la apuesta más coherente.',
        ],
        bullets: [
          'MIT y self-hostable: control total de datos y coste.',
          'Agnóstico de modelo: conecta el que quieras.',
          'Más joven y menos pulido que los cerrados — evalúa según tu caso.',
        ],
      },
      {
        heading: 'Veredicto práctico',
        paragraphs: [
          'No hay ganador universal: hay ganador por perfil. Si quieres la mejor experiencia con un ecosistema cerrado, Claude Code o Codex. Si quieres apertura, control de coste y portabilidad de modelo — y sobre todo si trabajas con DeepSeek V4 Flash —, DeepSeek Harness es la elección más lógica de 2026.',
        ],
        bullets: [
          'Ecosistema + UX pulida → Claude Code o Codex.',
          'Coste, datos y portabilidad → DeepSeek Harness.',
          'Rendimiento barato → V4 Flash dentro de un harness abierto.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Qué es mejor, Claude Code o DeepSeek Harness?',
        a: 'Depende. Claude Code gana en pulido e integración con Anthropic; DeepSeek Harness gana en apertura, self-hosting y libertad de modelo. Es cerrado vs abierto, no mejor vs peor.',
      },
      {
        q: '¿Codex es open source?',
        a: 'No, OpenAI Codex es un producto cerrado atado a GPT.',
      },
      {
        q: '¿Puedo usar DeepSeek Harness con Claude o GPT?',
        a: 'Sí. Como todo es un plugin, puedes conectar modelos de distintos proveedores, incluidos Claude, GPT y locales vía Ollama.',
      },
      {
        q: '¿Cuál es más barato?',
        a: 'El coste depende del modelo. Con un harness abierto y DeepSeek V4 Flash obtienes rendimiento alto a una fracción del precio de Claude API o GPT API.',
      },
    ],
    cta: '¿No sabes qué stack de agentes te conviene? Te ayudamos a decidir.',
  },
  {
    slug: 'deepseek-harness-cordis-plugins',
    title: 'DeepSeek Harness y Cordis: cómo funciona «everything is a plugin»',
    description:
      'Una inmersión técnica en Cordis, el meta-framework sobre el que se construye DeepSeek Harness: cómo gestiona plugins, servicios y eventos, y por qué su arquitectura todo-por-plugin es su gran ventaja.',
    keywords: [
      'deepseek harness cordis',
      'deepseek harness plugins',
      'cordis meta framework',
      'everything is a plugin deepseek',
      'arquitectura deepseek harness',
    ],
    date: '2026-08-16',
    readMinutes: 8,
    category: 'DeepSeek',
    icon: 'boxes',
    accent: 'from-blue-500 to-cyan-500',
    lang: 'es',
    excerpt:
      'La arquitectura que hace a DeepSeek Harness diferente: sobre Cordis, cada capacidad — modelo, tools, skills, sesiones, loops, UI — es un plugin intercambiable que colabora por servicios y eventos.',
    sections: [
      {
        heading: 'Por qué la arquitectura importa más que el nombre',
        paragraphs: [
          'La mayoría de agentes de código se describen por su marca. DeepSeek Harness debería describirse por su arquitectura, porque es ahí donde está la diferencia real: todo es un plugin, sobre un meta-framework llamado Cordis.',
          'Esto no es marketing. Cambia la forma en que usas, extiendes y mantienes el agente, y elimina el vendor lock-in que domina el resto del mercado de agentes de código.',
        ],
      },
      {
        heading: 'Qué es Cordis',
        paragraphs: [
          'Cordis no implementa el agente en sí: es un meta-framework que solo gestiona la carga, descarga y dependencias de plugins. Es la capa que da estructura al caos de piezas intercambiables de DeepSeek Harness.',
          'Los plugins colaboran entre sí mediante dos mecanismos: servicios y eventos. Un plugin puede proveer un servicio (por ejemplo, acceso al shell) que otro consume, o emitir un evento (por ejemplo, "sesión iniciada") al que otros se suscriben. Esto los mantiene desacoplados y fáciles de sustituir.',
        ],
        bullets: [
          'Servicios: un plugin expone capacidades que otros usan.',
          'Eventos: los plugins emiten y escuchan señales sin acoplarse.',
          'Desacoplado: cambiar una pieza no rompe el resto.',
          'Node.js: npx @deepseek-ai/dsh web lanza la Web UI.',
        ],
      },
      {
        heading: 'Qué piezas son plugins',
        paragraphs: [
          'La lista es ambiciosa y es lo que hace al harness genuinamente reemplazable en cada capa.',
        ],
        bullets: [
          'Modelos: DeepSeek, OpenAI, Anthropic o locales vía Ollama.',
          'Tools: shell, editor, búsqueda — lo que definas.',
          'Skills: capacidades reutilizables como plugins.',
          'Sesiones y sandboxes: aislamiento intercambiable.',
          'Filesystems, loops de agente y orquestación.',
          'Incluso la capa de UI es un plugin.',
        ],
      },
      {
        heading: 'Qué significa esto en la práctica',
        paragraphs: [
          'Añadir una herramienta nueva es añadir un plugin sin tocar el núcleo. Cambiar de modelo es cambiar una pieza, no migrar de herramienta. Y como puedes sustituir cada componente, el harness se adapta a tu flujo en vez de obligarte a adaptarte tú.',
          'Para un equipo que quiere control de coste y datos, es el argumento más fuerte: puedes desplegarlo en self-hosting y conectar la DeepSeek V4 Flash — la referencia calidad/precio del 2026 — sin lock-in.',
        ],
      },
      {
        heading: 'Limitaciones honestas',
        paragraphs: [
          'Toda arquitectura joven tiene peajes. Cordis y el ecosistema de plugins de DeepSeek Harness están en Developer Preview (v0.1, agosto 2026): la curva de aprendizaje para escribir plugins propios existe, la documentación madura y el ecosistema de plugins de terceros aún es pequeño frente a lo que ofrecen las cajas cerradas.',
          'Si vienes de Claude Code o Codex, notarás menos pulido. Pero si valoras la libertad estructural, es un trade-off que merece la pena.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Qué es Cordis?',
        a: 'El meta-framework sobre el que se construye DeepSeek Harness: solo gestiona la carga, descarga y dependencias de plugins, que colaboran por servicios y eventos.',
      },
      {
        q: '¿Qué significa «everything is a plugin»?',
        a: 'Que casi cada capacidad del harness (modelo, tools, skills, sesiones, loops, UI) es un plugin intercambiable en vez de estar fijado por el fabricante.',
      },
      {
        q: '¿Es difícil escribir plugins propios?',
        a: 'Es posible y es su gran ventaja, pero el ecosistema es joven (Developer Preview) y la curva de aprendizaje existe.',
      },
      {
        q: '¿Puedo conectar modelos de otros proveedores?',
        a: 'Sí. Como todo es un plugin, puedes conectar DeepSeek, OpenAI, Claude o modelos locales vía Ollama.',
      },
    ],
    cta: '¿Quieres un stack de agentes sin lock-in? Construyámoslo contigo.',
  },
  {
    slug: 'deepseek-harness-que-es',
    title: '¿Qué es un agent harness? (y por qué DeepSeek apuesta por él)',
    description:
      'Te explicamos qué es un agent harness, en qué se diferencia de un simple chatbot o un framework de agentes, y por qué DeepSeek Ha construye todo el stack sobre esta arquitectura abierta.',
    keywords: [
      'que es un agent harness',
      'agent harness definicion',
      'deepseek harness que es',
      'harness vs chatbot ia',
      'framework de agentes ia',
    ],
    date: '2026-08-16',
    readMinutes: 6,
    category: 'Guías',
    icon: 'wrench',
    accent: 'from-blue-500 to-cyan-500',
    lang: 'es',
    excerpt:
      'Un agent harness no es un chatbot ni un framework cualquiera: es la infraestructura que sostiene al agente — modelo, tools, sesiones, loops — y que DeepSeek ha construido abierta y modular para evitar el lock-in.',
    sections: [
      {
        heading: 'De qué hablamos cuando hablamos de harness',
        paragraphs: [
          'En jerga de agentes, un harness es la infraestructura que sostiene al agente: el armazón donde se enchufa el modelo, las herramientas (tools), las sesiones, los loops de razonamiento y la interfaz. Es el "motor" sobre el que corre la inteligencia.',
          'La confusión típica es pensar que el agente ES el modelo. No: el modelo es una pieza más. El harness es todo lo demás que lo convierte en algo útil — y cuando es abierto, esa distinción se vuelve estratégica.',
        ],
      },
      {
        heading: 'Chatbot vs framework vs harness',
        table: {
          headers: ['Tipo', 'Qué es', 'Ejemplo 2026'],
          rows: [
            ['Chatbot', 'Interfaz de conversación', 'ChatGPT, Gemini'],
            ['Framework de agentes', 'Librería para construir agentes', 'LangChain, CrewAI'],
            ['Agent harness', 'Infraestructura completa del agente', 'DeepSeek Harness'],
          ],
        },
        paragraphs: [
          'Un harness va un paso más allá del framework: no solo te da piezas para construir, te da el armazón completo con modelo, tools, sesiones y loops ya integrados y enchufables. Es lo que separa "construir un agente" de "hacer que un agente funcione de verdad".',
        ],
      },
      {
        heading: 'Por qué DeepSeek apuesta por un harness abierto',
        paragraphs: [
          'DeepSeek Harness es open-source (MIT) y está construido sobre Cordis con una filosofía "everything is a plugin": cada capacidad es una pieza intercambiable. Esto responde a una decisión estratégica clara: competir con los ecosistemas cerrados (Claude, GPT) ofreciendo libertad.',
          'Para el usuario significa tres cosas: puedes autoalojarlo (control de datos y coste), puedes cambiar de modelo sin migrar de herramienta, y puedes extenderlo a tu flujo en vez de adaptarte al de otro.',
        ],
        bullets: [
          'MIT y self-hostable: sin cuotas impuestas.',
          'Agnóstico de modelo: conectas el que quieras.',
          'Sin vendor lock-in: cada pieza es reemplazable.',
        ],
      },
      {
        heading: 'La parte realista: ejecutar en local',
        paragraphs: [
          'Hay que ser honestos sobre una tentación frecuente: correr estos modelos en tu propio hardware. La realidad de 2026 es que los modelos frontier de razonamiento (los que dan los mejores resultados de código) necesitan decenas o cientos de gigabytes de VRAM.',
          'Un modelo de 70B cuantizado ocupa ~40 GB de VRAM en Q4; un frontier de cientos de miles de millones de parámetros exige hardware de servidor (H100, H200, GB200) que cuesta decenas de miles de euros. Cuando la VRAM no alcanza, el modelo "se derrama" a RAM del sistema por PCIe y la latencia pasa de segundos a minutos: inutilizable.',
          'La conclusión práctica: para usar los mejores modelos de código de 2026, la opción realista es API en la nube (DeepSeek V4 Flash, Kimi, Qwen...), no local. El local queda para modelos pequeños (1B-30B) en tareas ligeras, y para eso sirve el harness abierto conectado a Ollama.',
        ],
      },
      {
        heading: 'Conclusión',
        paragraphs: [
          'Un agent harness es la diferencia entre tener un modelo potente y tener un agente que trabaja para ti. DeepSeek lo ha construido abierto y modular, y esa decisión — combinada con la DeepSeek V4 Flash — lo convierte en la apuesta con mejor relación coste/control del ecosistema en 2026.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Un agent harness es un chatbot?',
        a: 'No. Un chatbot es una interfaz de conversación; un harness es la infraestructura completa (modelo, tools, sesiones, loops) que sostiene al agente.',
      },
      {
        q: '¿Puedo ejecutar DeepSeek en local?',
        a: 'Los modelos frontier necesitan decenas de gigabytes de VRAM y hardware de servidor caro. Para tareas ligeras, un modelo pequeño vía Ollama es viable; para lo mejor de 2026, la API es la opción realista.',
      },
      {
        q: '¿Qué diferencia a DeepSeek Harness de LangChain?',
        a: 'LangChain es un framework (piezas para construir); DeepSeek Harness es un harness completo con modelo, tools y sesiones integrados y enchufables sobre Cordis.',
      },
      {
        q: '¿Por qué es importante que sea open source?',
        a: 'Porque elimina el vendor lock-in: puedes autoalojarlo, cambiar de modelo y extenderlo sin depender de un proveedor.',
      },
    ],
    cta: '¿Quieres entender qué stack de agentes encaja con tu negocio? Te lo montamos.',
  },
  {
    slug: 'deepseek-v4-flash-vs-v4-pro',
    title: 'DeepSeek V4 Flash vs V4 Pro: cuál usar en 2026',
    description:
      'Comparamos DeepSeek V4 Flash y V4 Pro en benchmarks y precio: por qué la Flash, más barata, supera a la Pro en Terminal Bench y cuándo compensa pagar más por la top.',
    keywords: [
      'deepseek v4 flash vs v4 pro',
      'deepseek v4 flash vs pro',
      'deepseek v4 pro benchmarks',
      'que modelo deepseek elegir',
      'deepseek v4 flash precio',
    ],
    date: '2026-08-16',
    readMinutes: 7,
    category: 'DeepSeek',
    icon: 'gauge',
    accent: 'from-blue-500 to-cyan-500',
    lang: 'es',
    excerpt:
      'La V4 Flash gana en rendimiento de agente de código y es hasta 14x más barata que la V4 Pro. Esta comparativa te dice cuándo la Flash es suficiente y en qué casos puntuales la Pro tiene sentido.',
    sections: [
      {
        heading: 'Un resultado sorprendente en Terminal Bench',
        paragraphs: [
          'En la evaluación Terminal Bench 2.1, la DeepSeek V4 Flash obtiene 82.7 frente a los 72.1 de la V4 Pro. Es decir: el modelo "ligero" supera al "top" en tareas reales de agente de código en terminal.',
          'Esto invierte la intuición habitual de que "más caro = mejor". Para la mayoría de flujos de agente de código, la Flash es la opción correcta.',
        ],
      },
      {
        heading: 'Precios desde el 16/8/2026',
        table: {
          headers: ['Modelo', 'Input (cache miss)', 'Output pico', 'Output valle'],
          rows: [
            ['V4 Flash', '$0.22 / M', '$1.32 / M', '$0.66 / M'],
            ['V4 Pro', '$3.96 / M', '$1.98 / M', '—'],
          ],
        },
        paragraphs: [
          'La diferencia es enorme: la V4 Pro puede llegar a ser hasta 14x más cara que la Flash. Además, el output de la Flash en horas valle se descuenta a la mitad, lo que la hace todavía más atractiva para automatizaciones en horario nocturno.',
        ],
      },
      {
        heading: 'Cuándo usar V4 Flash',
        paragraphs: [
          'Para el grueso de trabajo: agentes de código, refactors, tests, automatizaciones, procesamiento de documentación. El thinking viene habilitado por defecto en la API, y su rendimiento en tareas de terminal la convierte en la elección por defecto de 2026.',
        ],
        bullets: [
          'Rendimiento de agente superior (82.7 vs 72.1).',
          'Hasta 14x más barata que la Pro.',
          'Ideal para automatizaciones y uso intensivo.',
          'La usamos como base del stack de agentes de HosT.ia.',
        ],
      },
      {
        heading: 'Cuándo pagar por V4 Pro',
        paragraphs: [
          'La Pro sigue siendo el modelo "techo" de DeepSeek, útil cuando necesitas la máxima capacidad en tareas muy complejas o cuando quieres comparar a propósito contra lo mejor disponible. Pero para el día a día, el coste extra rara vez se traduce en resultados proporcionales.',
        ],
      },
      {
        heading: 'Veredicto',
        paragraphs: [
          'En 2026, la DeepSeek V4 Flash es la mejor relación calidad/precio del mercado de agentes de código. La Pro existe para casos concretos, no para ser la predeterminada. Si estás montando un stack, empieza por la Flash.',
        ],
      },
    ],
    faq: [
      {
        q: '¿La V4 Flash es peor que la V4 Pro?',
        a: 'No necesariamente. En Terminal Bench 2.1 la Flash (82.7) supera a la Pro (72.1) en tareas de agente de código en terminal.',
      },
      {
        q: '¿Cuánto más cara es la V4 Pro?',
        a: 'Puede llegar a ser hasta 14x más cara que la Flash según el uso.',
      },
      {
        q: '¿La Flash tiene thinking?',
        a: 'Sí, el modo thinking viene habilitado por defecto en la API.',
      },
      {
        q: '¿Cuál me recomiendas para automatizaciones?',
        a: 'La V4 Flash: mejor rendimiento por precio, ideal para uso intensivo y horas valle.',
      },
    ],
    cta: '¿Montamos tu automatización sobre DeepSeek V4 Flash? Te lo dejamos funcionando.',
  },
  {
    slug: 'deepseek-v4-flash-subida-precios-1100',
    title: 'La subida de precios de DeepSeek del 1100%: qué significa y por qué importa',
    description:
      'DeepSeek subió precios hasta un 1100% en algunos endpoints. Analizamos por qué, cómo afecta a tu stack y cómo la V4 Flash mantiene el equilibrio calidad/precio frente a la subida.',
    keywords: [
      'deepseek subida de precios',
      'deepseek precios 2026',
      'deepseek v4 flash precios',
      'subida 1100 por ciento deepseek',
      'deepseek precios api',
    ],
    date: '2026-08-16',
    readMinutes: 6,
    category: 'DeepSeek',
    icon: 'trending-up',
    accent: 'from-blue-500 to-cyan-500',
    lang: 'es',
    excerpt:
      'Una subida de precios de hasta el 1100% generó ruido en agosto de 2026. Esto es lo que pasó, qué modelo se encareció de verdad y por qué la V4 Flash sigue siendo la apuesta segura.',
    sections: [
      {
        heading: 'Qué pasó en agosto de 2026',
        paragraphs: [
          'DeepSeek actualizó su pricing el 16 de agosto de 2026 con subidas que en algunos endpoints alcanzaron el 1100%. La cifra sonó alarmante (y los titulares la amplificaron), pero conviene distinguir qué es ruido y qué es fondo.',
          'La clave: la subida afectó sobre todo a los endpoints de máximo rendimiento y a modelos de alta demanda en pico. No fue una subida uniforme en toda la familia.',
        ],
      },
      {
        heading: 'Qué se encareció y qué no',
        paragraphs: [
          'Los modelos "flash" y de menor coste mantuvieron precios competitivos, mientras que los de mayor capacidad vieron subidas mayores. DeepSeek defendió el ajuste como una gestión de demanda: cuando la capacidad satura, el precio sube para priorizar y financiar infraestructura.',
          'Para la mayoría de usos de agente de código y automatización, la DeepSeek V4 Flash sigue costando $0.22 por millón de tokens de entrada (cache miss) y $1.32 de salida en pico, con valores a mitad de precio en horas valle.',
        ],
      },
      {
        heading: 'Por qué la V4 Flash es la vacuna',
        paragraphs: [
          'La lección de la subida es que no debes atarte a un único endpoint top. Un stack con un modelo flash como pieza principal — barato, rápido y con gran rendimiento de agente — es resistente a los vaivenes de precios.',
          'Y como herramienta de cobertura, un harness abierto (como DeepSeek Harness) te permite cambiar de proveedor al instante si un precio se dispara: sin lock-in.',
        ],
        bullets: [
          'La V4 Flash mantiene precios de entrada bajos ($0.22/M).',
          'Horas valle descuentan el output a la mitad.',
          'Un harness abierto = libertad de cambiar de modelo.',
          'No construyas tu stack sobre un único endpoint caro.',
        ],
      },
      {
        heading: 'Lo que esto significa para tu negocio',
        paragraphs: [
          'Si montas automatizaciones o agentes de código de forma intensiva, la variable coste importa. La respuesta no es dejar de usar DeepSeek, es elegir el modelo adecuado (Flash) y la arquitectura adecuada (harness abierto) para no quedar a merced de una subida.',
        ],
      },
    ],
    faq: [
      {
        q: '¿DeepSeek subió los precios un 1100%?',
        a: 'En algunos endpoints de máxima demanda sí se llegaron a ver subidas de hasta el 1100%, pero no fue uniforme: los modelos flash mantuvieron precios competitivos.',
      },
      {
        q: '¿Sigue siendo barata la V4 Flash?',
        a: 'Sí: $0.22/M de entrada (cache miss) y $1.32 de salida en pico, con output a mitad de precio en horas valle.',
      },
      {
        q: '¿Debo dejar de usar DeepSeek?',
        a: 'No. Es usar el modelo adecuado (Flash) y no atarse a un único endpoint caro. Un harness abierto te protege.',
      },
      {
        q: '¿Cómo me protejo de futuras subidas?',
        a: 'Diversifica: un modelo flash como principal y un harness que permita cambiar de proveedor sin migrar.',
      },
    ],
    cta: '¿Te preocupa el coste de tus automatizaciones? Diseñamos stacks resistentes a subidas de precio.',
  },
  {
    slug: 'kimi-k3-vs-deepseek-v4',
    title: 'Kimi K3 vs DeepSeek V4: el nuevo top chino es brutal… y caro',
    description:
      'Kimi K3 (Moonshot) es el nuevo fenómeno: 2.8T de parámetros, #1 en Frontend Code Arena, pero 3.5-4x más caro que DeepSeek. Comparamos si merece la pena o si la V4 Flash sigue siendo la opción realista.',
    keywords: [
      'kimi k3 vs deepseek',
      'kimi k3 precios',
      'kimi k3 benchmarks',
      'moonshot kimi k3',
      'mejor modelo chino 2026',
    ],
    date: '2026-08-16',
    readMinutes: 8,
    category: 'Comparativa',
    icon: 'sparkles',
    accent: 'from-blue-500 to-cyan-500',
    lang: 'es',
    excerpt:
      'Kimi K3 es el nuevo gigante chino: 2.8 billones de parámetros y lidera el Frontend Code Arena. Pero a $3/$15 por millón de tokens (3.5-4x DeepSeek), la pregunta es si el extra vale lo que cuesta.',
    sections: [
      {
        heading: 'Kimi K3: el modelo que ha puesto patas arriba el ranking',
        paragraphs: [
          'El 16 de julio de 2026, Moonshot lanzó Kimi K3: un modelo de 2.8 billones de parámetros (arquitectura Mixture of Experts, con solo 16 de 896 expertos activos por token) y una ventana de contexto de 1 millón de tokens.',
          'El impacto fue inmediato: Kimi K3 se colocó #1 en Frontend Code Arena con 1679 puntos, saltando 17 posiciones desde el K2.6 y superando a Claude Fable 5. En los análisis independientes de Artificial Analysis, su Intelligence Index de 57 lo sitúa #4 de 189 modelos.',
          'Es, según Moonshot, el primer modelo en la clase de los 3 billones de parámetros. Pero también es honesto un matiz: la propia Moonshot reconoce que "aún va por detrás de los modelos propietarios más potentes" en conjunto.',
        ],
      },
      {
        heading: 'El precio: aquí está el problema',
        table: {
          headers: ['Modelo', 'Input (cache miss)', 'Input (cache hit)', 'Output', 'Contexto'],
          rows: [
            ['Kimi K3', '$3.00 / M', '$0.30 / M', '$15.00 / M', '1M'],
            ['Kimi K2.6 / K2.7 Code', '$0.95 / M', '$0.19 / M', '$4.00 / M', '256K'],
            ['DeepSeek V4 Flash', '$0.22 / M', '—', '$1.32 / M', '—'],
          ],
        },
        paragraphs: [
          'Kimi K3 cuesta $3 por millón de tokens de entrada y $15 de salida: aproximadamente 3.5-4x más que la familia K2.6/K2.7 Code, y many veces más que la DeepSeek V4 Flash. Es un salto real en capacidad, pero también en coste.',
          'Hay un alivio: el input con cache-hit baja a $0.30 (un 90% de descuento), lo que importa para agentes de código que reenvían contexto del repo en cada turno. Pero el output sigue siendo caro.',
        ],
      },
      {
        heading: '¿Cuándo merece la pena Kimi K3?',
        paragraphs: [
          'Si tu trabajo es frontend de alta calidad, diseño o tareas donde el 2.8T de parámetros marca la diferencia y el volumen es bajo, K3 es tentador. La cache de contexto (90% de descuento en input) lo hace viable en uso de agente donde el contexto se repite.',
          'Pero para el día a día intensivo — automatizaciones, agentes de código en volumen, procesamiento de documentación — la DeepSeek V4 Flash gana en coste/rendimiento sin discusión.',
        ],
        bullets: [
          'Kimi K3: máximo rendimiento, coste alto ($3/$15).',
          'Cache-hit en input (-90%): clave para agentes con mucho contexto.',
          'DeepSeek V4 Flash: la opción realista para volumen.',
          'Estrategia: Kimi para lo fino, DeepSeek para el grueso.',
        ],
      },
      {
        heading: 'Veredicto realista',
        paragraphs: [
          'Kimi K3 es brillante y confirma que los modelos chinos ya no solo son baratos: son los mejores en cosas concretas. Pero "mucho mejor que DeepSeek pero mucho más caro" no es una recomendación automática: es una decisión de presupuesto.',
          'Nuestra lectura: usa Kimi K3 como modelo de reserva para tareas puntuales de máxima exigencia y DeepSeek V4 Flash como caballo de batalla. La combinación es lo más inteligente de 2026.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Es Kimi K3 mejor que DeepSeek?',
        a: 'En capacidades de techo sí (2.8T params, #1 Frontend Code Arena), pero cuesta 3.5-4x más. Para el día a día, DeepSeek V4 Flash ofrece mejor coste/rendimiento.',
      },
      {
        q: '¿Cuánto cuesta Kimi K3?',
        a: '$3/M de entrada (cache miss), $15/M de salida, con cache-hit de entrada a $0.30/M. Contexto de 1M de tokens.',
      },
      {
        q: '¿Kimi K3 es open source?',
        a: 'Moonshot anunció que los pesos llegarán (27/7/2026), pero es un modelo tan grande que ejecutarlo en local no es realista: necesita hardware de servidor.',
      },
      {
        q: '¿Debo cambiar a Kimi K3?',
        a: 'Solo para tareas puntuales de máxima exigencia. Para volumen y automatización, DeepSeek V4 Flash sigue siendo la opción racional.',
      },
    ],
    cta: '¿No sabes qué modelo chino usar para qué? Te ayudamos a elegir tu stack.',
  },
  {
    slug: 'grok-46-vs-deepseek-v4',
    title: 'Grok 4.6 vs DeepSeek V4: el pulso EEUU-China en modelos económicos',
    description:
      'Grok 4.6 de xAI irrumpe a $2/$6 con 500K de contexto, y Grok 4 Fast a $0.20/$0.50 con 2M. Comparamos la oferta americana frente a la china (DeepSeek, Kimi) y qué elegir en 2026.',
    keywords: [
      'grok 4.6 vs deepseek',
      'grok 4.6 precios',
      'grok 4 fast precios',
      'xai grok 4.6',
      'mejor modelo economico 2026',
    ],
    date: '2026-08-16',
    readMinutes: 7,
    category: 'Comparativa',
    icon: 'flame',
    accent: 'from-blue-500 to-cyan-500',
    lang: 'es',
    excerpt:
      'xAI contraataca en el terreno del precio: Grok 4.6 a $2/$6 y Grok 4 Fast a $0.20/$0.50. Esto cambia el tablero frente a DeepSeek y Kimi en la guerra de los modelos baratos de 2026.',
    sections: [
      {
        heading: 'xAI deja de ser solo el modelo "de X"',
        paragraphs: [
          'Durante 2026, xAI (ahora bajo el ecosistema SpaceXAI/xAI) ha pasado de ser conocido por el chatbot de X a ser un actor serio en la API de modelos. El movimiento clave: competir en precio, no solo en marquesina.',
          'Grok 4.6 llega a $2 por millón de tokens de entrada y $6 de salida, con 500K de contexto. Y para el extremo barato, Grok 4 Fast se desploma a $0.20 de entrada y $0.50 de salida, con una ventana de contexto enorme de 2M de tokens.',
        ],
      },
      {
        heading: 'Tabla comparativa 2026',
        table: {
          headers: ['Modelo', 'Input / M', 'Output / M', 'Contexto', 'Familia'],
          rows: [
            ['Grok 4 Fast', '$0.20', '$0.50', '2M', 'xAI (US)'],
            ['DeepSeek V4 Flash', '$0.22', '$1.32 (pico)', '—', 'DeepSeek (CN)'],
            ['Grok 4.6', '$2.00', '$6.00', '500K', 'xAI (US)'],
            ['Kimi K3', '$3.00', '$15.00', '1M', 'Moonshot (CN)'],
          ],
        },
        paragraphs: [
          'Lo interesante es que Grok 4 Fast empata prácticamente en precio de entrada con DeepSeek V4 Flash, pero ofrece 2M de contexto (superior a casi todo). Para tareas de contexto largo a coste bajo, es una alternativa real.',
          'En el extremo medio-alto, Grok 4.6 y Kimi K3 compiten por el mismo perfil de usuario, con precios comparables ($2/$6 vs $3/$15).',
        ],
      },
      {
        heading: 'Por qué el contexto importa tanto en 2026',
        paragraphs: [
          'La guerra ya no es solo de calidad: es de contexto y precio. Un modelo con 2M de tokens a $0.20 de entrada te permite meter documentos enteros, codebases o historial largo sin fragmentar. Es una ventaja operativa enorme para agentes y RAG.',
          'DeepSeek sigue mandando en el equilibrio general de agente de código (Terminal Bench), pero Grok 4 Fast ha creado un hueco claro para trabajos de contexto largo a coste mínimo.',
        ],
      },
      {
        heading: 'Veredicto práctico',
        paragraphs: [
          'No necesitas elegir uno: necesitas un stack que los mezcle. DeepSeek V4 Flash para agente de código de base, Grok 4 Fast para contexto largo barato, Kimi K3 para lo fino de frontera cuando el presupuesto lo permite.',
          'La buena noticia de 2026: la competencia brutal entre EEUU y China ha tirado los precios a mínimos. Aprovecharlo es cuestión de arquitectura, no de fe en una marca.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Grok 4.6 es mejor que DeepSeek?',
        a: 'Depende. Grok 4.6 ($2/$6, 500K) es competitivo, pero DeepSeek V4 Flash mantiene mejor rendimiento de agente de código por precio.',
      },
      {
        q: '¿Cuánto cuesta Grok 4 Fast?',
        a: '$0.20/M de entrada y $0.50/M de salida, con 2M de tokens de contexto.',
      },
      {
        q: '¿Cuál es el modelo más barato para contexto largo?',
        a: 'Grok 4 Fast: 2M de contexto a $0.20/M de entrada es difícil de batir a ese precio.',
      },
      {
        q: '¿Debo sustituir DeepSeek por Grok?',
        a: 'No necesariamente. Lo mejor es un stack mixto: DeepSeek para agente de código, Grok para contexto largo, Kimi para frontera.',
      },
    ],
    cta: '¿Montamos un stack multi-modelo que aproveche los mejores precios del mercado?',
  },
  {
    slug: 'modelos-ia-en-local-realidad-2026',
    title: '¿Ejecutar IA en local? La realidad de 2026 (y cuándo sí merece la pena)',
    description:
      'Ejecutar modelos frontier de IA en tu propio hardware es el sueño de muchos. La realidad de 2026: los buenos modelos necesitan tarjetas de decenas de miles de euros. Te contamos qué puedes correr y qué no.',
    keywords: [
      'ejecutar ia en local',
      'llm en local requisitos',
      'nemotron en local',
      'cuanta ram para llm',
      'gpu para ia 2026',
    ],
    date: '2026-08-16',
    readMinutes: 7,
    category: 'Guías',
    icon: 'cpu',
    accent: 'from-blue-500 to-cyan-500',
    lang: 'es',
    excerpt:
      'El local es realista solo para modelos pequeños (1B-30B). Un 70B necesita ~40GB de VRAM; un frontier, hardware de servidor. Esta es la matemática que explica por qué 2026 corre en la nube.',
    sections: [
      {
        heading: 'La fantasía del local y la realidad del hardware',
        paragraphs: [
          'Correr un LLM en tu propia máquina suena ideal: privacidad, sin dependencia de APIs, coste fijo. Pero 2026 ha dejado claro que los modelos que de verdad sobresalen en código y razonamiento necesitan hardware que no cabe en una torre doméstica.',
          'La restricción dura es la VRAM, no el disco ni la RAM del sistema. El modelo tiene que caber en memoria de GPU, y eso cuesta dinero real.',
        ],
      },
      {
        heading: 'La matemática de la VRAM',
        table: {
          headers: ['Modelo', 'VRAM necesaria (Q4)', 'Hardware típico'],
          rows: [
            ['7B', '~8 GB', 'RTX 4090, Mac 16 GB'],
            ['27-30B (Nano)', '~16-24 GB', 'RTX 4090 24 GB, MBP'],
            ['70B', '~40 GB', '2x 4090 / A100'],
            ['Frontier (Nemotron Ultra 550B)', 'Cientos de GB', 'H100, H200, GB200'],
          ],
        },
        paragraphs: [
          'Un modelo de 70B cuantizado a Q4_K_M ocupa ~40 GB de VRAM. Para un frontier de cientos de miles de millones de parámetros — como el Nvidia Nemotron Ultra 550B, que Nvidia despliega sobre H100/H200/GB200 — no existe tarjeta doméstica que valga.',
          'Cuando la VRAM no alcanza, el modelo se derrama por PCIe a la RAM del sistema. La latencia salta de segundos a minutos: para un agente de código en producción, inutilizable.',
        ],
      },
      {
        heading: 'Qué modelo de Nvidia corre en local: Nemotron Nano',
        paragraphs: [
          'Nvidia tiene dos mundos. El Nemotron Ultra (550B y similares) es para datacenter: H100, H200, GB200. Pero Nvidia también ofrece Nemotron 3 Nano Omni, un MoE de ~30B diseñado para local y on-device: corre en una GPU de 24 GB o una Mac con memoria unificada suficiente.',
          'El patrón se repite en todo el ecosistema: cada fabricante tiene su gama pequña (Nano, Flash, small) para local y su gama grande para la nube. Nadie espera que corras la grande en casa.',
        ],
      },
      {
        heading: 'Alternativas económicas reales',
        paragraphs: [
          'Si quieres IA de calidad sin pagar tarjetas de miles de euros, las APIs de 2026 son absurdamente baratas: DeepSeek V4 Flash ($0.22/M de entrada), Grok 4 Fast ($0.20/M, con 2M de contexto), Qwen, Kimi K2.5 ($0.60/M). Por unos céntimos al día tienes rendimiento de frontera.',
          '¿Y el local entonces? Para tareas ligeras, modelos pequeños (1B-30B) vía Ollama, privacidad y funcionamiento offline. Para lo que da dinero, la API y un harness abierto que permita mezclar ambos.',
        ],
        bullets: [
          'Local (1B-30B): privacidad, offline, tareas ligeras.',
          'Local (70B+): hardware de miles de euros, rara vez sensato.',
          'API (DeepSeek, Grok, Qwen, Kimi): frontera barata.',
          'Estrategia: harness abierto que mezcle local + nube.',
        ],
      },
      {
        heading: 'Conclusión realista',
        paragraphs: [
          'No dejes que el hype del "local" te haga comprar hardware que no necesitas. La combinación ganadora de 2026 es simple: modelos pequeños en local para lo privado y rápido, y modelos de frontera por API para lo que exige calidad. Y un harness abierto que los combine sin atarte a nadie.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Puedo correr un LLM en mi ordenador?',
        a: 'Sí, los modelos pequeños (1B-30B) vía Ollama. Un 70B ya exige ~40GB de VRAM, y los frontier, hardware de datacenter.',
      },
      {
        q: '¿Cuánta RAM necesito para IA local?',
        a: '32GB es el mínimo, 64GB cómodo para offloading de modelos de 30B. Pero la VRAM de GPU es la limitación real.',
      },
      {
        q: '¿Nemotron corre en local?',
        a: 'El Nemotron 3 Nano Omni (~30B) sí. El Nemotron Ultra 550B no: requiere H100/H200/GB200 de datacenter.',
      },
      {
        q: '¿Qué es más barato, local o API?',
        a: 'Para modelos de calidad, la API es muchísimo más barata (céntimos al día). El local solo compensa en modelos pequeños y tareas ligeras.',
      },
    ],
    cta: '¿Quieres un stack de IA que mezcle local y nube con el mejor coste? Te lo diseñamos.',
  },
  {
    slug: 'modelos-chinos-dominan-ecosistema-ia',
    title: 'Por qué los modelos chinos están dominando el ecosistema (destilación + open source)',
    description:
      'DeepSeek R1, Qwen, Kimi, GLM y MiniMax: los modelos open-source chinos han superado a los americanos en descargas de Hugging Face. Cómo la destilación y la estrategia open les da la ventaja.',
    keywords: [
      'modelos chinos dominan ia',
      'deepseek r1 destilacion',
      'qwen vs llama descargas',
      'open source ia china',
      'destilacion modelos ia',
    ],
    date: '2026-08-16',
    readMinutes: 8,
    category: 'Análisis',
    icon: 'globe',
    accent: 'from-blue-500 to-cyan-500',
    lang: 'es',
    excerpt:
      'Un año después del "momento DeepSeek", los modelos chinos open-source dominan: Qwen superó a Llama en descargas y nuevos estudios confirman que China lidera el open. Esto es cómo lo han hecho.',
    sections: [
      {
        heading: 'El momento DeepSeek, un año después',
        paragraphs: [
          'Lo que en enero de 2025 llamaron el "momento DeepSeek" (un modelo abierto, barato y competitivo sacudió Occidente) se ha convertido en una tendencia estructural. Un año después, DeepSeek R1 sigue siendo el modelo más "que gusta" de Hugging Face, y la ola no se detuvo ahí.',
          'La lista de laboratorios chinos que siguen el mismo blueprint es larga: DeepSeek, Moonshot (Kimi), Alibaba (Qwen), Z.ai (antiguo Zhipu, GLM) y MiniMax. Todos publican pesos abiertos, iteran rápido y compiten en precio.',
        ],
      },
      {
        heading: 'Los datos que lo demuestran',
        paragraphs: [
          'No es percepción: es descarga. La familia Qwen de Alibaba ha superado a los modelos Llama de Meta en descargas acumuladas de Hugging Face en 2025-2026, y un estudio del MIT concluyó que los modelos open-source chinos han superado a los estadounidenses en descargas totales.',
          'A nivel de rendimiento, la brecha también se cierra: en el composite empresarial de Vals AI, modelos como GLM-5 (60.7%) y Kimi K2.5 (59.7%) quedan a solo 5-6 puntos de Claude Opus 4.6 (66%), pero a 10-180x menos coste de API.',
        ],
        table: {
          headers: ['Métrica', 'Modelos USA', 'Modelos China', 'Brecha'],
          rows: [
            ['Descargas HF', 'Llama etc.', 'Qwen + chinos', 'China lidera'],
            ['Enterprise composite', 'Claude Opus 4.6 (66%)', 'GLM-5 (60.7%)', '5-6 puntos'],
            ['Coste API (input/M)', '$5 (Claude)', 'Qwen 3.5 $0.48, DeepSeek $0.028', '10-180x más barato'],
          ],
        },
      },
      {
        heading: 'El papel de la destilación',
        paragraphs: [
          'La destilación es la técnica de usar un modelo grande (teacher) para entrenar a uno más pequeño (student) que hereda buena parte del comportamiento con mucho menos coste de inferencia. DeepSeek la usó a fondo, y el efecto fue doble.',
          'Primero, democratizó: distilaciones pequeñas de DeepSeek corren en hardware modesto, repartiendo la inteligencia del modelo grande. Segundo, aceleró el ciclo: los laboratorios chinos iteran sobre modelos each otros y publicado pesos que reentrenan rápido. El resultado es una rueda de innovación abierta que Occidente, con modelos cerrados, no replica.',
          'La ironía: DeepSeek, el gran destilador de frontera, fue a su vez acusado de basarse en materia de OpenAI. El debate ético existe, pero el impacto industrial es innegable.',
        ],
      },
      {
        heading: 'Qué significa para tu negocio',
        paragraphs: [
          'Para quien construye productos con IA, la ventaja china es directa: calidad cercana a la frontera a una fracción del coste. DeepSeek R1, Qwen, Kimi y GLM son la razón de que 2026 tenga tantos stacks de agentes viables a precios de céntimos.',
          'Y la estrategia open les da lo más valioso: distribución. Cada desarrollador que descarga Qwen o DeepSeek se convierte en embajador. Frente al cerrado de Anthropic u OpenAI, esa es la ventaja competitiva duradera.',
        ],
      },
      {
        heading: 'Conclusión',
        paragraphs: [
          'China no solo ha alcanzado a Occidente en IA: ha elegido una estrategia (abierta, barata y rápida) que está ganando en adopción. La destilación y el open source son las palancas. Para las empresas, la lección práctica es clara: el mejor coste/rendimiento de 2026 lo dan los modelos chinos.',
        ],
      },
    ],
    faq: [
      {
        q: '¿Están los modelos chinos dominando la IA?',
        a: 'En el open source sí: Qwen superó a Llama en descargas y un estudio del MIT confirma que los modelos chinos superan a los US en descargas totales de HF.',
      },
      {
        q: '¿Qué es la destilación de modelos?',
        a: 'Entrenar un modelo pequeño (student) usando a uno grande (teacher) como guía, heredando capacidades con menos coste. DeepSeek la popularizó.',
      },
      {
        q: '¿Qué laboratorios chinos son relevantes?',
        a: 'DeepSeek (R1/V4), Moonshot (Kimi K3), Alibaba (Qwen), Z.ai (GLM) y MiniMax, entre otros.',
      },
      {
        q: '¿Debo usar modelos chinos en mi negocio?',
        a: 'Por coste y rendimiento, son la mejor opción de 2026 para muchos casos. Vigila requisitos regulatorios según tu industria y región.',
      },
    ],
    cta: '¿Quieres aprovechar los mejores modelos del ecosistema en tu negocio? Te ayudamos.',
  },
];

export const getPostBySlug = (slug: string) => posts.find((p) => p.slug === slug);

export const relatedPosts = (current: Post, count = 2) =>
  posts
    .filter((p) => p.slug !== current.slug)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);

/** Mapa de cadenas localizadas para el render del blog. */
export const blogLocale: Record<Lang, {
  readIn: string;
  byTeam: string;
  relatedProducts: string;
  keepReading: string;
  homeBreadcrumb: string;
  faqTitle: string;
  ctaSubtitle: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
}> = {
  en: {
    readIn: 'min read',
    byTeam: 'By the HosT.ia team',
    relatedProducts: 'Related products',
    keepReading: 'Keep reading',
    homeBreadcrumb: 'Home',
    faqTitle: 'Frequently asked questions',
    ctaSubtitle:
      'Production-ready agents in under 30 days, with SLA-backed uptime and a live monitoring dashboard. Book a free strategy call.',
    ctaButtonLabel: 'Book a strategy call',
    ctaButtonHref: '#contact',
  },
  es: {
    readIn: 'min de lectura',
    byTeam: 'Por el equipo HosT.ia',
    relatedProducts: 'Productos relacionados',
    keepReading: 'Sigue leyendo',
    homeBreadcrumb: 'Inicio',
    faqTitle: 'Preguntas frecuentes',
    ctaSubtitle:
      'Agentes listos para producción en menos de 30 días, con uptime garantizado por SLA y un dashboard de monitorización en vivo. Agenda una llamada estratégica gratuita.',
    ctaButtonLabel: 'Agenda una llamada',
    ctaButtonHref: '#contact',
  },
};

export const getPostLang = (post: Post): Lang => post.lang ?? 'en';
