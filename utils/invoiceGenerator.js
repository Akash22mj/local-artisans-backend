// const PDFDocument = require('pdfkit');
// const fs = require('fs');

// const generateInvoice = (order, path) => {
//   return new Promise((resolve, reject) => {
//     try {
//       const doc = new PDFDocument();

//       const writeStream = fs.createWriteStream(path);
//       doc.pipe(writeStream);

//       doc.fontSize(20).text('Invoice', { align: 'center' });

//       doc.moveDown();
//       doc.fontSize(14).text(`Tracking Number: ${order.trackingNumber}`);
//       doc.text(`Order Status: ${order.orderStatus || "Pending"}`);
//       doc.moveDown();

//       doc.text('Products:');
//       (order.products || []).forEach((item, index) => {
//         doc.text(`${index + 1}. ${item.name || item.productId?.name || "N/A"} - Qty: ${item.quantity || 1} - Price: ₹${item.price || 0}`);
//       });

//       doc.moveDown();
//       doc.fontSize(16).text(`Total Amount: ₹${order.totalAmount || 0}`, { align: 'right' });

//       doc.end();

//       writeStream.on('finish', resolve);
//       writeStream.on('error', reject);
//     } catch (err) {
//       reject(err);
//     }
//   });
// };

// module.exports = generateInvoice;


// const PDFDocument = require('pdfkit');
// const fs = require('fs');

// const generateInvoice = (order, path) => {
//   return new Promise((resolve, reject) => {
//     try {
//       const doc = new PDFDocument({ margin: 50, size: 'A4' });

//       const writeStream = fs.createWriteStream(path);
//       doc.pipe(writeStream);

//       // Color theme
//       const primaryColor = '#004aad'; // Deep blue
//       const secondaryColor = '#f5f5f5'; // Light gray background
//       const accentColor = '#ffd700'; // Gold for highlights

//       // Draw background rectangle for the header
//       doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);

//       // Invoice Title - Stylish
//       doc
//         .fillColor('white')
//         .fontSize(30)
//         .font('Helvetica-Bold')
//         .text('INVOICE', 50, 25, { align: 'center', lineGap: 6 });

//       // Move to next area
//       doc.moveDown(3);

//       // Order Information Section (on a light background box)
//       doc
//         .fillColor(secondaryColor)
//         .rect(40, doc.y, doc.page.width - 80, 100)
//         .fill();

//       doc
//         .fillColor('black')
//         .fontSize(14)
//         .font('Helvetica-Bold')
//         .text(`Tracking Number:`, 60, doc.y + 10);

//       doc
//         .font('Helvetica')
//         .text(`${order.trackingNumber}`, 200, doc.y - 18);

//       doc
//         .font('Helvetica-Bold')
//         .text(`Order Status:`, 60, doc.y + 10);

//       doc
//         .font('Helvetica')
//         .text(`${order.orderStatus || "Pending"}`, 200, doc.y - 18);

//       doc.moveDown(4);

//       // Divider line
//       doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor(primaryColor).lineWidth(2).stroke();
//       doc.moveDown(1);

//       // Products Section
//       doc
//         .fontSize(18)
//         .fillColor(primaryColor)
//         .font('Helvetica-Bold')
//         .text('Products', { underline: true });

//       doc.moveDown(1);

//       (order.products || []).forEach((item, index) => {
//         const productName = sanitizeText(item.name || item.productId?.name || "N/A");
      
//         doc
//           .fontSize(12)
//           .fillColor('black')
//           .font('Helvetica')
//           .list([`${productName} (x${item.quantity || 1}) - ₹${item.price || 0}`], {
//             bulletRadius: 2
//           });
//       });
      

//       doc.moveDown(2);

//       // Divider
//       doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor(accentColor).lineWidth(2).stroke();
//       doc.moveDown(2);

//       // Total Amount Section
//       doc
//         .fontSize(18)
//         .fillColor('black')
//         .font('Helvetica-Bold')
//         .text(`Total Amount: ₹${order.totalAmount || 0}`, {
//           align: 'right',
//           characterSpacing: 1.5
//         });

//       // Footer - Light text
//       doc.moveDown(5);
//       doc
//         .fontSize(10)
//         .fillColor('gray')
//         .font('Helvetica-Oblique')
//         .text('Thank you for your purchase!', { align: 'center' });

//       // End the document
//       doc.end();

//       // Write Stream Handling
//       writeStream.on('finish', resolve);
//       writeStream.on('error', reject);
//     } catch (err) {
//       reject(err);
//     }
//   });
// };

// module.exports = generateInvoice;



const PDFDocument = require('pdfkit');
const fs = require('fs');

// Helper function to sanitize text
function sanitizeText(text) {
  return (text || '')
    .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII characters (optional)
    .replace(/\s+/g, ' ')         // Normalize whitespace
    .trim();
}

// Helper to format currency
function formatINRCurrency(amount) {
  return `\u20B9${Number(amount).toLocaleString('en-IN')}`;
}

const generateInvoice = (order, path) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      const writeStream = fs.createWriteStream(path);
      doc.pipe(writeStream);

      // Theme colors
      const primaryColor = '#004aad'; // Deep blue
      const secondaryColor = '#f5f5f5'; // Light gray
      const accentColor = '#ffd700'; // Gold

      // Header
      doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
      doc
        .fillColor('white')
        .fontSize(30)
        .font('Helvetica-Bold')
        .text('INVOICE', 50, 25, { align: 'center', lineGap: 6 });

      doc.moveDown(3);

      // Order Information Section
      doc
        .fillColor(secondaryColor)
        .rect(40, doc.y, doc.page.width - 80, 100)
        .fill();

      doc
        .fillColor('black')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`Tracking Number:`, 60, doc.y + 10);

      doc
        .font('Helvetica')
        .text(sanitizeText(order.trackingNumber), 200, doc.y - 18);

      doc
        .font('Helvetica-Bold')
        .text(`Order Status:`, 60, doc.y + 10);

      doc
        .font('Helvetica')
        .text(sanitizeText(order.orderStatus || "Pending"), 200, doc.y - 18);

      doc.moveDown(4);

      // Divider
      doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor(primaryColor).lineWidth(2).stroke();
      doc.moveDown(1);

      // Products Section
      doc
        .fontSize(18)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('Products', { underline: true });

      doc.moveDown(1);

      (order.products || []).forEach((item) => {
        const productName = sanitizeText(item.name || item.productId?.name || 'N/A');
        const quantity = item.quantity || 1;
        const price = item.price || 0;

        doc
          .fontSize(12)
          .fillColor('black')
          .font('Helvetica')
          .list([`${productName} (x${quantity}) - ${formatINRCurrency(price)}`], {
            bulletRadius: 2
          });
      });

      doc.moveDown(2);

      // Divider before total
      doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor(accentColor).lineWidth(2).stroke();
      doc.moveDown(2);

      // Total Amount Section
      doc
        .fontSize(18)
        .fillColor('black')
        .font('Helvetica-Bold')
        .text(`Total Amount: ${formatINRCurrency(order.totalAmount || 0)}`, {
          align: 'right',
          characterSpacing: 1.5
        });

      // Footer
      doc.moveDown(5);
      doc
        .fontSize(10)
        .fillColor('gray')
        .font('Helvetica-Oblique')
        .text('Thank you for your purchase!', { align: 'center' });

      doc.end();

      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateInvoice;
