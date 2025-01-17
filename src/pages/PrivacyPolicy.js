import React from 'react';
import './TermsAndConditions.css';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "1. WHAT INFORMATION DO WE COLLECT?",
      content: `Personal information you disclose to us
In Short: We collect personal information that you provide to us.

We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.

Personal Information Provided by You. The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
• Names
• Phone numbers
• Email addresses
• Passwords
• Billing addresses
• Profile picture

Sensitive Information. We do not process sensitive information.

All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.`
    },
    {
      title: "2. HOW DO WE PROCESS YOUR INFORMATION?",
      content: `In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.

We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
• To facilitate account creation and authentication and otherwise manage user accounts
• To enable user-to-user communications
• To administer prize draws and competitions`
    },
    {
      title: "3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?",
      content: `In Short: We may share information in specific situations described in this section and/or with specific third parties.

We may need to share your personal information in the following situations:
• Business Transfers. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
• Other Users. When you share personal information or otherwise interact with public areas of the Services, such personal information may be viewed by all users and may be publicly made available outside the Services in perpetuity.`
    },
    {
      title: "4. HOW LONG DO WE KEEP YOUR INFORMATION?",
      content: `In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.

We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).

When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.`
    },
    {
      title: "5. HOW DO WE KEEP YOUR INFORMATION SAFE?",
      content: `In Short: We aim to protect your personal information through a system of organizational and technical security measures.

We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.`
    }
  ];

  return (
    <div className="legal-container">
      <div className="legal-content">
        <header className="legal-header">
          <h1>PRIVACY POLICY</h1>
          <p>Last updated January 16, 2025</p>
        </header>

        <div className="legal-nav">
          <h2>Quick Navigation</h2>
          <div className="legal-nav-links">
            {sections.map((section, index) => (
              <a
                key={index}
                href={`#section-${index}`}
                className="legal-nav-link"
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>

        {sections.map((section, index) => (
          <section 
            key={index}
            id={`section-${index}`}
            className="legal-section"
          >
            <h2>{section.title}</h2>
            <div className="legal-section-content">
              {section.content}
            </div>
          </section>
        ))}

        <div className="contact-info">
          <h2>Contact Us</h2>
          <p>If you have questions or comments about this notice, you may email us at:</p>
          <p><a href="mailto:privacy@mensrich.com">privacy@mensrich.com</a></p>
          <p>Or contact us by post at:</p>
          <p>Men's Rich LLC</p>
          <p>Bni Malek Villa 91</p>
          <p>Skikda, Skikda 21000</p>
          <p>Algeria</p>
        </div>
        </div>
      </div>
  );
};

export default PrivacyPolicy;