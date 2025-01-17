import React from 'react';

const TermsAndConditions = () => {
  const sections = [
    {
      title: "1. AGREEMENT TO TERMS",
      content: `These Terms and Conditions constitute a legally binding agreement made between you and Men's Rich LLC ("we," "us," or "our"), concerning your access to and use of our services.

You agree that by accessing our services, you have read, understood, and agreed to be bound by all of these Terms and Conditions. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS AND CONDITIONS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.`
    },
    {
      title: "2. MEMBERSHIP REQUIREMENTS",
      content: `2.1. Age Requirement
You must be at least 18 years old to access or use our Services.

2.2. Account Registration
To access certain features of our Services, you must register for an account. You agree to:
• Provide accurate, current, and complete information
• Maintain and promptly update your account information
• Maintain the security of your account
• Accept responsibility for all activities that occur under your account
• Notify us immediately of any unauthorized use of your account

2.3. Account Termination
We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.`
    },
    {
      title: "3. COMMISSION STRUCTURE",
      content: `3.1. Earning Commissions
Members can earn commissions through:
• Direct referrals
• Team building bonuses
• Leadership bonuses

3.2. Payment Terms
• Minimum payout threshold: $50
• Payments are processed within 7 business days
• All commissions are subject to verification
• We reserve the right to adjust or withhold commissions in cases of suspected fraud`
    },
    {
      title: "4. PROHIBITED ACTIVITIES",
      content: `You may not access or use the Services for any purpose other than that for which we make them available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.

Prohibited activities include:
• Systematic retrieval of data to create a collection, compilation, database, or directory
• Making any unauthorized use of the Services
• Engaging in unauthorized framing of or linking to the Services
• Tricking, defrauding, or misleading us and other users
• Attempting to impersonate another user or person
• Using the Services in a manner inconsistent with any applicable laws or regulations`
    },
    {
      title: "5. USER REPRESENTATIONS",
      content: `By using the Services, you represent and warrant that:
• All registration information you submit will be true, accurate, current, and complete
• You will maintain the accuracy of such information
• You have the legal capacity and agree to comply with these Terms and Conditions
• You are not a minor in the jurisdiction in which you reside
• You will not access the Services through automated or non-human means
• You will not use the Services for any illegal or unauthorized purpose`
    },
    {
      title: "6. MODIFICATIONS AND INTERRUPTIONS",
      content: `We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. We have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.`
    },
    {
      title: "7. GOVERNING LAW",
      content: `These Terms shall be governed by and defined following the laws of Algeria. Men's Rich LLC and yourself irrevocably consent that the courts of Algeria shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.`
    },
    {
      title: "8. DISCLAIMER",
      content: `THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF.`
    },
    {
      title: "9. CONTACT US",
      content: `In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:

Men's Rich LLC
Bni Malek Villa 91
Skikda, Skikda 21000
Algeria
Email: support@mensrich.com`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Header */}
          <div className="text-center border-b border-gray-200 pb-8">
            <h1 className="text-3xl font-bold text-gray-900">TERMS AND CONDITIONS</h1>
            <p className="mt-4 text-gray-600">Last updated January 16, 2025</p>
          </div>

          {/* Introduction */}
          <div className="prose max-w-none">
            <p className="text-gray-700">
              Welcome to Men's Rich. Please read these Terms and Conditions carefully before using our Services.
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">QUICK NAVIGATION</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {sections.map((section, index) => (
              <section 
                key={index} 
                id={`section-${index}`}
                className="scroll-mt-16 border-b border-gray-100 pb-8 last:border-0"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 rounded-xl p-6 mt-8">
            <p className="text-center text-gray-600">
              By using our Services, you acknowledge that you have read and understood these Terms and Conditions 
              and agree to be bound by them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;