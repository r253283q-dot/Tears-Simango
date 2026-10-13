import { jsPDF } from 'jspdf';
import { Company, FeedbackItem } from '../types';

export interface ReportStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  responseReq: number;
  healthScore: number;
  topComplaints: [string, number][];
  langCounts: Record<string, number>;
  selectedChannel: string;
  selectedTimeRange: string;
}

export const generateExecutivePDF = (
  company: Company,
  stats: ReportStats,
  recommendations: Array<{ priority: string; title: string; detail: string; relatedIssue: string }>
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  // Header Background Accent Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Brand Header
  doc.setTextColor(20, 184, 166); // teal-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ZIMBABWE CUSTOMER SENTIMENT INTELLIGENCE', margin + 6, y + 8);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('EXECUTIVE SENTIMENT & INTELLIGENCE REPORT', margin + 6, y + 17);

  y += 30;

  // Company Details Block
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(margin, y, contentWidth, 22, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(company.name, margin + 4, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Sector: ${company.sector}  |  Location: ${company.city}, Zimbabwe`, margin + 4, y + 15);

  const dateStr = `Date: ${new Date().toLocaleDateString('en-GB')}  |  Scope: ${stats.selectedChannel}  |  Range: ${stats.selectedTimeRange}`;
  doc.text(dateStr, pageWidth - margin - 4 - doc.getTextWidth(dateStr), y + 15);

  y += 28;

  // Section 1: Executive KPI Metrics
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. EXECUTIVE SUMMARY & SENTIMENT METRICS', margin, y);
  y += 5;

  // 5 KPI Cards
  const cardGap = 3;
  const cardWidth = (contentWidth - cardGap * 4) / 5;
  const cardHeight = 22;

  const kpis = [
    { label: 'TOTAL REVIEWS', val: `${stats.total}`, sub: '100% Cohort', bg: [241, 245, 249], border: [203, 213, 225], text: [15, 23, 42] },
    { label: 'POSITIVE', val: `${stats.positive}`, sub: `${stats.total ? Math.round((stats.positive / stats.total) * 100) : 0}% share`, bg: [236, 253, 245], border: [167, 243, 208], text: [6, 95, 70] },
    { label: 'NEUTRAL', val: `${stats.neutral}`, sub: `${stats.total ? Math.round((stats.neutral / stats.total) * 100) : 0}% share`, bg: [248, 250, 252], border: [226, 232, 240], text: [71, 85, 105] },
    { label: 'NEGATIVE', val: `${stats.negative}`, sub: `${stats.total ? Math.round((stats.negative / stats.total) * 100) : 0}% share`, bg: [255, 241, 242], border: [254, 205, 211], text: [159, 18, 57] },
    { label: 'HEALTH INDEX', val: `${stats.healthScore}/100`, sub: 'Net Sentiment', bg: [15, 23, 42], border: [15, 23, 42], text: [255, 255, 255] },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (cardWidth + cardGap);
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(kpi.border[0], kpi.border[1], kpi.border[2]);
    doc.rect(cardX, y, cardWidth, cardHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    if (idx === 4) {
      doc.setTextColor(20, 184, 166);
    } else {
      doc.setTextColor(100, 116, 139);
    }
    doc.text(kpi.label, cardX + 3, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(kpi.text[0], kpi.text[1], kpi.text[2]);
    doc.text(kpi.val, cardX + 3, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    if (idx === 4) {
      doc.setTextColor(226, 232, 240);
    } else {
      doc.setTextColor(100, 116, 139);
    }
    doc.text(kpi.sub, cardX + 3, y + 19);
  });

  y += cardHeight + 8;

  // Section 2: Major Issues & Complaint Patterns
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. MAJOR CUSTOMER COMPLAINTS & ISSUE FREQUENCY', margin, y);
  y += 5;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 7, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('ISSUE CATEGORY', margin + 4, y + 4.8);
  doc.text('COUNT', margin + 85, y + 4.8);
  doc.text('PROPORTION OF NEGATIVE', margin + 115, y + 4.8);
  doc.text('OPERATIONAL URGENCY', margin + 150, y + 4.8);

  y += 7;

  if (stats.topComplaints.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('No significant negative complaint issues recorded in the selected period.', margin + 4, y + 6);
    y += 10;
  } else {
    stats.topComplaints.slice(0, 5).forEach(([issue, cnt]) => {
      const rowHeight = 7;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, rowHeight, 'FD');

      const ratio = Math.round((cnt / (stats.negative || 1)) * 100);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(issue, margin + 4, y + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`${cnt} records`, margin + 85, y + 4.8);
      doc.text(`${ratio}%`, margin + 115, y + 4.8);

      // Urgency
      if (cnt >= 3) {
        doc.setTextColor(185, 28, 28); // red
        doc.setFont('helvetica', 'bold');
        doc.text('High Priority Action', margin + 150, y + 4.8);
      } else {
        doc.setTextColor(217, 119, 6); // amber
        doc.text('Standard Priority', margin + 150, y + 4.8);
      }

      y += rowHeight;
    });
  }

  y += 6;

  // Section 3: Multilingual & Response Requirements (Side by Side summary)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. LINGUISTIC PATTERNS & RESPONSE BACKLOG', margin, y);
  y += 5;

  const boxW = (contentWidth - 6) / 2;
  const boxH = 22;

  // Box Left: Language Distribution
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, boxW, boxH, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Language Distribution & Code-Mixing:', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const langText = Object.entries(stats.langCounts)
    .map(([l, c]) => `${l}: ${c} (${stats.total ? Math.round((c / stats.total) * 100) : 0}%)`)
    .join('  •  ');
  const splitLangs = doc.splitTextToSize(langText || 'No linguistic data', boxW - 8);
  doc.text(splitLangs, margin + 4, y + 13);

  // Box Right: Response Backlog
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(254, 240, 138); // amber-200
  doc.rect(margin + boxW + 6, y, boxW, boxH, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text(`Direct Response Action Required: ${stats.responseReq} Items`, margin + boxW + 10, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(180, 83, 9);
  const backlogDesc = doc.splitTextToSize(
    'Unresolved inquiries received across WhatsApp, TikTok, and SMS require prompt engagement to prevent customer churn and negative social sentiment escalation.',
    boxW - 8
  );
  doc.text(backlogDesc, margin + boxW + 10, y + 12);

  y += boxH + 8;

  // Section 4: Actionable Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. STRATEGIC BUSINESS RECOMMENDATIONS', margin, y);
  y += 5;

  recommendations.slice(0, 3).forEach((rec, idx) => {
    const isImmediate = rec.priority === 'Immediate';
    doc.setFillColor(isImmediate ? 255 : 240, isImmediate ? 241 : 253, isImmediate ? 242 : 250);
    doc.setDrawColor(isImmediate ? 254 : 204, isImmediate ? 205 : 251, isImmediate ? 211 : 241);
    doc.rect(margin, y, contentWidth, 18, 'FD');

    // Priority pill
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(isImmediate ? 159 : 15, isImmediate ? 18 : 118, isImmediate ? 57 : 110);
    doc.text(`[${rec.priority.toUpperCase()}]  ${rec.title}`, margin + 4, y + 5.5);

    // Detail text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const splitDetail = doc.splitTextToSize(rec.detail, contentWidth - 8);
    doc.text(splitDetail, margin + 4, y + 10.5);

    y += 20;
  });

  // Footer & Confidentiality on bottom of page
  const footerY = pageHeight - 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Zimbabwe Customer Sentiment Intelligence Platform  •  Enterprise Analytics', margin, footerY);
  doc.text('CONFIDENTIAL EXECUTIVE BRIEFING', pageWidth - margin - 50, footerY);

  // Trigger download
  const safeFilename = `${company.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sentiment_report.pdf`;
  doc.save(safeFilename);
};
