export interface SiteRound {
  id: string
  url: string
  isFake: boolean
  tell?: string
  consequence?: string
  pageTitle?: string
  pageSubtitle?: string
}

export const SITE_ROUNDS: SiteRound[] = [
  {
    id: 's1',
    url: 'https://accounts.google.com/signin',
    isFake: false,
    pageTitle: 'Google',
    pageSubtitle: 'Sign in to continue to Gmail',
  },
  {
    id: 's2',
    url: 'https://accounts-google-secure-login.com/signin',
    isFake: true,
    pageTitle: 'Google',
    pageSubtitle: 'Sign in to continue to Gmail',
    tell: 'The real domain is "google.com" — "accounts.google.com" is a subdomain of it. "accounts-google-secure-login.com" is an entirely different domain that just contains the word "google."',
    consequence: 'Signing in here sends your Google credentials directly to the attacker.',
  },
  {
    id: 's3',
    url: 'https://www.paypal.com/signin',
    isFake: false,
    pageTitle: 'PayPal',
    pageSubtitle: 'Log in to your account',
  },
  {
    id: 's4',
    url: 'http://paypa1-secure-verify.com/login',
    isFake: true,
    pageTitle: 'PayPal',
    pageSubtitle: 'Log in to your account',
    tell: '"paypa1" replaces "l" with "1" (typosquatting), and the connection is "http://" — no encryption.',
    consequence: 'Credentials are sent in plain text and go straight to the attacker\'s server.',
  },
  {
    id: 's5',
    url: 'https://www.rit.ac.in/student-portal',
    isFake: false,
    pageTitle: 'RIT Student Portal',
    pageSubtitle: 'Access your academic dashboard',
  },
  {
    id: 's6',
    url: 'https://rit-ac-in.verify-account-now.xyz/login',
    isFake: true,
    pageTitle: 'RIT Student Portal',
    pageSubtitle: 'Verify your student account',
    tell: 'The real domain "rit.ac.in" is embedded into a completely different domain "verify-account-now.xyz". Only the part before ".xyz" matters.',
    consequence: 'Trusted names buried in unrelated domains trick users who only glance at the start of the URL.',
  },
  {
    id: 's7',
    url: 'https://www.amazon.in/ap/signin',
    isFake: false,
    pageTitle: 'Amazon',
    pageSubtitle: 'Sign in to your account',
  },
  {
    id: 's8',
    url: 'https://arnazon-india.com/ap/signin',
    isFake: true,
    pageTitle: 'Amazon',
    pageSubtitle: 'Sign in to your account',
    tell: '"arnazon" uses "rn" which visually resembles "m" — a classic homoglyph attack. The domain is also not amazon.in.',
    consequence: 'This homoglyph trick is extremely hard to catch at a glance, making it one of the most effective domain spoofing techniques.',
  },
  {
    id: 's9',
    url: 'https://github.com/login',
    isFake: false,
    pageTitle: 'GitHub',
    pageSubtitle: 'Sign in to GitHub',
  },
  {
    id: 's10',
    url: 'https://githiub.com/login',
    isFake: true,
    pageTitle: 'GitHub',
    pageSubtitle: 'Sign in to GitHub',
    tell: '"githiub" has an extra "i" — a subtle typo that\'s easy to miss when scanning quickly. The page looks identical but the domain is wrong.',
    consequence: 'Developers often have access tokens and SSH keys linked to GitHub. Compromising this account can expose entire codebases.',
  },
]
