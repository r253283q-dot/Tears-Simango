import { LanguageType, SentimentType, IssueCategory, PriorityLevel } from '../types';

interface NLPAnalysisResult {
  sentiment: SentimentType;
  language: LanguageType;
  issue: IssueCategory;
  priority: PriorityLevel;
  responseRequired: boolean;
  customerInsight: string;
}

// Zimbabwean Shona keywords
const SHONA_STEMS = [
  'zvakanaka', 'zvakaoma', 'haisi', 'handisi', 'zvirinani', 'mari', 'yenyu', 'wacho',
  'stereki', 'basa', 'tinotenda', 'zvanyanya', 'musadaro', 'nguva', 'vanhu', 'chinhu',
  'kunonoka', 'nhasi', 'kushanda', 'hapana', 'haasati', 'auya', 'makadii', 'tatenda',
  'zvirikufamba', 'kwete', 'chokwadi', 'chero', 'bhegi', 'kudhura', 'mbavha', 'kurwara',
  'hazvisi', 'munoita', 'panze', 'kureva', 'zvose', 'zvikuru', 'munhu', 'hama', 'ndapota',
  'hazvina', 'zvinorwadza', 'kufona', 'mhinduro', 'haana', 'mubvunzo', 'zvakanonoka'
];

// Zimbabwean Ndebele keywords
const NDEBELE_STEMS = [
  'kuhle', 'kakhulu', 'siyabonga', 'ngiyabonga', 'imali', 'yami', 'kayikafiki', 'angitholi',
  'usizo', 'kuyabiza', 'lomsebenzi', 'omuhle', 'libi', 'akukho', 'kodwa', 'iphezulu',
  'aliphenduli', 'kufuneka', 'namhlanje', 'linjani', 'kuyatshisa', 'hatshi', 'yebo', 'abantu',
  'umsebenzi', 'isikhathi', 'ukuthula', 'indlela', 'kancane', 'ukudla', 'umnandi', 'ububi',
  'isinqumo', 'baphi', 'angiboni', 'kukhona', 'ukuhamba', 'ngidinga', 'sizani'
];

// Sentiment lexicons
const POSITIVE_MARKERS = [
  'great', 'excellent', 'fast', 'quick', 'superb', 'best', 'reliable', 'loved', 'happy',
  'zvakanaka', 'stereki', 'tinotenda', 'tatenda', 'zvirinani', 'basa guru', 'kuhle',
  'kakhulu', 'siyabonga', 'ngiyabonga', 'omuhle', 'helpful', 'wonderful', 'satisfied',
  'smooth', 'impressed', 'clean', 'professional', 'thumbs up', 'well done', 'appreciate'
];

const NEGATIVE_MARKERS = [
  'bad', 'poor', 'slow', 'worst', 'terrible', 'horrible', 'delay', 'failed', 'deducted',
  'stole', 'thieves', 'scam', 'rude', 'unhelpful', 'useless', 'broken', 'offline',
  'zvakaoma', 'haisi', 'zvanyanya', 'kudhura', 'musadaro', 'mbavha', 'kunonoka', 'hazvisi',
  'zvinorwadza', 'hapana', 'libi', 'akukho', 'kuyabiza', 'kayikafiki', 'angitholi',
  'aliphenduli', 'ububi', 'rubbish', 'frustrated', 'disappointed', 'pathetic', 'waiting',
  'haasati', 'overcharged', 'glitch', 'error', 'fraud', 'useless'
];

// Category patterns
const ISSUE_PATTERNS: { category: IssueCategory; terms: string[] }[] = [
  {
    category: 'Transaction & Payments',
    terms: ['ecocash', 'innbucks', 'transfer', 'balance', 'deducted', 'payment', 'zimswitch', 'token', 'tokens', 'zesa', 'swiped', 'pay', 'transaction', 'reversal', 'refund', 'mari', 'imali', 'float', 'charges', 'bank']
  },
  {
    category: 'Pricing & Tariffs',
    terms: ['price', 'pricing', 'expensive', 'cost', 'charge', 'charges', 'tariff', 'tariffs', 'rate', 'rates', 'overcharge', 'fee', 'fees', 'kudhura', 'kuyabiza', 'zvanyanya', 'expensive', 'dollar', 'usd', 'zig']
  },
  {
    category: 'Network & Uptime',
    terms: ['network', 'data', 'bundle', 'bundles', 'internet', 'signal', 'offline', 'down', 'connection', 'coverage', 'server', 'system down', 'downtime', 'liquid', 'starlink', 'econet', 'netone', 'telecel']
  },
  {
    category: 'Delivery & Logistics',
    terms: ['delivery', 'deliver', 'courier', 'driver', 'late', 'dispatch', 'order arrived', 'tracking', 'parcel', 'package', 'kunonoka', 'delayed', 'shipment', 'arrive']
  },
  {
    category: 'Customer Support',
    terms: ['support', 'agent', 'hotline', 'whatsapp', 'call centre', 'unresponsive', 'rude', 'attitude', 'reply', 'response', 'ignore', 'aliphenduli', 'mhinduro', 'customer care', 'rep', 'representative']
  },
  {
    category: 'Product Quality',
    terms: ['quality', 'broken', 'expired', 'damaged', 'fake', 'original', 'taste', 'size', 'defect', 'material', 'working', 'haisi kushanda', 'faulty']
  },
  {
    category: 'Account & Verification',
    terms: ['account', 'login', 'pin', 'password', 'verify', 'kyc', 'blocked', 'registration', 'otp', 'access', 'profile']
  }
];

export function analyzeFeedbackText(rawText: string): NLPAnalysisResult {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();
  const words = lower.split(/[^a-zA-Z0-9_\u00C0-\u017F]+/).filter(w => w.length > 1);

  // 1. Language Detection
  let shonaMatches = 0;
  let ndebeleMatches = 0;
  let englishMatches = 0;

  words.forEach(w => {
    if (SHONA_STEMS.some(stem => w.includes(stem) || stem.includes(w))) shonaMatches++;
    if (NDEBELE_STEMS.some(stem => w.includes(stem) || stem.includes(w))) ndebeleMatches++;
    // English indicators
    if (['the', 'and', 'with', 'for', 'this', 'that', 'service', 'delivery', 'system', 'please', 'today', 'customer'].includes(w)) {
      englishMatches++;
    }
  });

  let language: LanguageType = 'English';
  if (shonaMatches > 0 && englishMatches > 0) {
    language = 'Code-Mixed';
  } else if (ndebeleMatches > 0 && englishMatches > 0) {
    language = 'Code-Mixed';
  } else if (shonaMatches > 0 && shonaMatches >= ndebeleMatches) {
    language = 'Shona';
  } else if (ndebeleMatches > 0) {
    language = 'Ndebele';
  } else {
    language = 'English';
  }

  // 2. Sentiment Classification
  let posScore = 0;
  let negScore = 0;

  POSITIVE_MARKERS.forEach(marker => {
    if (lower.includes(marker)) posScore += 1.5;
  });

  NEGATIVE_MARKERS.forEach(marker => {
    if (lower.includes(marker)) negScore += 1.8;
  });

  // Additional context modifiers
  if (lower.includes('not working') || lower.includes('haisi kushanda') || lower.includes('ayisebenzi')) {
    negScore += 2.0;
  }
  if (lower.includes('zvakanaka stereki') || lower.includes('siyabonga kakhulu') || lower.includes('thank you so much')) {
    posScore += 2.0;
  }

  let sentiment: SentimentType = 'Neutral';
  if (negScore > posScore && negScore >= 1.5) {
    sentiment = 'Negative';
  } else if (posScore > negScore && posScore >= 1.5) {
    sentiment = 'Positive';
  } else {
    // If scores are tied or close to zero
    sentiment = 'Neutral';
  }

  // 3. Issue Categorisation
  let matchedCategory: IssueCategory = 'General Inquiry';
  let highestCategoryScore = 0;

  for (const item of ISSUE_PATTERNS) {
    let score = 0;
    for (const term of item.terms) {
      if (lower.includes(term)) {
        score += term.includes(' ') ? 2 : 1;
      }
    }
    if (score > highestCategoryScore) {
      highestCategoryScore = score;
      matchedCategory = item.category;
    }
  }

  // 4. Priority Determination
  let priority: PriorityLevel = 'Low';
  const hasMonetaryIssue = matchedCategory === 'Transaction & Payments' || matchedCategory === 'Pricing & Tariffs';
  const isSevereNegative = sentiment === 'Negative' && (negScore >= 3 || lower.includes('stole') || lower.includes('scam') || lower.includes('deducted') || lower.includes('urgent') || lower.includes('failed'));

  if (isSevereNegative || (hasMonetaryIssue && sentiment === 'Negative')) {
    priority = 'High';
  } else if (sentiment === 'Negative' || (hasMonetaryIssue && sentiment === 'Neutral')) {
    priority = 'Medium';
  } else if (matchedCategory === 'Customer Support' && sentiment !== 'Positive') {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }

  // 5. Response Requirement
  const responseRequired = sentiment === 'Negative' || priority === 'High' || lower.includes('?') || lower.includes('help') || lower.includes('ndapota') || lower.includes('sizani') || lower.includes('contact');

  // 6. Actionable Customer Insight Synthesis
  let customerInsight = '';
  if (sentiment === 'Negative') {
    if (matchedCategory === 'Transaction & Payments') {
      customerInsight = 'Payment reconciliation issue identified. Customer experienced friction during checkout or token issuance; rapid follow-up recommended.';
    } else if (matchedCategory === 'Pricing & Tariffs') {
      customerInsight = 'Price sensitivity detected. Customer is voicing concern regarding transaction fees or product tariff increases.';
    } else if (matchedCategory === 'Network & Uptime') {
      customerInsight = 'Service interruption reported. Connectivity or platform downtime is actively degrading customer experience.';
    } else if (matchedCategory === 'Delivery & Logistics') {
      customerInsight = 'Fulfillment delay reported. Logistics dispatch or courier transit exceeded customer expectations.';
    } else if (matchedCategory === 'Customer Support') {
      customerInsight = 'Support channel escalation. Customer reported lack of timely communication or representative availability.';
    } else {
      customerInsight = 'Operational friction point identified. Service delivery fell short of standard benchmarks.';
    }
  } else if (sentiment === 'Positive') {
    if (matchedCategory === 'Delivery & Logistics') {
      customerInsight = 'Speed and dispatch efficiency praised as primary driver of customer satisfaction.';
    } else if (matchedCategory === 'Product Quality') {
      customerInsight = 'High product reliability and build quality reinforced customer loyalty.';
    } else if (matchedCategory === 'Customer Support') {
      customerInsight = 'Responsive and polite customer support interaction created strong brand affinity.';
    } else {
      customerInsight = 'Favourable customer experience. Service execution aligned with user expectations.';
    }
  } else {
    customerInsight = 'Neutral operational touchpoint. Routine transaction or general operational interaction without strong sentiment polarity.';
  }

  return {
    sentiment,
    language,
    issue: matchedCategory,
    priority,
    responseRequired,
    customerInsight
  };
}
