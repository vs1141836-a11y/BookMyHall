import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generates a neat PDF invoice for a completed payment.
 * Returns a Promise that resolves with the physical filePath once the write stream is finalized.
 */
export const generateInvoicePDF = (booking, payment, customer, hall) => {
  return new Promise((resolve, reject) => {
    try {
      const invoicesDir = './public/invoices';
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `invoice-${payment._id}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      const writeStream = fs.createWriteStream(filePath);

      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(writeStream);

      // --- Header / Brand Logo ---
      doc.fillColor('#000000')
         .fontSize(22)
         .text('BOOKMYHALL', 50, 50, { bold: true })
         .fontSize(10)
         .fillColor('#666666')
         .text('Multi-Venue Event Booking & Management', 50, 75);

      doc.fillColor('#333333')
         .fontSize(14)
         .text('INVOICE', 450, 50, { align: 'right' })
         .fontSize(10)
         .text(`Invoice ID: ${payment._id.toString().slice(-8).toUpperCase()}`, 450, 70, { align: 'right' })
         .text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`, 450, 85, { align: 'right' });

      // Horizontal separator line
      doc.moveTo(50, 110).lineTo(550, 110).stroke('#E5E7EB');

      // --- Billing Details ---
      doc.fillColor('#111111')
         .fontSize(11)
         .text('Billed To:', 50, 130, { underline: true })
         .fillColor('#4B5563')
         .text(`Name: ${customer.name}`)
         .text(`Email: ${customer.email}`)
         .text(`Phone: ${customer.phone}`);

      doc.fillColor('#111111')
         .text('Venue & Booking Details:', 300, 130, { underline: true })
         .fillColor('#4B5563')
         .text(`Hall: ${hall.name}`)
         .text(`Location: ${hall.area}, ${hall.city}`)
         .text(`Event Date: ${new Date(booking.eventDate).toLocaleDateString()}`)
         .text(`Event Type: ${booking.eventType}`);

      doc.moveTo(50, 195).lineTo(550, 195).stroke('#E5E7EB');

      // --- Table Headers ---
      let y = 215;
      doc.fillColor('#111111')
         .fontSize(11)
         .text('Item Description', 50, y, { bold: true })
         .text('Category', 280, y, { bold: true })
         .text('Qty', 380, y, { bold: true, align: 'center' })
         .text('Price (INR)', 450, y, { bold: true, align: 'right' });

      doc.moveTo(50, 230).lineTo(550, 230).stroke('#F3F4F6');

      // --- Booking items mapping ---
      y = 240;
      // 1. Hall base rent
      doc.fillColor('#4B5563')
         .fontSize(10)
         .text(`${hall.name} - Rent (Base)`, 50, y)
         .text('Venue Base', 280, y)
         .text('1', 380, y, { align: 'center' })
         .text(`₹${booking.baseHallPrice.toLocaleString()}`, 450, y, { align: 'right' });
      
      y += 20;

      // 2. Customized Services
      booking.selectedServices.forEach((service) => {
        doc.text(service.name, 50, y)
           .text(service.category, 280, y)
           .text(service.quantity.toString(), 380, y, { align: 'center' })
           .text(`₹${(service.price * service.quantity).toLocaleString()}`, 450, y, { align: 'right' });
        y += 20;
      });

      doc.moveTo(50, y).lineTo(550, y).stroke('#E5E7EB');
      y += 15;

      // --- Totals ---
      doc.fillColor('#111111')
         .text('Grand Total:', 350, y, { bold: true })
         .text(`₹${booking.grandTotalPrice.toLocaleString()}`, 450, y, { align: 'right', bold: true });
      y += 20;

      doc.text('Payment Made:', 350, y, { bold: true })
         .text(`₹${payment.amount.toLocaleString()}`, 450, y, { align: 'right', bold: true });
      y += 20;

      doc.text('Transaction Type:', 350, y)
         .text(`${payment.paymentType} Payment`, 450, y, { align: 'right' });
      y += 20;

      doc.text('Transaction Status:', 350, y, { bold: true })
         .fillColor('#10B981')
         .text(payment.status.toUpperCase(), 450, y, { align: 'right', bold: true });

      // Footer
      doc.fillColor('#9CA3AF')
         .fontSize(8)
         .text('Thank you for booking with BookMyHall. For support, reach out to help@bookmyhall.com', 50, 700, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
