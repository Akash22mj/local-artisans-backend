const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");

const generateInvoice = (order, filePath) => {
  const doc = new PDFDocument();

  // Pipe to the file path
  doc.pipe(fs.createWriteStream(filePath));

  // Header
  doc
    .fontSize(20)
    .text("🧾 Handmade Haven - Invoice", { align: "center" })
    .moveDown();

  // Order Info
  doc
    .fontSize(12)
    .text(`Order ID: ${order._id}`)
    .text(`Tracking Number: ${order.trackingNumber}`)
    .text(`Order Date: ${order.createdAt.toDateString()}`)
    .moveDown();

  // Shipping Info
  doc
    .fontSize(14)
    .text("Shipping Details", { underline: true })
    .moveDown(0.5)
    .fontSize(12)
    .text(`Name: ${order.shippingInfo.name}`)
    .text(`Email: ${order.shippingInfo.email}`)
    .text(`Phone: ${order.shippingInfo.phone}`)
    .text(`Address: ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state} - ${order.shippingInfo.zip}`)
    .moveDown();

  // Product Details
  doc
    .fontSize(14)
    .text("Order Items", { underline: true })
    .moveDown(0.5);

  order.products.forEach((item, index) => {
    doc
      .fontSize(12)
      .text(`${index + 1}. ${item.name} (Qty: ${item.quantity}) - ₹${item.price}`);
  });

  doc.moveDown();

  // Total
  doc
    .fontSize(14)
    .text(`Total Amount: ₹${order.totalAmount}`)
    .text(`Payment Status: ${order.paymentStatus}`)
    .text(`Order Status: ${order.orderStatus}`)
    .moveDown();

  doc.text("Thank you for shopping with Handmade Haven!", { align: "center" });

  // End PDF
  doc.end();
};

module.exports = generateInvoice;
