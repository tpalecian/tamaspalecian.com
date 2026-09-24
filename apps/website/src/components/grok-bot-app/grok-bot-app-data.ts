import type { GrokBotAppProps } from './grok-bot-app-types'

export const grokBotAppSnapshot: GrokBotAppProps = {
  user: { name: 'Armand Segall', initials: 'AS' },
  defaultActiveAgentId: 'talent-scout',
  agents: [
    {
      id: 'chief',
      name: 'Chief',
      time: 'Yesterday',
      preview: 'booked the venue and sent the confirmation around.',
      color: '#54B9A6',
      shape: 'blob',
      state: 'idle',
      title: 'Chief of staff',
      description:
        'Keeps the calendar, the offsite, and the loose ends moving so nothing sits waiting on you.',
      notifications: true,
      routines: [
        {
          id: 'weekly-ops-sweep',
          name: 'Weekly ops sweep',
          schedule: 'Mondays at 8 AM',
        },
      ],
    },
    {
      id: 'sales-outbound',
      name: 'Sales Outbound',
      time: '3:39 PM',
      preview: 'Done.',
      color: '#F19D38',
      shape: 'cloud',
      state: 'working',
      title: 'Sales',
      description:
        'Works the pipeline overnight: researches the prospects worth a look, pulls their context together, and leaves sequences drafted for the morning.',
      notifications: true,
      bubble: '#141414',
      routines: [
        {
          id: 'overnight-outbound',
          name: 'Overnight outbound',
          schedule: 'Sundays at 9 PM',
        },
      ],
    },
    {
      id: 'inbox-manager',
      name: 'Inbox Manager',
      time: '12:40 PM',
      preview: 'sent. inbox at zero, 5 drafts parked for tomorrow.',
      color: '#6464EF',
      shape: 'triangle',
      state: 'done',
      title: 'Inbox',
      description:
        'Triages overnight mail, sends what is ready, and parks the rest as drafts for the morning.',
      notifications: true,
      unread: true,
      routines: [
        {
          id: 'morning-inbox-sweep',
          name: 'Morning inbox sweep',
          schedule: 'Daily at 7 AM',
        },
      ],
    },
    {
      id: 'account-manager',
      name: 'Account Manager',
      time: '10:40 AM',
      preview: "invite's out to vicky. globex note held in drafts.",
      color: '#885CF5',
      shape: 'squircle',
      state: 'waiting',
      title: 'Accounts',
      description:
        'Keeps customer threads current: invites, follow-ups, and notes held until you say send.',
      notifications: true,
    },
    {
      id: 'talent-scout',
      name: 'Talent Scout',
      time: '7:40 AM',
      preview: '3 intros drafted in your voice, held for your ok.',
      color: '#3C82F6',
      shape: 'pebble',
      state: 'thinking',
      title: 'Recruiting',
      description:
        'Sources quietly against open reqs, screens overnight, and holds intros until you approve them.',
      notifications: true,
      routines: [
        {
          id: 'overnight-sourcing',
          name: 'Overnight sourcing',
          schedule: 'Weeknights at 11 PM',
        },
      ],
    },
    {
      id: 'expense-manager',
      name: 'Expense Manager',
      time: '11:40 AM',
      preview: 'report filed. 9 receipts, nothing outstanding.',
      color: '#ED712E',
      shape: 'tablet',
      state: 'acknowledge',
      title: 'Expenses',
      description:
        'Collects receipts, files the weekly report, and flags anything still outstanding.',
      notifications: true,
      routines: [
        {
          id: 'friday-expense-close',
          name: 'Friday expense close',
          schedule: 'Fridays at 4 PM',
        },
      ],
    },
    {
      id: 'offsite-crew',
      name: 'Offsite crew',
      time: '9:40 AM',
      preview: "that leaves the pipeline. i'd spin up a dedicated agent.",
      color: '#54B9A6',
      shape: 'blob',
      state: 'blocked',
      title: 'Offsite',
      description:
        'A small crew covering venue, invites, and whatever is still open for the offsite.',
      notifications: true,
      group: [
        { color: '#54B9A6', shape: 'blob' },
        { color: '#6464EF', shape: 'hex' },
        { color: '#885CF5', shape: 'teardrop' },
      ],
    },
  ],
  threads: {
    chief: [
      {
        id: 'chief-ts-yesterday',
        kind: 'timestamp',
        label: 'Yesterday 4:15 PM',
      },
      {
        id: 'chief-user-venue',
        kind: 'user',
        parts: [
          {
            text: 'lock the offsite venue and send the confirmation around.',
          },
        ],
      },
      {
        id: 'chief-agent-booked',
        kind: 'agent',
        parts: [{ text: 'booked the venue and sent the confirmation around.' }],
      },
    ],
    'sales-outbound': [
      {
        id: 'so-ts-yesterday',
        kind: 'timestamp',
        label: 'Yesterday 9:10 PM',
      },
      {
        id: 'so-user-pull-list',
        kind: 'user',
        parts: [
          {
            text: 'pull a fresh outbound list for the mid-market segment and draft sequences.',
          },
        ],
      },
      {
        id: 'so-agent-checklist',
        kind: 'agent',
        parts: [
          { text: '✓ ' },
          { text: 'Salesforce', bold: true },
          { text: ' → list pulled · 52 accounts\n✓ ' },
          { text: 'Hex', bold: true },
          { text: ' → 3 lookalike segments pulled\n✓ ' },
          { text: 'LinkedIn', bold: true },
          { text: ' → 4 profiles skipped · recently contacted\n✓ ' },
          { text: 'Sequencer', bold: true },
          { text: ' → 36 drafts queued · 0 sent' },
        ],
      },
      {
        id: 'so-agent-folded',
        kind: 'agent',
        parts: [
          { text: 'Account Manager', bold: true },
          {
            text: ' sent over the Acme + Globex threads and ',
          },
          { text: 'Chief', bold: true },
          {
            text: " flagged the priority accounts. Both are folded into tonight's list.",
          },
        ],
      },
      {
        id: 'so-agent-queue',
        kind: 'agent',
        parts: [
          {
            text: "The 36 drafts are sitting in the LinkedIn queue on my screen: recipient, opener, and a Draft badge on each. Nothing goes out until you've had a look.",
          },
        ],
      },
      {
        id: 'so-ts-339',
        kind: 'timestamp',
        label: '3:39 PM',
      },
      {
        id: 'so-user-send',
        kind: 'user',
        parts: [
          { text: 'The top 10 look good. Send it. Run this every week.' },
        ],
        reactions: ['👍'],
      },
      {
        id: 'so-agent-done',
        kind: 'agent',
        parts: [{ text: 'Done.' }],
      },
    ],
    'inbox-manager': [
      {
        id: 'im-ts-morning',
        kind: 'timestamp',
        label: '7:02 AM',
      },
      {
        id: 'im-user-clear',
        kind: 'user',
        parts: [
          {
            text: 'clear the overnight mail. send what is obvious and park the rest.',
          },
        ],
      },
      {
        id: 'im-agent-zero',
        kind: 'agent',
        parts: [{ text: 'sent. inbox at zero, 5 drafts parked for tomorrow.' }],
      },
    ],
    'account-manager': [
      {
        id: 'am-ts-morning',
        kind: 'timestamp',
        label: '10:12 AM',
      },
      {
        id: 'am-user-vicky',
        kind: 'user',
        parts: [
          {
            text: 'send vicky the invite and hold the globex note until i read it.',
          },
        ],
      },
      {
        id: 'am-agent-invite',
        kind: 'agent',
        parts: [{ text: "invite's out to vicky. globex note held in drafts." }],
      },
    ],
    'talent-scout': [
      {
        id: 'ts-yesterday-340',
        kind: 'timestamp',
        label: 'Yesterday 3:40 PM',
      },
      {
        id: 'user-source-quietly',
        kind: 'user',
        parts: [
          {
            text: 'take the platform engineer req: senior, infra-heavy, remote ok. source quietly.',
          },
        ],
      },
      {
        id: 'agent-on-it',
        kind: 'agent',
        parts: [
          {
            text: "on it. i'll screen overnight against the req and skip anyone already in the ats.",
          },
        ],
      },
      {
        id: 'ts-640',
        kind: 'timestamp',
        label: '6:40 AM',
      },
      {
        id: 'agent-overnight-run',
        kind: 'agent',
        parts: [
          { text: 'overnight run:\n✓ ' },
          { text: 'Sourced', bold: true },
          { text: ' → 64 profiles matched the req\n✓ ' },
          { text: 'Skipped', bold: true },
          { text: ' → 11 already in the ats\n✓ ' },
          { text: 'Shortlist', bold: true },
          { text: ' → 12 screened · notes on each' },
        ],
      },
      {
        id: 'agent-three-candidates',
        kind: 'agent',
        parts: [
          { text: 'three worth your time first:\n' },
          { text: 'Mara Iyer', bold: true },
          {
            text: ' → scaled ingest 40× at a data startup · writes like an owner\n',
          },
          { text: 'Tomás Rivera', bold: true },
          { text: ' → runs a 6-person infra team · wants to build again\n' },
          { text: 'Grace Osei', bold: true },
          {
            text: ' → your exact stack end to end · shipped the migration you keep citing',
          },
        ],
      },
      {
        id: 'ts-740',
        kind: 'timestamp',
        label: '7:40 AM',
      },
      {
        id: 'user-draft-intros',
        kind: 'user',
        parts: [{ text: 'strong list, mara especially. draft the intros' }],
        reactions: ['👍'],
      },
      {
        id: 'agent-intros-held',
        kind: 'agent',
        parts: [
          {
            text: "3 intros drafted in your voice and held for your ok. nothing sends until you've read them.",
          },
        ],
      },
    ],
    'expense-manager': [
      {
        id: 'em-ts-late',
        kind: 'timestamp',
        label: '11:18 AM',
      },
      {
        id: 'em-user-file',
        kind: 'user',
        parts: [{ text: 'file this week. flag anything still open.' }],
      },
      {
        id: 'em-agent-filed',
        kind: 'agent',
        parts: [{ text: 'report filed. 9 receipts, nothing outstanding.' }],
      },
    ],
    'offsite-crew': [
      {
        id: 'oc-user-left',
        kind: 'user',
        parts: [{ text: "what's still open for the offsite?" }],
      },
      {
        id: 'oc-agent-pipeline',
        kind: 'agent',
        parts: [
          { text: "that leaves the pipeline. i'd spin up a dedicated agent." },
        ],
      },
    ],
  },
}
