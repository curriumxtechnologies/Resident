import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an OTP email
 * @param {string} to - recipient email
 * @param {string} otp - 6-digit code
 */
export const sendOTPEmail = async (to, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #333;">Your verification code</h2>
      <p>Please use the following OTP to complete your authentication on RezidentHomes:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</span>
      </div>
      <p style="color: #666;">This code will expire in 10 minutes.</p>
      <p style="color: #999;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "RezidentHomes <noreply@rezidenthomes.com>",
      to,
      subject: "Your RezidentHomes Verification Code",
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
 * @param {string} sellerEmail - seller's email address
 * @param {object} inquiryData - inquiry details
 */
export const sendSaleInquiryEmail = async (sellerEmail, inquiryData) => {
  const { buyerName, buyerEmail, buyerPhone, message, propertyTitle, propertyPrice, propertyLocation } = inquiryData;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9fc; padding: 30px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 25px;">
        <img src="https://www.rezidenthomes.com/images/icon.png" alt="Rezident Homes" style="width: 60px; height: 60px; margin-bottom: 15px;" />
        <h1 style="color: #001c4a; margin: 0;">🏠 New Purchase Inquiry</h1>
        <p style="color: #666; margin-top: 8px;">A potential buyer is interested in your property for sale on Rezident Homes</p>
      </div>
      
      <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #001c4a;">
        <h3 style="color: #001c4a; margin-top: 0;">Property for Sale</h3>
        <p style="margin: 5px 0;"><strong>Title:</strong> ${propertyTitle}</p>
        <p style="margin: 5px 0;"><strong>Asking Price:</strong> ₦${Number(propertyPrice).toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${propertyLocation}</p>
      </div>
      
      <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="color: #001c4a; margin-top: 0;">Potential Buyer Details</h3>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${buyerName}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${buyerEmail}" style="color: #001c4a;">${buyerEmail}</a></p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${buyerPhone}" style="color: #001c4a;">${buyerPhone}</a></p>
        ${message ? `<div style="background: #f3f3f6; padding: 15px; border-radius: 8px; margin-top: 10px;"><strong>Message from Buyer:</strong><br/>${message}</div>` : ""}
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <p style="color: #001c4a; font-weight: bold;">📞 Reach out to the buyer quickly to close the deal!</p>
      </div>
      
      <p style="color: #999; text-align: center; margin-top: 20px; font-size: 12px;">
        This inquiry was sent via <strong>Rezident Homes</strong>. Manage your listings at <a href="https://www.rezidenthomes.com" style="color: #c5aa23;">rezidenthomes.com</a>
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "RezidentHomes <sales@rezidenthomes.com>",
      to: sellerEmail,
      subject: `🏠 New Purchase Inquiry: ${propertyTitle}`,
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
 * @param {string} sellerEmail - seller's email address
 * @param {object} inquiryData - inquiry details
 */
export const sendRentInquiryEmail = async (sellerEmail, inquiryData) => {
  const { buyerName, buyerEmail, buyerPhone, message, propertyTitle, propertyPrice, propertyLocation } = inquiryData;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9fc; padding: 30px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 25px;">
        <img src="https://www.rezidenthomes.com/images/icon.png" alt="Rezident Homes" style="width: 60px; height: 60px; margin-bottom: 15px;" />
        <h1 style="color: #001c4a; margin: 0;">🔑 New Rental Inquiry</h1>
        <p style="color: #666; margin-top: 8px;">A potential tenant is interested in your rental property on Rezident Homes</p>
      </div>
      
      <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #c5aa23;">
        <h3 style="color: #001c4a; margin-top: 0;">Rental Property</h3>
        <p style="margin: 5px 0;"><strong>Title:</strong> ${propertyTitle}</p>
        <p style="margin: 5px 0;"><strong>Annual Rent:</strong> ₦${Number(propertyPrice).toLocaleString()}/year</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${propertyLocation}</p>
      </div>
      
      <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="color: #001c4a; margin-top: 0;">Potential Tenant Details</h3>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${buyerName}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${buyerEmail}" style="color: #001c4a;">${buyerEmail}</a></p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${buyerPhone}" style="color: #001c4a;">${buyerPhone}</a></p>
        ${message ? `<div style="background: #f3f3f6; padding: 15px; border-radius: 8px; margin-top: 10px;"><strong>Message from Tenant:</strong><br/>${message}</div>` : ""}
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <p style="color: #001c4a; font-weight: bold;">📞 Reach out to the tenant quickly to secure the lease!</p>
      </div>
      
      <p style="color: #999; text-align: center; margin-top: 20px; font-size: 12px;">
        This inquiry was sent via <strong>Rezident Homes</strong>. Manage your listings at <a href="https://www.rezidenthomes.com" style="color: #c5aa23;">rezidenthomes.com</a>
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "RezidentHomes <rentals@rezidenthomes.com>",
      to: sellerEmail,
      subject: `🔑 New Rental Inquiry: ${propertyTitle}`,
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