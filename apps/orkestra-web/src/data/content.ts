export const brand = {
  name: 'HosT.ia',
  tagline: 'Autonomous AI Agents for Business',
  whatsapp: '+34 677 65 98 20',
  whatsappLink: 'https://wa.me/34677659820',
  email: 'hola@hostia.solutions',
};

export const nav = [
  { label: 'Services', href: '#services' },
  { label: 'Industries', href: '#industries' },
  { label: 'Process', href: '#process' },
  { label: 'Results', href: '#results' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export const hero = {
  eyebrow: 'Autonomous AI Agency',
  title: 'We don\u2019t sell bots.',
  titleAccent: 'We ship AI operating systems.',
  subtitle:
    'HosT.ia builds WhatsApp Business, voice and email AI agents that qualify leads, answer customers and run your operations 24/7/365 — in production in under 30 days.',
  primaryCta: 'Book a strategy call',
  secondaryCta: 'Explore services',
  stats: [
    { value: '< 30', label: 'days to production' },
    { value: '< 2min', label: 'avg. response time' },
    { value: '24/7/365', label: 'always on' },
    { value: '< 5%', label: 'human intervention' },
  ],
};

export type Service = {
  id: string;
  icon: string;
  title: string;
  description: string;
  items: string[];
  metrics: string[];
};

export const services: Service[] = [
  {
    id: 'whatsapp',
    icon: 'message-circle',
    title: 'WhatsApp Business Agents',
    description:
      'Revenue-driving agents on the channel your customers already use. From lead qualification to in-chat checkout.',
    items: [
      'Sales agent — qualify leads, handle objections, send quotes',
      'Customer service — FAQs, order tracking, returns, surveys',
      'Appointment booking — real-time availability, confirmations',
      'E-commerce agent — interactive catalog, purchase in-chat',
      'Collections — payment reminders and plans',
      'Marketing — personalized broadcasts, loyalty, events',
    ],
    metrics: ['+300% velocity', '+40% conversion', '−60% cost/lead'],
  },
  {
    id: 'voice',
    icon: 'phone',
    title: 'Voice Agents',
    description:
      'Natural-language voice agents that answer, sell and collect over the phone — no menus, no hold music.',
    items: [
      'Inbound receptionist — intent detection, smart transfer',
      'Outbound sales — B2B cold calling, qualification, scheduling',
      'Outbound collections — reminders, plan negotiation',
      'CSAT / NPS surveys by phone',
      'Natural-language IVR replacement',
    ],
    metrics: ['24/7 coverage', '−80% call drop-off', 'human-like speech'],
  },
  {
    id: 'multichannel',
    icon: 'layers',
    title: 'Multi-Channel Agents',
    description:
      'One agent, every channel. A single customer view across WhatsApp, email, chat, SMS and voice.',
    items: [
      'Unified inbox — single conversation history',
      'Omnichannel sales — sequential multi-touch outreach',
      'Full-stack customer service — ticketing integrated',
    ],
    metrics: ['one memory', 'all channels', 'no lost context'],
  },
  {
    id: 'specialized',
    icon: 'sparkles',
    title: 'Specialized Agents',
    description:
      'Focused AI workers for specific business functions — internal, external, regulated or not.',
    items: [
      'AI receptionist — voice + WhatsApp 24/7',
      'Lead qualification engine',
      'Review management bot',
      'HR / IT helpdesk / training bots',
      'Document processing & data entry automation',
      'Compliance monitoring & competitive intelligence',
    ],
    metrics: ['10+ verticals', 'custom-built', 'SLA-backed'],
  },
];

export const verticals = [
  {
    icon: 'landmark',
    title: 'Financial Services',
    desc: 'AI agents for banks, fintechs and insurers: collections with payment links, onboarding and KYC follow-ups, and compliance monitoring. Recover more revenue on the channels your customers already use.',
  },
  {
    icon: 'shopping-bag',
    title: 'E-commerce & Retail',
    desc: 'WhatsApp and chat AI agents for online stores: interactive catalogs, in-chat checkout, abandoned-cart recovery and post-sale support. Recover carts and lift average order value without building an app.',
  },
  {
    icon: 'stethoscope',
    title: 'Health',
    desc: 'Appointment-booking AI for clinics, hospitals and pharmacies: real-time availability, smart reminders that cut no-shows, and instant answers to patient FAQs in any language — private by design.',
  },
  {
    icon: 'graduation-cap',
    title: 'Education',
    desc: 'Enrollment and student-support agents for universities, academies and edtech: guide prospects through sign-up, answer schedule and fee questions, and keep students engaged around the clock.',
  },
  {
    icon: 'building',
    title: 'Real Estate',
    desc: 'AI lead-qualification agents for developers and agencies: triage inbound leads from portals and WhatsApp, book viewings against live calendars and follow up automatically, so agents only meet qualified buyers.',
  },
  {
    icon: 'car',
    title: 'Automotive',
    desc: 'Test-drive booking and service-reminder agents for dealerships: qualify buyers on WhatsApp, schedule test drives and service appointments, and re-engage leads that went quiet.',
  },
  {
    icon: 'truck',
    title: 'Logistics',
    desc: 'Tracking and status AI agents for transport and fulfillment: answer "where is my order" on WhatsApp, send proactive delivery updates and proof of delivery, and resolve exceptions before customers complain.',
  },
  {
    icon: 'server',
    title: 'SaaS & Tech',
    desc: 'AI agents for software companies: qualify free-trial signups, drive activation with in-chat onboarding, and reduce churn with proactive renewal and expansion conversations.',
  },
  {
    icon: 'plane',
    title: 'Tourism & Hospitality',
    desc: 'Reservation and concierge agents for hotels, airlines and agencies: take bookings on WhatsApp, handle group queries and reviews, and upsell experiences — 24/7 in every language.',
  },
  {
    icon: 'signal',
    title: 'Telecom',
    desc: 'Retention and support agents for operators and ISPs: handle plan changes, technical diagnostics and billing questions on WhatsApp, and predict churn before it happens.',
  },
];

export const process = [
  {
    step: '01',
    title: 'Discovery',
    desc: 'We map your workflows, channels and KPIs. You tell us the business outcome; we design the agent to deliver it.',
  },
  {
    step: '02',
    title: 'Design',
    desc: 'Conversation flows, allowed use-cases, brand tone, escalation policy and a clear privacy & AI-disclosure framework.',
  },
  {
    step: '03',
    title: 'Build',
    desc: 'Your agent is trained on your data and integrated with your CRM, helpdesk, calendar and payment links.',
  },
  {
    step: '04',
    title: 'Test & Launch',
    desc: 'Structured testing with rollback plans before going live. We deploy to production in under 30 days.',
  },
  {
    step: '05',
    title: 'Monitor & Optimize',
    desc: '24/7 monitoring with a live dashboard, weekly model updates and continuous improvement on real metrics.',
  },
];

export const results = [
  { value: '80%', label: 'of tickets resolved without a human' },
  { value: '−70%', label: 'response time vs. human teams' },
  { value: '+30', label: 'points NPS from faster, consistent service' },
  { value: '−60%', label: 'cost per qualified lead' },
  { value: '+40%', label: 'conversion on qualified conversations' },
  { value: '+300%', label: 'speed of lead follow-up' },
];

export type Tier = {
  name: string;
  target: string;
  price: string;
  period: string;
  features: string[];
  highlight?: boolean;
};

export const pricing: Tier[] = [
  {
    name: 'Implementation',
    target: 'One-time',
    price: '$2K',
    period: 'to $50K',
    features: [
      'Agent design & conversation flows',
      'CRM, calendar & payment integrations',
      'Structured testing & rollback plan',
      'Deployment in < 30 days',
      'Operator manual + training',
    ],
  },
  {
    name: 'Managed Agents',
    target: 'Recurring',
    price: '$500',
    period: 'to $15K /mo',
    highlight: true,
    features: [
      'Fully managed 24/7 operation',
      'Live monitoring dashboard',
      'Weekly model updates',
      'Escalation handling included',
      'Dedicated success manager',
      'SLA-backed uptime',
    ],
  },
  {
    name: 'Flexible Add-ons',
    target: 'Usage-based',
    price: 'Pay',
    period: 'per use',
    features: [
      'Per-conversation pricing',
      'Revenue share on sales agents',
      'Strategic AI consulting — $200–500/h',
      'White-label licensing',
      'Team training & certification',
    ],
  },
];

export const faq = [
  {
    q: 'How fast can we go live?',
    a: 'Our standard onboarding takes under 30 days from kickoff to production, including design, integration, testing and launch. Simple use-cases can be live in as little as 7 days.',
  },
  {
    q: 'Which channels do you support?',
    a: 'WhatsApp Business API, voice (inbound and outbound), web chat, email, SMS, and internal channels like Slack and Teams. We integrate with your existing CRM and helpdesk.',
  },
  {
    q: 'What happens when the AI cannot help?',
    a: 'Every agent has an explicit escalation policy. When confidence drops or the request falls outside allowed use-cases, the conversation is handed to a human with full context — never left hanging.',
  },
  {
    q: 'Is my customer data safe?',
    a: 'Yes. We define privacy and AI-disclosure policies before launch, process data in compliance with GDPR, and keep your data separate from other clients. You own your data and your agents.',
  },
  {
    q: 'Do I need technical staff?',
    a: 'No. We manage everything — design, build, monitoring and optimization. You receive a simple dashboard and an operator manual. Most clients operate agents with zero in-house engineers.',
  },
  {
    q: 'How do you measure success?',
    a: 'Before launch we agree on KPIs — resolution rate, response time, conversion, cost per lead, NPS. You see them live on your dashboard, and we optimize against them weekly.',
  },
];

export const footer = {
  columns: [
    {
      title: 'Services',
      links: [
        { label: 'WhatsApp agents', href: '#services' },
        { label: 'Voice agents', href: '#services' },
        { label: 'Multi-channel', href: '#services' },
        { label: 'Specialized agents', href: '#services' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Process', href: '#process' },
        { label: 'Results', href: '#results' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Contact', href: '#contact' },
      ],
    },
  ],
};

export const productLinks = [
  { name: 'HosT.ia OS', href: 'https://gethostia.com' },
  { name: 'HosT.ia POS', href: 'https://gethostia.com/pos' },
  { name: 'HosT.ia Guard', href: 'https://gethostia.com/guard' },
  { name: 'HosT.ia Chat', href: 'https://gethostia.com/chat' },
];

export const products = [
  {
    id: 'pos',
    icon: 'receipt',
    name: 'HosT.ia POS',
    tagline: 'Free, open-source point of sale for hospitality',
    desc: 'Offline-first POS that runs on any tablet. No subscriptions, your data stays on device.',
    cta: 'Explore POS',
    href: 'https://gethostia.com/pos',
  },
  {
    id: 'guard',
    icon: 'shield',
    name: 'HosT.ia Guard',
    tagline: 'AI security analyst for cash handling',
    desc: 'Uploads CCTV and cross-checks cash transactions against the POS to catch revenue leakage.',
    cta: 'Explore Guard',
    href: 'https://gethostia.com/guard',
  },
  {
    id: 'chat',
    icon: 'message-circle',
    name: 'HosT.ia Chat',
    tagline: 'AI waiter on WhatsApp',
    desc: 'Reservations, orders and FAQs in any language. POS-aware and always available.',
    cta: 'Explore Chat',
    href: 'https://gethostia.com/chat',
  },
];
