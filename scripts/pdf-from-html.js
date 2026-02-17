/**
 * Convert HTML to PDF using Puppeteer
 * Run: npm install puppeteer
 * Then: node scripts/pdf-from-html.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  try {
    console.log('🚀 Starting PDF generation...');
    
    const htmlPath = path.join(__dirname, '../docs/CLIENT_SECURITY_REPORT.html');
    
    if (!fs.existsSync(htmlPath)) {
      console.error('❌ HTML file not found. Please run generate-pdf-report.js first.');
      process.exit(1);
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Load the HTML file
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdfPath = path.join(__dirname, '../docs/CLIENT_SECURITY_REPORT.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #6B7280; padding: 0 2cm;">LOANATICKS Security Implementation Report</div>',
      footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #6B7280; padding: 0 2cm;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    });

    await browser.close();

    console.log('✅ PDF generated successfully!');
    console.log('📄 Location:', pdfPath);
    console.log('');
    console.log('✨ PDF is ready to share with your client!');
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    console.log('');
    console.log('💡 Alternative: Open docs/CLIENT_SECURITY_REPORT.html in your browser');
    console.log('   and use Print > Save as PDF');
    process.exit(1);
  }
}

generatePDF();
