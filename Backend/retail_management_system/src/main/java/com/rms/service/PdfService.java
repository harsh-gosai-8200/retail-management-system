package com.rms.service;

import com.rms.model.Invoice;
import com.rms.model.Order;

public interface PdfService {

    byte[] generateInvoicePdf(Invoice invoice, Order order);


}
