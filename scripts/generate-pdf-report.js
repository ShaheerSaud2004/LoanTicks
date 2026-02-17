/**
 * Generate PDF from CLIENT_SECURITY_REPORT.md
 * Creates a well-formatted HTML file that can be converted to PDF
 */

const fs = require('fs');
const path = require('path');

// Read the markdown file
const markdownPath = path.join(__dirname, '../docs/CLIENT_SECURITY_REPORT.md');
const markdownContent = fs.readFileSync(markdownPath, 'utf-8');

// Enhanced markdown to HTML converter
function markdownToHTML(markdown) {
  let html = markdown;
  
  // Headers with proper styling
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  
  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  
  // Code blocks (preserve formatting)
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
  
  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');
  
  // Lists - handle unordered lists
  html = html.replace(/^(\*|-|\+) (.+)$/gim, '<li>$2</li>');
  
  // Lists - handle ordered lists
  html = html.replace(/^(\d+)\. (.+)$/gim, '<li>$2</li>');
  
  // Wrap consecutive list items in ul tags
  html = html.replace(/(<li>.*<\/li>\n?)+/gim, (match) => {
    return '<ul>' + match + '</ul>';
  });
  
  // Emojis and special characters
  html = html.replace(/✅/g, '<span class="checkmark">✓</span>');
  html = html.replace(/⚠️/g, '<span class="warning">⚠</span>');
  html = html.replace(/🔒/g, '<span class="lock">🔒</span>');
  html = html.replace(/⭐/g, '<span class="star">★</span>');
  
  // Tables (basic support)
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('|') && line.includes('---')) {
      // Table header separator
      continue;
    } else if (line.trim().startsWith('|')) {
      // Table row
      if (!inTable) {
        inTable = true;
        result.push('<table>');
      }
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      const isHeader = i > 0 && lines[i-1].includes('---');
      const tag = isHeader ? 'th' : 'td';
      result.push(`<tr>${cells.map(cell => `<${tag}>${cell}</${tag}>`).join('')}</tr>`);
    } else {
      if (inTable) {
        result.push('</table>');
        inTable = false;
      }
      result.push(line);
    }
  }
  if (inTable) {
    result.push('</table>');
  }
  html = result.join('\n');
  
  // Paragraphs - wrap text blocks in p tags
  html = html.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<')) return block; // Already HTML
    if (block.match(/^<[h|u|o|l|t|p|d|h]/)) return block; // Already formatted
    return `<p>${block}</p>`;
  }).join('\n');
  
  return html;
}

// Create full HTML document with professional styling
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LOANATICKS Security Implementation Report</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2cm;
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1f2937;
      max-width: 900px;
      margin: 0 auto;
      padding: 0;
      background: white;
      font-size: 11pt;
    }
    
    .document-header {
      text-align: center;
      margin-bottom: 3em;
      padding-bottom: 2em;
      border-bottom: 4px solid #EAB308;
      page-break-after: avoid;
    }
    
    .document-header h1 {
      color: #1f2937;
      font-size: 2.5em;
      margin: 0.5em 0;
      font-weight: 700;
    }
    
    .document-header h2 {
      color: #4B5563;
      font-size: 1.8em;
      margin: 0.3em 0;
      font-weight: 600;
      border: none;
    }
    
    .document-header p {
      color: #6B7280;
      margin: 0.4em 0;
      font-size: 0.95em;
    }
    
    h1 {
      color: #1f2937;
      font-size: 1.8em;
      margin-top: 2em;
      margin-bottom: 0.8em;
      border-bottom: 3px solid #EAB308;
      padding-bottom: 0.4em;
      page-break-after: avoid;
      font-weight: 700;
    }
    
    h2 {
      color: #374151;
      font-size: 1.5em;
      margin-top: 1.8em;
      margin-bottom: 0.6em;
      border-bottom: 2px solid #9CA3AF;
      padding-bottom: 0.3em;
      page-break-after: avoid;
      font-weight: 600;
    }
    
    h3 {
      color: #4B5563;
      font-size: 1.2em;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
      font-weight: 600;
    }
    
    h4 {
      color: #6B7280;
      font-size: 1.1em;
      margin-top: 1.2em;
      margin-bottom: 0.4em;
      font-weight: 600;
    }
    
    p {
      margin: 0.9em 0;
      line-height: 1.8;
      text-align: justify;
      orphans: 3;
      widows: 3;
    }
    
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    
    li {
      margin: 0.5em 0;
      line-height: 1.7;
    }
    
    code {
      background: #F3F4F6;
      padding: 0.15em 0.4em;
      border-radius: 0.3em;
      font-family: 'Courier New', 'Monaco', monospace;
      font-size: 0.9em;
      color: #DC2626;
    }
    
    pre {
      background: #F9FAFB;
      padding: 1.2em;
      border-radius: 0.5em;
      border-left: 4px solid #EAB308;
      overflow-x: auto;
      font-family: 'Courier New', 'Monaco', monospace;
      font-size: 0.85em;
      line-height: 1.6;
      page-break-inside: avoid;
      margin: 1.2em 0;
    }
    
    pre code {
      background: transparent;
      padding: 0;
      color: #1f2937;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      page-break-inside: avoid;
      font-size: 0.95em;
    }
    
    th, td {
      border: 1px solid #E5E7EB;
      padding: 0.8em 1em;
      text-align: left;
    }
    
    th {
      background: #F9FAFB;
      font-weight: 600;
      color: #374151;
    }
    
    tr:nth-child(even) {
      background: #F9FAFB;
    }
    
    hr {
      border: none;
      border-top: 2px solid #E5E7EB;
      margin: 2.5em 0;
    }
    
    .rating {
      display: inline-block;
      background: #FEF3C7;
      color: #92400E;
      padding: 0.3em 0.8em;
      border-radius: 0.5em;
      font-weight: 600;
      margin-left: 0.5em;
      font-size: 0.95em;
    }
    
    .status-complete {
      color: #10B981;
      font-weight: 600;
    }
    
    .status-pending {
      color: #F59E0B;
      font-weight: 600;
    }
    
    .checkmark {
      color: #10B981;
      font-weight: bold;
    }
    
    .warning {
      color: #F59E0B;
    }
    
    .lock {
      color: #6366F1;
    }
    
    .star {
      color: #F59E0B;
    }
    
    .document-footer {
      margin-top: 4em;
      padding-top: 2em;
      border-top: 2px solid #E5E7EB;
      text-align: center;
      color: #6B7280;
      font-size: 0.9em;
      page-break-inside: avoid;
    }
    
    .document-footer p {
      margin: 0.5em 0;
      text-align: center;
    }
    
    @media print {
      body {
        padding: 0;
      }
      .page-break {
        page-break-before: always;
      }
      h1, h2, h3 {
        page-break-after: avoid;
      }
      pre, table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="document-header">
    <h1>🔒 Security Implementation Report</h1>
    <h2>LOANATICKS Mortgage Application System</h2>
    <p><strong>Prepared For:</strong> Client Review</p>
    <p><strong>Date:</strong> January 2025</p>
    <p><strong>Document Version:</strong> 1.0</p>
    <p><strong>Classification:</strong> Confidential</p>
  </div>

${markdownToHTML(markdownContent)}

  <div class="document-footer">
    <p><strong>END OF REPORT</strong></p>
    <p style="margin-top: 1em; font-size: 0.9em;">This document contains confidential security information. Distribution should be limited to authorized personnel only.</p>
    <p style="margin-top: 0.5em; font-size: 0.85em;">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</body>
</html>`;

// Save HTML file
const htmlPath = path.join(__dirname, '../docs/CLIENT_SECURITY_REPORT.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ HTML file created:', htmlPath);
console.log('');
console.log('📄 To convert to PDF:');
console.log('');
console.log('EASIEST METHOD (Recommended):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Open: docs/CLIENT_SECURITY_REPORT.html in your browser');
console.log('2. Press Cmd+P (Mac) or Ctrl+P (Windows/Linux)');
console.log('3. In print dialog, select "Save as PDF"');
console.log('4. Choose "More settings" and ensure:');
console.log('   • Background graphics: ON');
console.log('   • Margins: Default');
console.log('5. Click "Save"');
console.log('');
console.log('AUTOMATED METHOD:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('npm install puppeteer');
console.log('npm run pdf-from-html');
console.log('');
