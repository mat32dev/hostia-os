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
      'DeepSeek V4 Flash casi duplica en rendimiento a modelos que cuestan hasta 14x más. Con los benchmarks reales (Terminal Bench 2.1: 82.7 vs 72.1) y los precios desde el 16/8/2026, esta es tu tesis calidad/precio del 2026.',
    keywords: [
      'deepseek v4 flash',
      'deepseek v4 flash precio',
      'deepseek v4 flash benchmarks',
      'deepseek v4 flash vs v4 pro',
      'mejor modelo calidad precio 2026',
      'deepseek pricing 2026',
      'v4 flash terminal bench',
    ],
    date: '2026-08-16',
    readMinutes: 8,
    category: 'DeepSeek',
    icon: 'zap',
    accent: 'from-amber-500 to-orange-500',
    lang: 'es',
    excerpt:
      'El benchmark que nadie esperaba: la V4 Flash (82.7 en Terminal Bench 2.1) supera a la V4 Pro (72.1), y cuesta hasta 14x menos. Esta es la tesis calidad/precio que sostiene el boom de DeepSeek.',
    sections: [
      {
        heading: 'El benchmark que nadie esperaba',
        paragraphs: [
          'DeepSeek publicó el 16/8/2026 la nueva estructura de precios, pero el dato que más llama la atención no es el coste: es el rendimiento. La V4 Flash (versión 0731) supera a la V4 Pro en 9 de los benchmarks publicados, incluido el Terminal Bench 2.1 donde la Flash marca un 82.7 frente al 72.1 de la Pro.',
          'Que un modelo más barato supere a su hermano mayor no es casualidad: refleja un diseño optimizado para la inferencia rápida sin sacrificar razonamiento. Para la mayoría de tareas de agente y productividad, la Flash es objetivamente mejor elección que la Pro.',
        ],
        bullets: [
          'Terminal Bench 2.1: Flash 82.7 vs Pro 72.1 — un +14% a favor de la barata.',
          'DeepSWE también puntúa a favor de la Flash.',
          'Supera a la Pro en 9 benchmarks publicados, no solo en este.',
        ],
      },
      {
        heading: 'Precios desde el 16/8: cuánto cuesta de verdad',
        paragraphs: [
          'DeepSeek actualizó precios el 16/8/2026. La V4 Flash cuesta $0.22 por millón de tokens de entrada (cache miss), $1.32 por millón de output en horas pico y $0.66 en horas valle. La V4 Pro, en cambio, cuesta $3.96 por millón de output en pico y $1.98 en valle — hasta 14x más cara que la Flash.',
          'La subida global fue notable: hasta un 1100% frente a los precios previos (que rondaban $0.14/M de entrada y $0.28/M de salida). Aun así, en relación calidad-precio la Flash sigue siendo la referencia del mercado para cargas de razonamiento.',
        ],
        table: {
          headers: ['Métrica', 'V4 Flash', 'V4 Pro'],
          rows: [
            ['Input (cache miss)', '$0.22 / M tokens', '—'],
            ['Output pico', '$1.32 / M tokens', '$3.96 / M tokens'],
            ['Output valle', '$0.66 / M tokens', '$1.98 / M tokens'],
            ['Razón de coste', '1x', 'Hasta 14x más cara'],
            ['Terminal Bench 2.1', '82.7', '72.1'],
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
          'Este benchmark es el argumento central de por qué DeepSeek está ganando tracción en 2026: un modelo open-weight, barato y de alto rendimiento rompe el dogma de que "lo caro es mejor". Para developers, startups y self-hosters, la Flash elimina la excusa de no automatizar por coste.',
          'Si además corres el harness de DeepSeek (licencia MIT) con la Flash, tienes un stack de agentes completo y de bajo coste, sin lock-in de vendor. Es el posicionamiento en el que se apoya todo el ecosistema HosT.ia.',
        ],
      },
    ],
    faq: [
      {
        q: '¿La V4 Flash es mejor que la V4 Pro?',
        a: 'En los benchmarks publicados, la Flash 0731 supera a la Pro en 9 de ellos, incluido Terminal Bench 2.1 (82.7 vs 72.1). Para la mayoría de tareas, es la mejor elección: casi igual de capaz y mucho más barata.',
      },
      {
        q: '¿Cuánto cuesta DeepSeek V4 Flash?',
        a: 'Desde el 16/8/2026: $0.22/M de entrada (cache miss), $1.32/M de output en pico y $0.66/M en valle.',
      },
      {
        q: '¿Por qué subieron tanto los precios?',
        a: 'La subida fue de hasta un 1100% frente a los precios previos (eran $0.14/M in y $0.28/M out). Aun así, la Flash sigue siendo la referencia calidad-precio del mercado.',
      },
      {
        q: '¿La V4 Flash razona?',
        a: 'Sí. El thinking (chain-of-thought) está habilitado por defecto en la API, tanto en V4 Pro como en V4 Flash.',
      },
      {
        q: '¿Debo usar siempre la Flash?',
        a: 'Para la mayoría de tareas de agente y productividad, sí. Reserva la Pro para casos muy específicos que justifiquen su coste hasta 14x mayor.',
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
          'Si tu prioridad es el coste, elige un harness abierto con la DeepSeek V4 Flash: obtienes rendimiento de gama alta (82.7 en Terminal Bench 2.1) a una fracción del precio de los modelos premium.',
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
        a: 'La DeepSeek V4 Flash es la referencia calidad/precio: 82.7 en Terminal Bench 2.1 a una fracción del coste de los modelos premium.',
      },
      {
        q: '¿Puedo usar modelos locales?',
        a: 'Sí, la mayoría de harnesses open-source se conectan a Ollama para modelos locales, manteniendo tus datos y coste bajo control.',
      },
    ],
    cta: '¿Montamos tu stack de agentes en producción? Hablemos de tu caso.',
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
