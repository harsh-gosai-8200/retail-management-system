package com.rms.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.rms.model.Invoice;
import com.rms.model.Order;
import com.rms.model.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfServiceImpl implements PdfService {

    /**
     * generating invoice pdf for user order success
     * @param invoice
     * @param order
     * @return
     */
    public byte[] generateInvoicePdf(Invoice invoice, Order order) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8);

            // Title
            Paragraph title = new Paragraph("TAX INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Invoice Details Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(10);

            addCell(infoTable, "Invoice Number:", boldFont);
            addCell(infoTable, invoice.getInvoiceNumber(), normalFont);
            addCell(infoTable, "Invoice Date:", boldFont);
            addCell(infoTable, invoice.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")), normalFont);
            addCell(infoTable, "Order Number:", boldFont);
            addCell(infoTable, order.getOrderNumber(), normalFont);
            addCell(infoTable, "Order Date:", boldFont);
            addCell(infoTable, order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")), normalFont);
            if (order.getDeliveredAt() != null) {
                addCell(infoTable, "Delivery Date:", boldFont);
                addCell(infoTable, order.getDeliveredAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")), normalFont);
            }

            document.add(infoTable);
            document.add(Chunk.NEWLINE);

            // Seller Details
            Paragraph sellerTitle = new Paragraph("Seller Details", boldFont);
            document.add(sellerTitle);
            PdfPTable sellerTable = new PdfPTable(1);
            sellerTable.setWidthPercentage(100);
            addCell(sellerTable, order.getSeller().getShopName(), normalFont);
            addCell(sellerTable, order.getSeller().getUser().getUsername(), normalFont);
            addCell(sellerTable, order.getSeller().getAddress(), normalFont);
            addCell(sellerTable, "Phone: " + order.getSeller().getUser().getPhone(), normalFont);
            document.add(sellerTable);
            document.add(Chunk.NEWLINE);

            // Wholesaler Details
            Paragraph wholesalerTitle = new Paragraph("Wholesaler Details", boldFont);
            document.add(wholesalerTitle);
            PdfPTable wholesalerTable = new PdfPTable(1);
            wholesalerTable.setWidthPercentage(100);
            addCell(wholesalerTable, order.getWholesaler().getBusinessName(), normalFont);
            addCell(wholesalerTable, order.getWholesaler().getAddress(), normalFont);
            addCell(wholesalerTable, "GST: " + order.getWholesaler().getGstNumber(), normalFont);
            document.add(wholesalerTable);
            document.add(Chunk.NEWLINE);

            // Items Table
            PdfPTable itemsTable = new PdfPTable(5);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{30, 40, 10, 10, 10});

            addCell(itemsTable, "Product", boldFont, Element.ALIGN_CENTER);
            addCell(itemsTable, "Description", boldFont, Element.ALIGN_CENTER);
            addCell(itemsTable, "Qty", boldFont, Element.ALIGN_CENTER);
            addCell(itemsTable, "Price", boldFont, Element.ALIGN_RIGHT);
            addCell(itemsTable, "Total", boldFont, Element.ALIGN_RIGHT);

            for (OrderItem item : order.getItems()) {
                addCell(itemsTable, item.getProductName(), normalFont);
                addCell(itemsTable, item.getProduct().getDescription() != null ? item.getProduct().getDescription() : "-", normalFont);
                addCell(itemsTable, String.valueOf(item.getQuantity()), normalFont, Element.ALIGN_CENTER);
                addCell(itemsTable, String.format("₹%.2f", item.getPrice()), normalFont, Element.ALIGN_RIGHT);
                addCell(itemsTable, String.format("₹%.2f", item.getTotal()), normalFont, Element.ALIGN_RIGHT);
            }

            document.add(itemsTable);
            document.add(Chunk.NEWLINE);

            // Totals
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(50);
            totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

            addCell(totalTable, "Subtotal:", boldFont, Element.ALIGN_RIGHT);
            addCell(totalTable, String.format("₹%.2f", order.getSubtotal()), normalFont, Element.ALIGN_RIGHT);
            addCell(totalTable, "Tax (5%):", boldFont, Element.ALIGN_RIGHT);
            addCell(totalTable, String.format("₹%.2f", order.getTaxAmount()), normalFont, Element.ALIGN_RIGHT);
            addCell(totalTable, "Total:", boldFont, Element.ALIGN_RIGHT);
            addCell(totalTable, String.format("₹%.2f", order.getTotalAmount()), boldFont, Element.ALIGN_RIGHT);

            document.add(totalTable);
            document.add(Chunk.NEWLINE);

            // Footer
            Paragraph footer = new Paragraph("Thank you for your business!", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            Paragraph terms = new Paragraph("This is a computer generated invoice. No signature required.", smallFont);
            terms.setAlignment(Element.ALIGN_CENTER);
            document.add(terms);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Error generating PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to generate invoice PDF", e);
        }
    }

    /**
     * helper method for invoice generation
     * @param table
     * @param content
     * @param font
     */
    private void addCell(PdfPTable table, String content, Font font) {
        addCell(table, content, font, Element.ALIGN_LEFT);
    }

    /**
     * helper method for invoice generation function
     * @param table
     * @param content
     * @param font
     * @param alignment
     */
    private void addCell(PdfPTable table, String content, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setPadding(5);
        cell.setBorderColor(BaseColor.LIGHT_GRAY);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }
}