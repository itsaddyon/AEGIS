export interface TeachSlide {
  title: string
  body: string
  example?: string
  rule: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explain: string
}

export interface MissionContent {
  id: string
  brief: string
  briefTagline: string
  learningGoals: string[]
  slides: TeachSlide[]
  quiz: QuizQuestion[]
}

export const MISSION_CONTENT: Record<string, MissionContent> = {
  'm1-intro': {
    id: 'm1-intro',
    brief: 'Every 39 seconds, a cyberattack hits someone online. The target isn\'t always a government or a bank — it\'s everyday people like you. An employee clicks a bad link and an entire hospital goes offline. A student shares a verification code and loses their savings. This mission is your first line of defense.',
    briefTagline: 'The battlefield is your inbox, your phone, your browser.',
    learningGoals: [
      'Understand what cybersecurity actually protects',
      'Recognize that attackers target people, not just machines',
      'Adopt the "pause before you click" mindset',
    ],
    slides: [
      {
        title: 'It\'s Not About Computers',
        body: 'Most cyberattacks don\'t involve hacking code. They involve tricking a human. An attacker sends a convincing email, and someone types their password into a fake page. That\'s it — no Hollywood hacking required.',
        example: '"Hi, your package couldn\'t be delivered. Click here to reschedule." — This single sentence has stolen millions of credit card numbers.',
        rule: 'Attackers target people, not firewalls.',
      },
      {
        title: 'The Three Weapons',
        body: 'Almost every social engineering attack uses the same three levers: URGENCY (act now or lose something), TRUST (pretending to be someone you know), and FEAR (threatening consequences). Once you can spot these three, you can spot 90% of attacks.',
        rule: 'If a message makes you feel rushed, scared, or flattered — slow down.',
      },
      {
        title: 'The Golden Rule',
        body: 'When something feels off, verify through a separate channel. Got a suspicious email from your bank? Don\'t click the link — open a new browser tab and go to your bank\'s real website. Got a text from "your boss"? Call them directly.',
        example: 'A CEO received an email from "the CFO" asking for a wire transfer. Instead of replying, they walked down the hall and asked in person. It was a scam.',
        rule: 'Never verify a message using the same channel it arrived on.',
      },
    ],
    quiz: [
      {
        question: 'Cyberattacks most often succeed by targeting...',
        options: ['Hardware vulnerabilities in servers', 'People, through everyday tools like email and phone', 'Only large enterprise firewalls', 'Satellite communication systems'],
        correctIndex: 1,
        explain: 'Over 90% of breaches start with a human being tricked — clicking a link, sharing a code, or entering credentials on a fake page.',
      },
      {
        question: 'You get a text saying "Your bank account is frozen. Tap here to unlock it." What should you do?',
        options: ['Tap the link immediately to fix it', 'Ignore all texts forever', 'Open your bank\'s official app or website separately to check', 'Reply asking if it\'s real'],
        correctIndex: 2,
        explain: 'Always verify through a separate, trusted channel. Never use the link provided in a suspicious message.',
      },
      {
        question: 'Which three emotional levers do attackers use most?',
        options: ['Humor, Curiosity, Boredom', 'Urgency, Trust, Fear', 'Sadness, Anger, Joy', 'Confusion, Surprise, Disgust'],
        correctIndex: 1,
        explain: 'Urgency ("act now!"), Trust ("I\'m from IT"), and Fear ("your account will be deleted") are the attacker\'s primary tools.',
      },
    ],
  },

  'm2-passwords': {
    id: 'm2-passwords',
    brief: 'In 2023, the most common password was still "123456." It takes less than one second to crack. A strong, unique password is like a unique key for every door you own — if one key is stolen, the others still work. Add MFA, and even a stolen key won\'t open the lock.',
    briefTagline: 'Your password is the only thing between an attacker and your life.',
    learningGoals: [
      'Distinguish weak passwords from strong ones',
      'Understand the danger of password reuse',
      'Learn what MFA is and why it blocks most attacks',
    ],
    slides: [
      {
        title: 'How Passwords Get Cracked',
        body: 'Attackers don\'t sit and guess. They use automated tools that try billions of combinations per second. Dictionary words, birthdays, pet names, and common patterns like "P@ssw0rd" are all in their playbooks.',
        example: '"Summer2024!" feels strong but appears in every breach dictionary. A truly random passphrase like "correct-horse-battery-staple" is far harder to crack.',
        rule: 'Length beats complexity. Use 4+ random words instead of short, "clever" substitutions.',
      },
      {
        title: 'The Domino Effect',
        body: 'When LinkedIn was breached in 2012, attackers didn\'t just get LinkedIn passwords. They tried those same passwords on Gmail, Facebook, and banking sites — and millions worked. This is called "credential stuffing."',
        example: 'If your Netflix password is "MyDog$Rex2024" and you use it for email too, one breach gives attackers access to everything.',
        rule: 'Every account gets its own unique password. Use a password manager to handle them.',
      },
      {
        title: 'Your Second Lock: MFA',
        body: 'Multi-Factor Authentication (MFA) adds a second verification step — usually a code from your phone. Even if an attacker has your password, they can\'t get in without your phone. MFA blocks 99.9% of automated attacks.',
        example: 'Google reported that adding MFA to accounts reduced successful phishing attacks by over 99%.',
        rule: 'Enable MFA on every account that offers it. Authenticator apps are safer than SMS codes.',
      },
    ],
    quiz: [
      {
        question: 'Why is "P@ssw0rd123!" considered weak despite having symbols and numbers?',
        options: ['It\'s too long', 'It\'s a common pattern that appears in every cracking dictionary', 'It has too many special characters', 'Passwords with numbers are always weak'],
        correctIndex: 1,
        explain: 'Attackers know people substitute @ for a, 0 for o, etc. These patterns are pre-loaded into cracking tools.',
      },
      {
        question: 'What is "credential stuffing"?',
        options: ['Filling in forms with random data', 'Using breached passwords from one site to break into others', 'A type of SQL injection attack', 'Overloading a server with login attempts'],
        correctIndex: 1,
        explain: 'When a site is breached, attackers take those leaked email/password pairs and try them on other services. If you reuse passwords, you\'re vulnerable.',
      },
      {
        question: 'MFA blocks approximately what percentage of automated attacks?',
        options: ['50%', '75%', '90%', '99.9%'],
        correctIndex: 3,
        explain: 'Microsoft and Google both report that MFA stops over 99% of automated account compromises.',
      },
    ],
  },

  'm3-phishing': {
    id: 'm3-phishing',
    brief: '"Phishing" is social engineering\'s sharpest weapon. The attacker crafts a message — email, text, or call — that impersonates someone you trust and pushes you to act before you think. The best phishing emails are nearly indistinguishable from real ones. Nearly.',
    briefTagline: 'They don\'t hack computers. They hack trust.',
    learningGoals: [
      'Recognize the pattern: urgency + trust + a link or request',
      'Spot tells: mismatched sender addresses, generic greetings, suspicious links',
      'Know the safe response: verify through a separate channel',
    ],
    slides: [
      {
        title: 'Anatomy of a Phishing Email',
        body: 'Every phishing email has the same skeleton: (1) a sender that LOOKS trusted, (2) a story that creates URGENCY, and (3) a call to action — click a link, open an attachment, or send information.',
        example: 'From: "IT-Security@your-company-portal.com" — looks official, but the real domain is "your-company.com". The extra "-portal" is the attacker\'s domain.',
        rule: 'Always check the actual sender address, not just the display name.',
      },
      {
        title: 'Hover Before You Click',
        body: 'Links in phishing emails often display one URL but link to another. On desktop, hovering over a link shows its true destination in the bottom-left corner. On mobile, long-press to preview.',
        example: 'The text says "https://paypal.com/verify" but hovering reveals "http://paypa1-secure.xyz/steal". Notice the "1" replacing "l".',
        rule: 'Never click a link without checking where it actually goes.',
      },
      {
        title: 'Spear Phishing vs. Mass Phishing',
        body: 'Mass phishing casts a wide net with generic bait ("Dear Customer"). Spear phishing is targeted — the attacker researches YOU specifically, using your name, job title, and recent activity to craft a personalized trap.',
        example: 'An attacker sees on LinkedIn that you just started a new job. They send an email as "HR" with a fake onboarding form on day one, when you\'re most likely to comply.',
        rule: 'Personalization doesn\'t mean legitimacy. Even emails that know your name can be attacks.',
      },
    ],
    quiz: [
      {
        question: '"Your account will be locked in 1 hour — click here now." What is the biggest red flag?',
        options: ['The email uses your name', 'It creates false urgency to prevent careful thinking', 'It is written in English', 'It has a company logo'],
        correctIndex: 1,
        explain: 'Urgency is the #1 pressure tactic. Legitimate companies don\'t threaten immediate lockouts via email.',
      },
      {
        question: 'An email from "support@amaz0n-orders.net" asks you to confirm your credit card. What\'s wrong?',
        options: ['Nothing, Amazon uses many domains', 'The "0" in "amaz0n" and the non-Amazon domain are telltale signs of a fake', 'You should reply and ask if it\'s real', 'Amazon never sends emails'],
        correctIndex: 1,
        explain: 'Typosquatting (replacing letters with lookalikes) and fake domains are classic phishing tactics.',
      },
      {
        question: 'What makes spear phishing more dangerous than regular phishing?',
        options: ['It uses bigger attachments', 'It\'s personalized with your real details, making it much harder to spot', 'It only targets governments', 'It uses a different protocol'],
        correctIndex: 1,
        explain: 'Spear phishing uses information about you (name, job, recent events) to craft highly convincing, targeted attacks.',
      },
    ],
  },

  'm4-email-safety': {
    id: 'm4-email-safety',
    brief: 'Beyond spotting phishing, email safety is a daily discipline. Every attachment is a potential payload. Every link is a potential trap. Every "urgent" request from a colleague deserves a second look. This mission teaches you the habits that make attacks bounce off.',
    briefTagline: 'Your inbox is a minefield. Learn where to step.',
    learningGoals: [
      'Check sender domains before trusting any email',
      'Handle attachments and links safely',
      'Report suspicious emails instead of just deleting them',
    ],
    slides: [
      {
        title: 'The Display Name Lie',
        body: 'Email display names can be set to anything. An attacker can make their name show as "Google Security Team" while sending from "xhacker42@gmail.com". Always expand the sender details to see the actual address.',
        example: 'You see "From: Microsoft Account Team" but expanding shows "microsoft-alerts@security-verify.xyz".',
        rule: 'Display names are decorations. Only the actual email address matters.',
      },
      {
        title: 'Attachment Landmines',
        body: 'Malicious attachments are one of the oldest tricks. PDFs can contain scripts, ZIP files can hide executables, and even Excel files can run macros that install malware. If you didn\'t expect it, don\'t open it.',
        example: 'An "invoice.pdf.exe" file looks like a PDF thanks to the double extension, but it\'s actually an executable program that installs ransomware.',
        rule: 'Never open unexpected attachments. When in doubt, verify with the sender through a separate channel.',
      },
      {
        title: 'Report, Don\'t Delete',
        body: 'Deleting a phishing email protects only you. Reporting it protects your entire organization. Most email clients have a "Report Phishing" button that alerts your IT security team and helps block future attacks.',
        rule: 'Always report suspicious emails. You might be the first person to catch a new attack campaign.',
      },
    ],
    quiz: [
      {
        question: 'An email shows "From: CEO John Smith" but the address is john.smith@company-updates.info. Is this safe?',
        options: ['Yes, it has the CEO\'s name', 'No — the domain "company-updates.info" doesn\'t match your real company domain', 'Only if it has a logo', 'You should reply to check'],
        correctIndex: 1,
        explain: 'The display name is irrelevant. What matters is whether the email address matches your organization\'s real domain.',
      },
      {
        question: 'You receive an unexpected "invoice.zip" from a vendor. What should you do?',
        options: ['Open it immediately to check', 'Contact the vendor through a known phone number to verify they sent it', 'Forward it to a friend to open', 'Rename the file and then open it'],
        correctIndex: 1,
        explain: 'Unexpected attachments, especially ZIP files, should always be verified with the sender through a separate, trusted channel.',
      },
      {
        question: 'Why is reporting phishing better than just deleting it?',
        options: ['It earns you a bonus', 'It helps your security team block the attack for everyone in the organization', 'Deleted emails come back', 'It doesn\'t matter either way'],
        correctIndex: 1,
        explain: 'Reporting feeds threat intelligence that protects your entire organization. Deleting only protects you.',
      },
    ],
  },

  'm5-safe-browsing': {
    id: 'm5-safe-browsing',
    brief: 'The address bar is the one element on a web page that the attacker cannot fully fake. The page itself — logos, layout, colors — can be cloned perfectly. But the URL? That\'s where the truth hides. This mission trains your eyes to read it.',
    briefTagline: 'The URL never lies. Learn to read it.',
    learningGoals: [
      'Read and verify a URL before entering credentials',
      'Recognize typosquatted and lookalike domains',
      'Understand what HTTPS does and does not guarantee',
    ],
    slides: [
      {
        title: 'Reading a URL',
        body: 'A URL has parts: protocol (https://), subdomain (accounts.), domain (google.com), and path (/login). The DOMAIN is what matters most. "accounts.google.com" is Google. "google.com.evil-site.net" is NOT — the real domain there is "evil-site.net".',
        example: '"https://login.paypal.com/signin" ✓ Real. "https://paypal.login-secure.com/signin" ✗ Fake — the domain is "login-secure.com".',
        rule: 'Read the domain from right to left. The two parts before the first single slash are the real domain.',
      },
      {
        title: 'The HTTPS Myth',
        body: 'HTTPS means the connection is encrypted — but it says nothing about whether the website is legitimate. Attackers can (and do) get HTTPS certificates for their phishing domains. A padlock doesn\'t mean "safe."',
        example: '"https://app1e-verify.com" has a padlock. It\'s still a phishing site. The padlock only means your data is encrypted in transit to the attacker\'s server.',
        rule: 'HTTPS = encrypted connection, not trustworthy website. Always check the domain.',
      },
      {
        title: 'Typosquatting',
        body: 'Attackers register domains that look like real ones but have subtle misspellings: "goggle.com", "amaz0n.com", "paypa1.com" (with a "1" instead of "l"). These are designed to catch people who type quickly or click without looking.',
        rule: 'Slow down and read the domain character by character. Bookmark important sites so you never need to type them.',
      },
    ],
    quiz: [
      {
        question: 'Which of these URLs is the real PayPal login?',
        options: ['https://paypal.secure-login.com/signin', 'https://www.paypal.com/signin', 'https://paypa1.com/signin', 'http://paypal-verify.net/login'],
        correctIndex: 1,
        explain: 'Only "www.paypal.com" is the real PayPal domain. The others use lookalike domains controlled by attackers.',
      },
      {
        question: 'A site has a padlock (HTTPS). Does that mean it\'s safe?',
        options: ['Yes, HTTPS guarantees the site is legitimate', 'No — HTTPS only means the connection is encrypted, not that the site is trustworthy', 'Yes, only verified businesses get HTTPS', 'It depends on the browser'],
        correctIndex: 1,
        explain: 'Anyone can get an HTTPS certificate. It encrypts data in transit but says nothing about who you\'re sending it to.',
      },
      {
        question: 'What is "typosquatting"?',
        options: ['A coding technique', 'Registering domains with subtle misspellings of real brands to trick users', 'A type of DDoS attack', 'A browser security feature'],
        correctIndex: 1,
        explain: 'Typosquatting exploits typos and visual similarity (l vs 1, 0 vs o) to redirect users to fake sites.',
      },
    ],
  },

  'm6-social-engineering': {
    id: 'm6-social-engineering',
    brief: 'Social engineering is the art of manipulating people. The attacker doesn\'t need technical skills — they need charm, confidence, and a good story. A phone call from "IT support." A USB drive left in a parking lot. A friendly stranger who holds the door open to a secure area.',
    briefTagline: 'The most dangerous hacker doesn\'t write code. They tell stories.',
    learningGoals: [
      'Identify pretexting, baiting, and tailgating attacks',
      'Recognize when someone is manipulating your helpfulness',
      'Apply verification protocols to voice and in-person requests',
    ],
    slides: [
      {
        title: 'Pretexting',
        body: 'The attacker invents a scenario — a "pretext" — to justify their request. "Hi, I\'m from IT, we\'re doing an emergency security audit and need your password to verify your account." The story sounds plausible, the tone is professional, and most people comply.',
        example: 'In a famous test, penetration testers called a company\'s help desk as "new employees who forgot their login." 75% of help desk staff reset passwords without proper verification.',
        rule: 'No legitimate IT department will ever ask for your password. Ever.',
      },
      {
        title: 'Baiting',
        body: 'Baiting exploits curiosity. A USB drive labeled "Salary Data 2024" is left in a company parking lot. Someone picks it up, plugs it in, and malware installs silently. Digital baiting works the same way — free movie downloads, cracked software, too-good-to-be-true offers.',
        example: 'In a 2016 study, researchers dropped 297 USB drives around a university. 48% were picked up and plugged in. The first one was opened within 6 minutes.',
        rule: 'If you find a USB drive, don\'t plug it in. Turn it in to IT or security.',
      },
      {
        title: 'Tailgating',
        body: 'Tailgating is following an authorized person through a secure door. The attacker carries a heavy box, looks lost, or simply walks confidently behind someone who badges in. Most people instinctively hold the door.',
        rule: 'Politely ask unfamiliar people to badge in themselves. Being helpful is good; being exploited is not.',
      },
    ],
    quiz: [
      {
        question: 'Someone calls you claiming to be from IT, asking for your password for a "security audit." What should you do?',
        options: ['Give it — IT needs it for security', 'Refuse and hang up. No legitimate IT team asks for passwords', 'Give a fake password', 'Ask them to email you instead'],
        correctIndex: 1,
        explain: 'No IT department will ever ask for your password. This is a classic pretexting attack.',
      },
      {
        question: 'You find a USB drive labeled "Confidential — HR" in the parking lot. What do you do?',
        options: ['Plug it into your computer to find the owner', 'Turn it in to IT or security without plugging it in', 'Plug it into a public computer instead', 'Give it to a coworker'],
        correctIndex: 1,
        explain: 'USB drives can auto-install malware the moment they\'re plugged in. Always turn them in to IT.',
      },
      {
        question: 'What is "tailgating" in a security context?',
        options: ['Following someone\'s car too closely', 'Following an authorized person through a secure door without badging in yourself', 'Monitoring network traffic', 'Sending follow-up phishing emails'],
        correctIndex: 1,
        explain: 'Tailgating exploits politeness — the natural instinct to hold doors open for others — to bypass physical security.',
      },
    ],
  },

  'm7-mobile-security': {
    id: 'm7-mobile-security',
    brief: 'Your phone knows more about you than your best friend does. Location, contacts, banking apps, photos, messages — it\'s all there. Mobile attacks exploit this through SMS phishing ("smishing"), malicious QR codes, fake apps, and public Wi-Fi eavesdropping.',
    briefTagline: 'Your phone is your most valuable asset. Protect it.',
    learningGoals: [
      'Recognize SMS phishing (smishing) and voice phishing (vishing)',
      'Evaluate QR codes and app downloads safely',
      'Protect yourself on public Wi-Fi networks',
    ],
    slides: [
      {
        title: 'Smishing — SMS Phishing',
        body: 'Smishing uses text messages instead of email. "Your package is delayed, click here to track it." "Unusual login detected on your bank account." The same urgency + trust formula works even better via text because people trust SMS more than email.',
        example: '"USPS: Your package has been held. Confirm delivery address: bit.ly/3xK9mZ" — This link leads to a credential harvesting page, not USPS.',
        rule: 'Treat unexpected texts with links just like suspicious emails. Verify through official apps.',
      },
      {
        title: 'QR Code Dangers',
        body: 'QR codes are just URLs in disguise. Attackers place malicious QR codes over legitimate ones — on parking meters, restaurant menus, or posters. Scanning takes you to a phishing site or triggers a malware download.',
        example: 'Scammers placed fake QR code stickers on parking meters in Austin, TX. Drivers scanned them and entered payment info on a fake city website.',
        rule: 'Preview the URL before opening it. If a QR code takes you to an unexpected domain, don\'t proceed.',
      },
      {
        title: 'Public Wi-Fi Traps',
        body: 'Public Wi-Fi is often unencrypted. Attackers set up fake hotspots with names like "Starbucks_Free_WiFi" and intercept everything you send. Even legitimate public Wi-Fi can be monitored.',
        rule: 'Use a VPN on public Wi-Fi. Never access banking or sensitive accounts on open networks.',
      },
    ],
    quiz: [
      {
        question: 'You receive a text: "Your bank detected unusual activity. Tap here to secure your account." What should you do?',
        options: ['Tap the link immediately', 'Open your bank\'s official app directly to check', 'Reply to the text asking for details', 'Forward it to your friends'],
        correctIndex: 1,
        explain: 'Never use a link from an unexpected text. Open the bank\'s official app or website directly.',
      },
      {
        question: 'What makes QR codes risky?',
        options: ['They use too much data', 'You can\'t see the URL before scanning, and they can be tampered with physically', 'They only work on iPhones', 'They drain your battery'],
        correctIndex: 1,
        explain: 'QR codes hide the URL. Attackers can overlay fake codes on legitimate ones to redirect you to phishing sites.',
      },
      {
        question: 'What\'s the safest way to use public Wi-Fi?',
        options: ['Connect without any precautions', 'Use a VPN to encrypt your traffic', 'Only use it for banking since it\'s faster', 'Share the password with friends'],
        correctIndex: 1,
        explain: 'A VPN encrypts your traffic so that even if someone is monitoring the network, they can\'t read your data.',
      },
    ],
  },

  'm8-final-assessment': {
    id: 'm8-final-assessment',
    brief: 'This is the final test. Everything you\'ve learned — passwords, phishing, social engineering, mobile security — comes together here. Score 70% or above and you earn your CAST Cyber Awareness Certificate. Ready?',
    briefTagline: 'Prove what you\'ve learned. Earn your certificate.',
    learningGoals: [
      'Demonstrate mastery across all cyber awareness topics',
      'Apply critical thinking to ambiguous, real-world scenarios',
      'Earn the CAST Cyber Awareness Certificate',
    ],
    slides: [
      {
        title: 'What You\'ve Learned',
        body: 'You\'ve covered the fundamentals: how attackers think, why passwords matter, how phishing works, email discipline, URL analysis, social engineering tactics, and mobile threats. The final assessment tests all of it.',
        rule: 'Trust your training. Pause, verify, and think before you act.',
      },
      {
        title: 'How This Works',
        body: 'You\'ll answer 5 questions covering every topic. Each question presents a realistic scenario. There\'s no time limit — take your time and think carefully. Score 70% or higher to earn your certificate.',
        rule: 'Read every option carefully. The best answer is the one that keeps you safest.',
      },
    ],
    quiz: [
      {
        question: 'You receive an email from "hr@your-company-portal.net" asking you to update your direct deposit info today. What\'s the safest response?',
        options: ['Click the link and update immediately', 'Call HR using the number on your company\'s official website', 'Reply to the email asking if it\'s legitimate', 'Forward it to your personal email for later'],
        correctIndex: 1,
        explain: 'The domain ".net" doesn\'t match your company\'s real domain. Verify through a separate trusted channel — never through the suspicious email itself.',
      },
      {
        question: 'Your colleague sends a USB drive to your desk with a sticky note: "Marketing files for the meeting." You weren\'t expecting it. What do you do?',
        options: ['Plug it in — your colleague sent it', 'Walk over to your colleague and verbally confirm they sent it before plugging it in', 'Plug it into a shared computer instead', 'Ignore it permanently'],
        correctIndex: 1,
        explain: 'Even seemingly trustworthy deliveries should be verified in person. Attackers can impersonate colleagues.',
      },
      {
        question: 'You\'re at a coffee shop and need to check your bank account. The shop offers free Wi-Fi. What\'s the best approach?',
        options: ['Connect to the Wi-Fi and log in normally', 'Use your phone\'s mobile data or a VPN instead', 'Ask the barista if the Wi-Fi is safe', 'Only check your balance, not transfer money'],
        correctIndex: 1,
        explain: 'Public Wi-Fi can be monitored. Use mobile data or a VPN for sensitive activities.',
      },
      {
        question: 'A website at "https://arnazon.com" asks for your Amazon login. It has a padlock icon. Is it safe?',
        options: ['Yes — it has HTTPS and a padlock', 'No — "arnazon" is a typosquatted domain; the padlock only means the connection is encrypted', 'Yes — Amazon uses many domains', 'Check if the page has Amazon\'s logo'],
        correctIndex: 1,
        explain: 'HTTPS doesn\'t mean trustworthy. "arnazon" uses an "rn" that looks like "m" — classic typosquatting.',
      },
      {
        question: 'What is the single most effective thing you can do to protect your online accounts?',
        options: ['Use the same strong password everywhere', 'Enable multi-factor authentication on every account', 'Change your password every week', 'Only use private browsing mode'],
        correctIndex: 1,
        explain: 'MFA blocks 99.9% of automated attacks. Even if your password is compromised, MFA keeps attackers out.',
      },
    ],
  },
}
