export type PostSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
};

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
];

export const getPostBySlug = (slug: string) => posts.find((p) => p.slug === slug);

export const relatedPosts = (current: Post, count = 2) =>
  posts
    .filter((p) => p.slug !== current.slug)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
