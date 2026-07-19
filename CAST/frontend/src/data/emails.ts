// Sample inbox for the "Fake Email Inbox" Practice Lab simulation.
// A mix of legitimate and phishing emails with a plain-English "tell"
// for every phishing example, revealed after the user makes a choice.

export interface SimEmail {
  id: string
  from: string
  fromAddress: string
  subject: string
  preview: string
  body: string
  isPhishing: boolean
  tell?: string // shown after the user answers, only if isPhishing
  consequence?: string // "here's what would have happened" narrative
}

export const INBOX_EMAILS: SimEmail[] = [
  {
    id: 'e1',
    from: 'IT Support',
    fromAddress: 'it-support@rit-portal-secure.com',
    subject: 'URGENT: Your account will be locked in 1 hour',
    preview: 'We detected unusual activity. Verify your credentials immediately...',
    body: 'Dear User,\n\nWe detected unusual sign-in activity on your account. To avoid permanent suspension, verify your credentials within 1 hour by clicking the secure link below.\n\n[Verify My Account]\n\nIT Support Team',
    isPhishing: true,
    tell: 'The domain "rit-portal-secure.com" is not your real institution\'s domain — attackers register lookalike domains to seem legitimate. Combined with a false 1-hour deadline, this is designed to make you panic instead of verify.',
    consequence:
      'If you had clicked and entered your credentials, the attacker now has your username and password — and could use them to access your real account, email, or any other service where you reused that password.',
  },
  {
    id: 'e2',
    from: 'Priya Sharma',
    fromAddress: 'priya.sharma@company.com',
    subject: 'Notes from today\'s standup',
    preview: 'Hey team, quick recap of what we covered this morning...',
    body: 'Hey team,\n\nQuick recap of what we covered this morning — the sprint review is moved to Thursday 3 PM. Let me know if that conflicts with anyone\'s schedule.\n\nThanks,\nPriya',
    isPhishing: false,
  },
  {
    id: 'e3',
    from: 'Amazon',
    fromAddress: 'order-update@amazon-shipping-delivery.net',
    subject: 'Your package could not be delivered — action required',
    preview: 'We attempted delivery but were unable to reach you. Click to reschedule...',
    body: 'Your package #A492K could not be delivered. Please confirm your address and pay a small redelivery fee ($1.99) to reschedule.\n\n[Reschedule Delivery]',
    isPhishing: true,
    tell: 'Real delivery notices come from the actual carrier/retailer domain (amazon.com), not a copycat like "amazon-shipping-delivery.net." A "redelivery fee" is also a classic pretext to harvest your card details.',
    consequence:
      'Entering your card number here would send it straight to the attacker. Small, plausible amounts like $1.99 are chosen specifically because they feel too minor to question.',
  },
  {
    id: 'e4',
    from: 'GitHub',
    fromAddress: 'notifications@github.com',
    subject: '[your-org/repo] New pull request opened',
    preview: 'Addy opened a pull request: Fix login bug #142',
    body: 'Addy opened a pull request in your-org/repo.\n\nFix login bug #142\n\nView it on GitHub.',
    isPhishing: false,
  },
  {
    id: 'e5',
    from: 'HR Department',
    fromAddress: 'hr-payroll@company-hr-verify.info',
    subject: 'Updated payroll form — signature needed today',
    preview: 'Please review and sign the attached payroll update before end of day...',
    body: 'All employees must review and re-submit their direct deposit information using the secure form below before end of day, or your next paycheck may be delayed.\n\n[Open Secure Form]',
    isPhishing: true,
    tell: 'A ".info" domain claiming to be "company-hr-verify" doesn\'t match a real company domain, and real payroll changes are never rushed with a same-day deadline over email.',
    consequence:
      'This is a classic Business Email Compromise (BEC) pattern — if you entered your real bank details, the attacker could redirect your actual paycheck to their own account.',
  },
  {
    id: 'e6',
    from: 'Netflix',
    fromAddress: 'info@netflix.com',
    subject: 'New device signed in to your account',
    preview: 'A new device just signed in. If this was you, no action is needed.',
    body: 'A new device (Chrome on Windows) just signed in to your account. If this was you, you can ignore this message. If not, secure your account from Account Settings.',
    isPhishing: false,
  },
  {
    id: 'e7',
    from: 'LinkedIn',
    fromAddress: 'jobs-noreply@linkedin-careers.co',
    subject: 'Exciting job opportunity — Senior Developer at Google',
    preview: 'A recruiter at Google has viewed your profile and wants to connect...',
    body: 'Hi,\n\nA recruiter at Google has shortlisted your profile for a Senior Developer position. Salary: $180,000-$250,000.\n\nTo proceed, verify your identity by uploading your resume and ID proof through our secure portal.\n\n[Apply Now]\n\nLinkedIn Talent Team',
    isPhishing: true,
    tell: 'The domain "linkedin-careers.co" is not LinkedIn\'s real domain (linkedin.com). Legitimate recruiters never ask for ID proof via email links, and the salary range is suspiciously high to lure you in.',
    consequence: 'Uploading your ID documents (passport, driver\'s license) gives attackers everything they need for identity theft — opening credit cards, loans, or accounts in your name.',
  },
  {
    id: 'e8',
    from: 'Google Calendar',
    fromAddress: 'calendar-notification@google.com',
    subject: 'Reminder: Team sync at 2:00 PM tomorrow',
    preview: 'You have an upcoming event: Team sync — Conference Room B...',
    body: 'Reminder: Team sync\nWhen: Tomorrow, 2:00 PM – 2:30 PM\nWhere: Conference Room B\nOrganizer: adarsh.arya@company.com\n\nGoing? Yes / No / Maybe',
    isPhishing: false,
  },
  {
    id: 'e9',
    from: 'WhatsApp',
    fromAddress: 'verify@whatsapp-support.org',
    subject: 'Your WhatsApp account will expire in 24 hours',
    preview: 'Renew your WhatsApp subscription to avoid losing your chat history...',
    body: 'Dear User,\n\nYour WhatsApp subscription has expired. To continue using WhatsApp and avoid losing all your chat history, please verify your account within 24 hours.\n\n[Renew Subscription — $0.99/year]\n\nWhatsApp Support',
    isPhishing: true,
    tell: 'WhatsApp is free and has no subscription. The domain "whatsapp-support.org" is not owned by WhatsApp (real: whatsapp.com). This is a classic payment harvesting scam targeting less tech-savvy users.',
    consequence: 'Entering payment details on this page gives attackers your credit card number. The $0.99 amount is deliberately small to reduce suspicion.',
  },
  {
    id: 'e10',
    from: 'Slack',
    fromAddress: 'notifications@slack.com',
    subject: 'New message from #engineering',
    preview: 'Rohit: Has anyone tested the new auth flow on staging?...',
    body: '#engineering\n\nRohit (11:42 AM): Has anyone tested the new auth flow on staging? Getting a 403 on the callback URL.\n\nAisha (11:44 AM): I\'ll take a look after lunch.\n\nReply in Slack to continue this conversation.',
    isPhishing: false,
  },
]
