import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an OTP email
 */
export const sendOTPEmail = async (to, otp) => {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 440px; margin: 40px auto; background: #fff; padding: 40px 32px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
      <p style="color: #1a1c1e; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Verification code</p>
      <p style="color: #747781; font-size: 14px; margin: 0 0 24px;">Enter this code to complete your sign in.</p>
      <div style="background: #f3f3f6; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 24px;">
        <span style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #001c4a;">${otp}</span>
      </div>
      <p style="color: #999; font-size: 12px; margin: 0;">Code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "RezidentHomes <noreply@rezidenthomes.com>",
      to,
      subject: "Your verification code",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send email");
    }

    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Send inquiry email to seller - FOR SALE properties
 */
export const sendSaleInquiryEmail = async (sellerEmail, inquiryData) => {
  const { buyerName, buyerEmail, buyerPhone, message, propertyTitle, propertyPrice, propertyLocation } = inquiryData;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
      <div style="background: #001c4a; padding: 20px 28px;">
        <p style="color: #fff; font-size: 16px; font-weight: 600; margin: 0;">New Purchase Inquiry</p>
      </div>
      <div style="padding: 28px;">
        <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
          <p style="color: #1a1c1e; font-size: 14px; font-weight: 600; margin: 0 0 12px;">${propertyTitle}</p>
          <p style="color: #001c4a; font-size: 18px; font-weight: 700; margin: 0 0 4px;">₦${Number(propertyPrice).toLocaleString()}</p>
          <p style="color: #747781; font-size: 13px; margin: 0;">${propertyLocation}</p>
        </div>
        <p style="color: #1a1c1e; font-size: 13px; font-weight: 600; margin: 0 0 12px;">Buyer details</p>
        <p style="color: #1a1c1e; font-size: 14px; margin: 0 0 4px;">${buyerName}</p>
        <p style="margin: 0 0 4px;"><a href="mailto:${buyerEmail}" style="color: #001c4a; font-size: 14px;">${buyerEmail}</a></p>
        <p style="margin: 0;"><a href="tel:${buyerPhone}" style="color: #001c4a; font-size: 14px;">${buyerPhone}</a></p>
        ${message ? `<div style="background: #f9f9fc; padding: 12px; border-radius: 6px; margin-top: 12px;"><p style="color: #747781; font-size: 13px; margin: 0;">${message}</p></div>` : ""}
      </div>
      <div style="background: #f9f9fc; padding: 12px 28px; text-align: center;">
        <p style="color: #999; font-size: 11px; margin: 0;">Rezident Homes · <a href="https://www.rezidenthomes.com" style="color: #c5aa23;">rezidenthomes.com</a></p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "RezidentHomes <sales@rezidenthomes.com>",
      to: sellerEmail,
      subject: `New inquiry: ${propertyTitle}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send inquiry email");
    }

    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Send inquiry email to seller - FOR RENT properties
 */
export const sendRentInquiryEmail = async (sellerEmail, inquiryData) => {
  const { buyerName, buyerEmail, buyerPhone, message, propertyTitle, propertyPrice, propertyLocation } = inquiryData;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
      <div style="background: #001c4a; padding: 20px 28px;">
        <p style="color: #fff; font-size: 16px; font-weight: 600; margin: 0;">New Rental Inquiry</p>
      </div>
      <div style="padding: 28px;">
        <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
          <p style="color: #1a1c1e; font-size: 14px; font-weight: 600; margin: 0 0 12px;">${propertyTitle}</p>
          <p style="color: #001c4a; font-size: 18px; font-weight: 700; margin: 0 0 4px;">₦${Number(propertyPrice).toLocaleString()}<span style="font-size:13px;font-weight:400;color:#747781;">/year</span></p>
          <p style="color: #747781; font-size: 13px; margin: 0;">${propertyLocation}</p>
        </div>
        <p style="color: #1a1c1e; font-size: 13px; font-weight: 600; margin: 0 0 12px;">Tenant details</p>
        <p style="color: #1a1c1e; font-size: 14px; margin: 0 0 4px;">${buyerName}</p>
        <p style="margin: 0 0 4px;"><a href="mailto:${buyerEmail}" style="color: #001c4a; font-size: 14px;">${buyerEmail}</a></p>
        <p style="margin: 0;"><a href="tel:${buyerPhone}" style="color: #001c4a; font-size: 14px;">${buyerPhone}</a></p>
        ${message ? `<div style="background: #f9f9fc; padding: 12px; border-radius: 6px; margin-top: 12px;"><p style="color: #747781; font-size: 13px; margin: 0;">${message}</p></div>` : ""}
      </div>
      <div style="background: #f9f9fc; padding: 12px 28px; text-align: center;">
        <p style="color: #999; font-size: 11px; margin: 0;">Rezident Homes · <a href="https://www.rezidenthomes.com" style="color: #c5aa23;">rezidenthomes.com</a></p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "RezidentHomes <rentals@rezidenthomes.com>",
      to: sellerEmail,
      subject: `New inquiry: ${propertyTitle}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send inquiry email");
    }

    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Send payment receipt email to buyer
 */
export const sendReceiptEmail = async (email, receiptData) => {
  const {
    receiptNumber,
    buyerName,
    propertyTitle,
    propertyLocation,
    amountPaid,
    paymentPlan,
    remainingBalance,
    fullPrice,
    date,
  } = receiptData;

  const remainingText = remainingBalance > 0 
    ? `<p style="color: #e53e3e; font-weight: bold;">Remaining Balance: ₦${remainingBalance.toLocaleString()} (${Math.round((remainingBalance / fullPrice) * 100)}% remaining)</p>`
    : `<p style="color: #38a169; font-weight: bold;">FULL PAYMENT MADE</p>`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
      <div style="background: #001c4a; padding: 24px 28px; text-align: center;">
        <h1 style="color: #fff; font-size: 20px; margin: 0;">REZIDENT HOMES</h1>
        <p style="color: #c5aa23; font-size: 12px; margin: 4px 0 0;">Payment Receipt</p>
      </div>
      <div style="padding: 28px;">
        <div style="background: #f9f9fc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 4px;"><strong>Receipt No:</strong> ${receiptNumber}</p>
          <p style="margin: 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #001c4a; font-size: 14px; margin: 0 0 8px;">Buyer Information</h3>
          <p style="margin: 0;"><strong>Name:</strong> ${buyerName}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #001c4a; font-size: 14px; margin: 0 0 8px;">Property Details</h3>
          <p style="margin: 0 0 4px;"><strong>Property:</strong> ${propertyTitle}</p>
          <p style="margin: 0;"><strong>Location:</strong> ${propertyLocation}</p>
        </div>
        
        <div style="background: #f9f9fc; padding: 16px; border-radius: 8px;">
          <h3 style="color: #001c4a; font-size: 14px; margin: 0 0 8px;">Payment Summary</h3>
          <p style="margin: 0 0 4px;"><strong>Payment Plan:</strong> ${paymentPlan}</p>
          <p style="margin: 0 0 4px;"><strong>Full Price:</strong> ₦${fullPrice.toLocaleString()}</p>
          <p style="margin: 0 0 4px;"><strong>Amount Paid:</strong> ₦${amountPaid.toLocaleString()}</p>
          ${remainingText}
        </div>
      </div>
      <div style="background: #f9f9fc; padding: 16px 28px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 11px; margin: 0;">This is a computer-generated receipt.</p>
        <p style="color: #999; font-size: 11px; margin: 4px 0 0;">For inquiries: support@rezidenthomes.com | +234 800 000 0000</p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "RezidentHomes <receipts@rezidenthomes.com>",
      to: email,
      subject: `Payment Receipt - ${propertyTitle} - ${receiptNumber}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send receipt email");
    }

    return data;
  } catch (err) {
    throw err;
  }
};