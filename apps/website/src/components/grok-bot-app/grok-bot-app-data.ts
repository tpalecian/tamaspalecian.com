import type { GrokBotAppProps } from './grok-bot-app-types'

export const talentScoutSnapshot: GrokBotAppProps = {
  user: { name: 'Armand Segall', initials: 'AS' },
  activeAgentId: 'talent-scout',
  agents: [
    {
      id: 'chief',
      name: 'Chief',
      time: 'Yesterday',
      preview: 'booked the venue and sent the confirmation around.',
      color: '#54B9A6',
      shape: 'blob',
    },
    {
      id: 'sales-outbound',
      name: 'Sales Outbound',
      time: '3:39 PM',
      preview: 'Done.',
      color: '#F19D38',
      shape: 'blob',
    },
    {
      id: 'inbox-manager',
      name: 'Inbox Manager',
      time: '12:40 PM',
      preview: 'sent. inbox at zero, 5 drafts parked for tomorrow.',
      color: '#6464EF',
      shape: 'triangle',
    },
    {
      id: 'account-manager',
      name: 'Account Manager',
      time: '10:40 AM',
      preview: "invite's out to vicky. globex note held in drafts.",
      color: '#885CF5',
      shape: 'squircle',
    },
    {
      id: 'talent-scout',
      name: 'Talent Scout',
      time: '7:40 AM',
      preview: '3 intros drafted in your voice, held for your ok.',
      color: '#3C82F6',
      shape: 'blob',
    },
    {
      id: 'expense-manager',
      name: 'Expense Manager',
      time: '11:40 AM',
      preview: 'report filed. 9 receipts, nothing outstanding.',
      color: '#ED712E',
      shape: 'blob',
    },
    {
      id: 'offsite-crew',
      name: 'Offsite crew',
      time: '9:40 AM',
      preview: "that leaves the pipeline. i'd spin up a dedicated agent.",
      color: '#54B9A6',
      shape: 'blob',
      group: [
        { color: '#54B9A6', shape: 'blob' },
        { color: '#6464EF', shape: 'blob' },
        { color: '#885CF5', shape: 'blob' },
      ],
    },
  ],
  messages: [
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
}
