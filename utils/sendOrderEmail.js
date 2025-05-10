// const nodemailer = require("nodemailer");
// const generateInvoice = require("../utils/invoiceGenerator"); // adjust path if needed
// const path = require("path"); // For handling file paths
// const fs = require("fs");     // For reading the file to attach


// const sendOrderEmail = async (to, orderDetails) => {
//   try {
//     if (!to || !orderDetails) {
//       console.error("❌ Missing email or order details for sending email.");
//       return;
//     }

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     console.log("🧾 Products in email:", orderDetails.products);


//     const productRows = (orderDetails.products || [])
//       .map(
//         (item) => `
//         <tr>
//           <td style="padding: 8px; border: 1px solid #ddd;">${item.name || item.productId?.name || "N/A"}</td>
//           <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity || 1}</td>
//           <td style="padding: 8px; border: 1px solid #ddd;">₹${item.price || 0}</td>
//         </tr>
//       `
//       )
//       .join("");

      

//     const isUpdate = orderDetails.orderStatus && orderDetails.orderStatus !== "Pending";

//     const subject = isUpdate
//       ? `📦 Order Status Update – ${orderDetails.trackingNumber}`
//       : "🛍️ Your Order Was Successfully Placed!";

//         // ✅ Add your invoice download URL
//     const downloadLink = `http://localhost:5000/api/orders/invoice/${orderDetails.trackingNumber}`;

//     // Generate Invoice PDF
// const invoicePath = path.join(__dirname, `../invoices/${orderDetails.trackingNumber}.pdf`);
// await generateInvoice(orderDetails, invoicePath);


//     const mailOptions = {
//       from: `"LocalArtisans" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html: `
//         <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
//           <h2 style="color: #4CAF50;">${
//             isUpdate ? "Your order has been updated!" : "Thank you for your order!"
//           }</h2>
          
//           <p><strong>Tracking Number:</strong> ${orderDetails.trackingNumber}</p>
//           <p><strong>Status:</strong> ${orderDetails.orderStatus || "Pending"}</p>
          

//           <h3>Order Summary:</h3>
//           <table style="width: 100%; border-collapse: collapse;">
//             <thead>
//               <tr>
//                 <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Product</th>
//                 <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Qty</th>
//                 <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Price</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${productRows}
//             </tbody>
//           </table>

//           <p style="margin-top: 20px;"><strong>Total:</strong> ₹${orderDetails.totalAmount || 0}</p>
         
//           <p style="margin-top: 20px;">
//             <strong>Download your invoice:</strong><br/>
//             <a href="${downloadLink}" target="_blank" style="
//               padding: 10px 15px;
//               background-color: #007bff;
//               color: white;
//               text-decoration: none;
//               border-radius: 5px;
//               display: inline-block;
//               margin-top: 10px;
//             ">Download Invoice PDF</a>
//           </p>

//           <p style="margin-top: 30px;">Warm Regards, <br> LocalArtisans Team 🎨</p>
//         </div>
//       `,
//     };


//     console.log("📨 Sending email to:", to);
//     await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent successfully!");
//   } catch (error) {
//     console.error("❌ Failed to send order email:", error.message);
//   }
// };

// module.exports = sendOrderEmail;

const nodemailer = require("nodemailer");
const generateInvoice = require("../utils/invoiceGenerator"); // Adjust path if needed
const path = require("path"); // For handling file paths
const fs = require("fs");     // For reading the file to attach

const sendOrderEmail = async (to, orderDetails) => {
  try {
    if (!to || !orderDetails) {
      console.error("❌ Missing email or order details for sending email.");
      return;
    }

    // Create a transport object for nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("🧾 Products in email:", orderDetails.products);

    // Generate the order details HTML table
    const productRows = (orderDetails.products || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name || item.productId?.name || "N/A"}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity || 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₹${item.price || 0}</td>
        </tr>
      `
      )
      .join("");

    // Check if the order status is an update or new order
    const isUpdate = orderDetails.orderStatus && orderDetails.orderStatus !== "Pending";

    const subject = isUpdate
      ? `📦 Order Status Update – ${orderDetails.trackingNumber}`
      : "🛍️ Your Order Was Successfully Placed!";

    // ✅ Add your invoice download URL
    const downloadLink = `http://localhost:5000/api/orders/invoice/${orderDetails.trackingNumber}`;

    // Step 1: Generate Invoice PDF
    const invoicePath = path.join(__dirname, `../invoices/${orderDetails.trackingNumber}.pdf`);
    await generateInvoice(orderDetails, invoicePath);

    // Prepare email options with attachments (PDF Invoice)
    const mailOptions = {
      from: `"LocalArtisans" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
          <h2 style="color: #4CAF50;">${
            isUpdate ? "Your order has been updated!" : "Thank you for your order!"
          }</h2>
          
          <p><strong>Tracking Number:</strong> ${orderDetails.trackingNumber}</p>
          <p><strong>Status:</strong> ${orderDetails.orderStatus || "Pending"}</p>

          <h3>Order Summary:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Product</th>
                <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>

          <p style="margin-top: 20px;"><strong>Total:</strong> ₹${orderDetails.totalAmount || 0}</p>
         
         

          <p style="margin-top: 30px;">Warm Regards, <br> LocalArtisans Team 🎨</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${orderDetails.trackingNumber}.pdf`,
          path: invoicePath,
          contentType: 'application/pdf',
        }
      ]
    };

    console.log("📨 Sending email to:", to);
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");

    // Step 2: Clean up the invoice file after sending email
    fs.unlink(invoicePath, (err) => {
      if (err) {
        console.error("❌ Failed to delete invoice file:", err.message);
      } else {
        console.log(`🗑️ Invoice file deleted successfully: ${invoicePath}`);
      }
    });

  } catch (error) {
    console.error("❌ Failed to send order email:", error.message);
  }
};

module.exports = sendOrderEmail;
