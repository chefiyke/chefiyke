import LegalTypes "../types/legal";
import RolesTypes "../types/roles";
import RolesLib "roles";
import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  // ── Pre-seeded default content ────────────────────────────────────────────────

  let DEFAULT_TERMS : LegalTypes.LegalContent = {
    id = "terms";
    title = "Terms & Conditions";
    lastUpdated = 0;
    content = "TERMS & CONDITIONS\n\nLast Updated: See lastUpdated timestamp.\n\n1. ACCEPTANCE OF TERMS\n\nBy accessing or using this platform, you agree to be bound by these Terms & Conditions. If you do not agree to all terms, you must not use this platform.\n\n2. PLATFORM ACCESS\n\n2.1 The platform grants you a limited, revocable, non-exclusive licence to access and use the service for lawful purposes only.\n2.2 Access may be suspended or terminated at any time at the sole discretion of the platform owner.\n2.3 You may not share, sell, or transfer your access credentials to any third party.\n\n3. USER RESPONSIBILITIES\n\n3.1 You are solely responsible for all activities conducted under your account.\n3.2 You must provide accurate, complete, and current information at all times.\n3.3 You must not use the platform to engage in fraudulent, abusive, or illegal activity.\n3.4 You must not attempt to reverse-engineer, copy, scrape, or replicate any part of this platform.\n3.5 You must not use automated tools, bots, or scripts to interact with this platform without express written permission.\n\n4. INTELLECTUAL PROPERTY\n\n4.1 All content, systems, structures, designs, code, and methodologies on this platform are the exclusive intellectual property of the platform owner.\n4.2 Users retain ownership of content they upload but grant the platform a non-exclusive licence to use, store, and display such content as necessary to provide the service.\n4.3 No part of this platform may be reproduced, distributed, or commercially exploited without written authorisation.\n\n5. PAYMENTS & SUBSCRIPTIONS\n\n5.1 Access to paid features requires confirmed payment prior to use.\n5.2 All prices are stated in the applicable currency and are subject to change without notice.\n5.3 Payment disputes must be raised within 7 days of the charge.\n5.4 Refunds are subject to the Refund Policy.\n\n6. LIMITATION OF LIABILITY\n\n6.1 The platform is provided on an 'as is' and 'as available' basis without warranties of any kind.\n6.2 The platform owner shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.\n6.3 Total aggregate liability shall not exceed the amount paid by you in the 30 days preceding the claim.\n\n7. NO PROFESSIONAL ADVICE\n\n7.1 Nothing on this platform constitutes legal, financial, medical, or professional advice of any kind.\n7.2 You should seek qualified independent professional advice before making decisions based on any content provided here.\n\n8. MODIFICATIONS\n\nThe platform owner reserves the right to modify these Terms at any time. Continued use of the platform after modifications constitutes acceptance of the updated Terms.\n\n9. GOVERNING LAW\n\nThese Terms are governed by applicable law. Disputes shall be resolved through negotiation and, where necessary, binding arbitration.\n\n10. CONTACT\n\nFor questions regarding these Terms, contact the platform owner through the official contact channels.";
  };

  let DEFAULT_PRIVACY : LegalTypes.LegalContent = {
    id = "privacy";
    title = "Privacy Policy";
    lastUpdated = 0;
    content = "PRIVACY POLICY\n\nLast Updated: See lastUpdated timestamp.\n\n1. INTRODUCTION\n\nThis Privacy Policy explains how we collect, use, store, and protect your personal information when you use this platform.\n\n2. DATA WE COLLECT\n\n2.1 Identity data: name, email address, phone number.\n2.2 Usage data: pages visited, features used, timestamps, device type, browser.\n2.3 Transaction data: payment references, order history, subscription status.\n2.4 Communications: messages sent through contact forms or support channels.\n2.5 Technical data: IP address, session tokens (not stored permanently), error logs.\n\n3. HOW WE USE YOUR DATA\n\n3.1 To provide, operate, and improve the platform.\n3.2 To process payments and manage your account.\n3.3 To send service-related communications (not marketing without consent).\n3.4 To detect and prevent fraud, abuse, and security incidents.\n3.5 To comply with legal obligations.\n\n4. DATA STORAGE & PROTECTION\n\n4.1 Your data is stored on secure, decentralised infrastructure.\n4.2 Access to personal data is restricted to authorised personnel only.\n4.3 We apply encryption, access controls, and audit logging to protect your data.\n4.4 We do not sell your personal data to third parties.\n\n5. DATA SHARING\n\n5.1 We may share data with payment processors (e.g. Paystack, Flutterwave) solely to process transactions.\n5.2 We may share data when required by law or to protect legal rights.\n5.3 We do not share data for advertising or marketing purposes without your explicit consent.\n\n6. YOUR RIGHTS\n\n6.1 You may request access to the personal data we hold about you.\n6.2 You may request correction of inaccurate data.\n6.3 You may request deletion of your data, subject to legal retention requirements.\n6.4 To exercise these rights, contact us through official channels.\n\n7. COOKIES & TRACKING\n\n7.1 This platform may use session cookies necessary for operation. No third-party advertising cookies are used.\n7.2 You can disable cookies in your browser settings, though this may affect functionality.\n\n8. RETENTION\n\nWe retain personal data for as long as your account is active and as required by applicable law. Transaction records are retained for a minimum of 5 years for compliance purposes.\n\n9. CHILDREN\n\nThis platform is not intended for persons under the age of 18. We do not knowingly collect data from minors.\n\n10. UPDATES\n\nThis policy may be updated periodically. Continued use of the platform after updates constitutes acceptance.\n\n11. CONTACT\n\nFor privacy-related enquiries, contact the platform owner through the official contact channels.";
  };

  let DEFAULT_DISCLAIMER : LegalTypes.LegalContent = {
    id = "disclaimer";
    title = "Disclaimer";
    lastUpdated = 0;
    content = "DISCLAIMER\n\nLast Updated: See lastUpdated timestamp.\n\n1. GENERAL DISCLAIMER\n\nThe information, content, tools, and services provided on this platform are for general informational and educational purposes only. Nothing on this platform constitutes professional, legal, financial, medical, or investment advice.\n\n2. NO PROFESSIONAL ADVICE\n\n2.1 All content is provided strictly for informational purposes.\n2.2 You should not act or refrain from acting based on any content on this platform without first seeking qualified, independent professional advice relevant to your specific circumstances.\n2.3 The platform owner does not hold itself out as a licensed legal adviser, financial adviser, medical practitioner, or any other regulated professional.\n\n3. NO GUARANTEE OF RESULTS\n\n3.1 Business, financial, and personal outcomes vary based on individual effort, market conditions, and many factors beyond our control.\n3.2 Any case studies, testimonials, or examples of results are illustrative only and do not guarantee that you will achieve similar outcomes.\n3.3 Past results do not guarantee future performance.\n\n4. LIMITATION OF LIABILITY\n\n4.1 The platform owner expressly disclaims all liability for any loss, damage, or expense arising directly or indirectly from your use of or reliance on any content, tools, or services on this platform.\n4.2 This includes but is not limited to: financial loss, loss of business opportunity, data loss, or consequential damages of any nature.\n4.3 Our total liability to you under any circumstances shall not exceed the amount you have paid to us in the 30 days prior to the claim.\n\n5. THIRD-PARTY CONTENT & LINKS\n\n5.1 This platform may contain links to third-party websites or services. We are not responsible for the content, privacy practices, or accuracy of any third-party resource.\n5.2 Inclusion of any link does not constitute endorsement.\n\n6. SYSTEM AVAILABILITY\n\n6.1 We do not guarantee uninterrupted or error-free operation of the platform.\n6.2 We reserve the right to suspend or discontinue the platform at any time without notice.\n\n7. ACCURACY OF INFORMATION\n\nWhile we strive to keep information accurate and current, we make no representations about the completeness, accuracy, or suitability of any content. Information may be outdated and should be verified independently.\n\n8. ACCEPTANCE\n\nBy using this platform, you acknowledge that you have read, understood, and accepted this Disclaimer in full.";
  };

  let DEFAULT_REFUND : LegalTypes.LegalContent = {
    id = "refund";
    title = "Refund Policy";
    lastUpdated = 0;
    content = "REFUND POLICY\n\nLast Updated: See lastUpdated timestamp.\n\n1. OVERVIEW\n\nThis Refund Policy governs all purchases and payments made through this platform. By completing a purchase, you agree to the terms set out below.\n\n2. DIGITAL PRODUCTS & SERVICES\n\n2.1 Due to the nature of digital products and services, all sales are final once access has been granted or work has commenced.\n2.2 Refunds will not be issued for digital downloads, course access, consultation sessions already delivered, or system builds that have been initiated.\n\n3. ELIGIBILITY FOR REFUND\n\nA refund may be considered under the following limited circumstances:\n\n3.1 A payment was charged in error or duplicated due to a technical fault.\n3.2 Service was not delivered within a reasonable agreed timeframe and no alternative was offered.\n3.3 The delivered service materially differs from what was explicitly agreed in writing prior to purchase.\n\n4. NON-REFUNDABLE ITEMS\n\nThe following are strictly non-refundable:\n\n4.1 Completed consultation or strategy sessions.\n4.2 Partially completed or completed system builds.\n4.3 Digital content, templates, or resources that have been accessed or downloaded.\n4.4 Subscription fees for periods already used.\n4.5 Any service where a change of mind is the stated reason.\n\n5. REFUND REQUEST PROCESS\n\n5.1 Refund requests must be submitted within 7 days of the charge or service delivery date.\n5.2 Requests must be submitted through official contact channels with the original order reference.\n5.3 All requests are reviewed at the sole discretion of the platform owner.\n5.4 Decisions are communicated within 5 business days of receiving a complete request.\n\n6. PAYMENT METHOD\n\n6.1 Approved refunds will be processed to the original payment method where technically possible.\n6.2 Processing time may take 5–14 business days depending on the payment provider.\n6.3 We are not responsible for delays caused by payment providers or banks.\n\n7. CHARGEBACKS\n\n7.1 Initiating a chargeback without first contacting us to resolve the issue may result in immediate suspension of your account and permanent ban from the platform.\n7.2 We reserve the right to contest any chargeback we deem unjustified.\n\n8. CHANGES TO THIS POLICY\n\nWe reserve the right to update this Refund Policy at any time. The current version will always be available on the platform.\n\n9. CONTACT\n\nFor refund-related enquiries, contact the platform owner through the official contact channels with your order details.";
  };

  // ── Seed defaults into an empty map ──────────────────────────────────────────

  public func seedDefaultsIfEmpty(
    legalContent : Map.Map<Text, LegalTypes.LegalContent>
  ) {
    if (legalContent.isEmpty()) {
      let now = Time.now();
      legalContent.add("terms", { DEFAULT_TERMS with lastUpdated = now });
      legalContent.add("privacy", { DEFAULT_PRIVACY with lastUpdated = now });
      legalContent.add("disclaimer", { DEFAULT_DISCLAIMER with lastUpdated = now });
      legalContent.add("refund", { DEFAULT_REFUND with lastUpdated = now });
    }
  };

  // ── Getters ───────────────────────────────────────────────────────────────────

  public func getLegalContent(
    legalContent : Map.Map<Text, LegalTypes.LegalContent>,
    id : Text,
  ) : ?LegalTypes.LegalContent {
    legalContent.get(id)
  };

  public func getAllLegalContent(
    legalContent : Map.Map<Text, LegalTypes.LegalContent>,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    caller : Principal,
  ) : [LegalTypes.LegalContent] {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    legalContent.values().toArray()
  };

  // ── Setter (admin only) ───────────────────────────────────────────────────────

  public func adminSetLegalContent(
    legalContent : Map.Map<Text, LegalTypes.LegalContent>,
    roleUsers : Map.Map<Principal, RolesTypes.StaffUser>,
    caller : Principal,
    id : Text,
    title : Text,
    content : Text,
  ) : { #ok : (); #err : Text } {
    RolesLib.requirePermission(roleUsers, caller, #CanEditContent);
    let validIds = ["terms", "privacy", "disclaimer", "refund"];
    let isValid = validIds.find(func(v : Text) : Bool { v == id }) != null;
    if (not isValid) {
      return #err("Invalid legal content id. Must be one of: terms, privacy, disclaimer, refund")
    };
    if (title.size() == 0) {
      return #err("Title cannot be empty")
    };
    if (content.size() == 0) {
      return #err("Content cannot be empty")
    };
    legalContent.add(id, { id; title; content; lastUpdated = Time.now() });
    #ok(())
  };
};
