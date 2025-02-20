import React, { useState, useEffect } from "react";
import Loader from '../components/Loader';
import { ChevronLeft } from "lucide-react";
import "./Presentation.css";

const Documentation = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); 

    return () => clearTimeout(timer); 
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className="documentation-container">
      <br />
        <br />
        <button
          className="back-button"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="back-icon" />
        </button>
      <div className="documentation-wrapper">
        <div className="documentation-header">
          <h1>المستند</h1>
          <p>كل ما تحتاج معرفته عن منصتنا</p>
        </div>
  
        {/* الروابط السريعة */}
        <div className="quick-links">
          {[
            { icon: "book", title: "دليل المستخدم" },
            { icon: "credit-card", title: "الدفع" },
            { icon: "youtube", title: "فديو توضيحي" },
            { icon: "question-circle", title: "الأسئلة الشائعة" },
          ].map((item) => (
            <div key={item.title} className="quick-link-card">
              <i className={`bi bi-${item.icon}`}></i>
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
  
        {/* قسم دليل المستخدم */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-book"></i>
            <h2>دليل المستخدم</h2>
          </div>
          <div className="section-content">
            <p>ابدأ مع دليل المستخدم الشامل لتحقيق أقصى استفادة من منصتنا.</p>
            <div className="feature-list">
              <div className="feature-item">
                <i className="bi bi-check2-circle"></i>
                <p>تعلم أساسيات التنقل والميزات الأساسية</p>
              </div>
              <div className="feature-item">
                <i className="bi bi-check2-circle"></i>
                <p>اكتشف الميزات المتقدمة وخيارات التخصيص</p>
              </div>
            </div>
          </div>
        </section>
  
        {/* قسم الدفع */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-credit-card"></i>
            <h2>الدفع</h2>
          </div>
          <div className="section-content">
            <p>تعرف على خيارات الدفع الآمنة وإجراءات الفوترة لدينا.</p>
            <div className="payment-grid">
              <div className="payment-card">
                <h3>طرق الدفع المقبولة</h3>
                <div className="payment-methods">
                  <img src="Algerie Poste.svg" alt="Algerie Poste"></img>
                  <img src="Baridimob.svg" alt="Baridimob"></img>
                </div>
                <br />
              </div>
              <div className="payment-card">
                <h3>دورة الدفع</h3>
                <p>شهري</p>
              </div>
            </div>
          </div>
        </section>
  
        {/* قسم الدخل الشهري */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-cash"></i>
            <h2>الدخل الشهري</h2>
          </div>
          <div className="section-content">
            <p>احصل على دخل شهري من خلال أنشطة متنوعة على المنصة.</p>
            <div className="income-list">
              <div className="income-item">
                <h3>دخل إضافي</h3>
                <p>باستخدام هاتفك أو جهاز الكمبيوتر الخاص بك، يمكنك كسب دخل إضافي عن طريق الترويج للمنتجات وإحالة الأصدقاء.</p>
              </div>
              <div className="income-item">
                <h3>طرق الربح</h3>
                <ul>
                  <li>عمولة عن كل طلب مؤكد</li>
                  <li>إحالة أو دعوة صديق</li>
                  <li>دخل شهري لجهود الفريق</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
  
        {/* قسم كيفية البدء */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-play-circle"></i>
            <h2>كيف تبدأ؟</h2>
          </div>
          <div className="section-content">
            <p>البدء سهل للغاية. فقط اتبع هذه الخطوات:</p>
            <div className="steps-list">
              <div className="income-item">
                <h3>كيفية التسجيل؟</h3>
                <ul>
                  <li>راسل صاحب المنشور بشكل خاص للحصول على رمز الدعوة للانضمام إلى فريقنا.</li>
                  <li>إذا كان رمز الدعوة موجودًا في المنشور، فانسخه.</li>
                  <li>ضع الرمز في مربع Referral ID.</li>
                </ul>
              </div>
              <div className="income-item">
                <h3>كيفية البيع؟</h3>
                <ul>
                  <li>انقر على زر + في الجزء السفلي من شاشة Dashboard.</li>
                  <li>انقر على المتجر.</li>
                  <li>اختر المنتج وانقر عليه.</li>
                  <li>اضغط مطولًا على صورة المنتج لتنزيلها وانسخ العنوان والسعر.</li>
                  <li>قم بالترويج للمنتج على وسائل التواصل الاجتماعي.</li>
                </ul>
              </div>
              <div className="income-item">
                <h3>كيفية طلب المنتج؟</h3>
                <ul>
                  <li>في حالة الطلب، أدخل المنتج واملأ مربع الطلب بمعلومات العميل.</li>
                  <li>عند تأكيد الطلب، ستحصل على العمولة المستحقة لك.</li>
                </ul>
              </div>
              <div className="income-item">
                <h3>كيفية إحالة صديق؟</h3>
                <ul>
                  <li>انسخ معرفك وشاركه مع الأصدقاء وعلى وسائل التواصل الاجتماعي.</li>
                </ul>
                <p>أو</p>
                <ul>
                  <li>انقر على زر +.</li>
                  <li>انقر على Referral.</li>
                  <li>أضف معلومات صديقك وانقر على تسجيل.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
  
        {/* قسم المستويات والنقاط */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-graph-up"></i>
            <h2>المستويات والنقاط</h2>
          </div>
          <div className="section-content">
            <p>يعتمد راتبك الشهري على جهود فريقك والنقاط التي تتراكم لديك.</p>
            <div className="levels-list">
              <div className="income-item">
                <h3>المستويات</h3>
                <ul>
                  <li>Distributeur</li>
                  <li>Animateur</li>
                  <li>Animateur Junior</li>
                  <li>Animateur Senior</li>
                  <li>Manager</li>
                  <li>Manager Junior</li>
                  <li>Manager Senior</li>
                </ul>
              </div>
              <div className="income-item">
                <h3>الانتقال إلى المستوى التالي</h3>
                <ul>
                  <li>النقاط من الشهر السابق</li>
                  <li>النقاط من هذا الشهر</li>
                  <li>النقاط التي تحتاجها للانتقال إلى المستوى التالي</li>
                </ul>
                <p>مثال: إذا كنت في مستوى منشط والمستوى التالي هو منشط مبتدئ وتحتاج إلى 6250 نقطة. نقاطك من الشهر السابق هي 2300 نقطة + نقاط هذا الشهر 2100 نقطة = 4400 نقطة، لن تنتقل إلى المستوى التالي. ولكن إذا كانت نقاطك من الشهر السابق 4900 نقطة + نقاط هذا الشهر 1400 نقطة = 6300 نقطة، سوف تنتقل إلى المستوى التالي.</p>
              </div>
            </div>
          </div>
        </section>

        {/* قسم المستويات ونسبة الربح */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-coin"></i>
            <h2>المستويات ونسبة الربح</h2>
          </div>
          <div className="section-content">
            <p>هذه النسب هي للعمولة وأرباح الفريق</p>
            <div className="levels-list">
              <div className="income-item">
                <h3>نسبة الربح من المبيعات</h3>
                <ul>
                  <li>Distributeur 11%</li>
                  <li>Animateur 13%</li>
                  <li>Animateur Junior 16%</li>
                  <li>Animateur Senior 18%</li>
                  <li>Manager 20%</li>
                  <li>Manager Junior 23%</li>
                  <li>Manager Senior 25%</li>
                </ul>
              </div>
              <div className="incomes-item">
                <h3>نسبة الربح من الفريق</h3>
                <ul>
                  <img src="/prc.jpg" alt="نسبة الربح من الفريق" />
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* قسم نقاط المستويات */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-mortarboard"></i>
            <h2>نقاط المستويات</h2>
          </div>
          <div className="section-content">
            <p>هذه هي النقاط المطلوبة للارتقاء إلى المستوى الأعلى</p>
            <div className="levels-list">
              <div className="income-item">
                <h3>نقاط المستويات</h3>
                <ul>
                  <li>Distributeur نقطة 0</li>
                  <li>Animateur نقطة 100</li>
                  <li>Animateur Junior نقطة 6250</li>
                  <li>Animateur Senior نقطة 12500</li>
                  <li>Manager نقطة 18700</li>
                  <li>Manager Junior نقطة 30000</li>
                  <li>Manager Senior نقطة 50000</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
  
        {/* قسم الفديو التوضيحي */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-youtube"></i>
            <h2>الفديو التوضيحي</h2>
          </div>
          <div className="plan-grid">
            <iframe
              width="100%"
              height="auto"
              style={{ borderRadius: "20px", maxWidth: "550px", maxHeight: "400px", minHeight: "300px" }}
              src="https://www.youtube.com/embed/-Vumls3bQmI?si=lkpwFPSRkWvTQgqu"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
  
        {/* قسم الأسئلة الشائعة */}
        <section className="doc-section">
          <div className="section-header">
            <i className="bi bi-question-circle"></i>
            <h2>الأسئلة الشائعة</h2>
          </div>
          <div className="faq-list">
            {[
              {
                question: "كيف أبدأ؟",
                answer: "أولاً، تحتاج إلى معرف شخص ما 'للتسجيل'، بعد ذلك يمكنك الذهاب إلى قسم المتجر واختيار المنتج الذي ترغب في العمل عليه. انسخ عنوان المنتج والسعر الإجمالي وشاركه على وسائل التواصل الاجتماعي وعندما تحصل على طلب، عد إلى Men's Rich واذهب إلى منتجك وأضف معلومات العميل وانقر على 'شراء'. إذا تم تسليم الطلب، ستحصل على العمولة التي ربحتها من ذلك المنتج."
              },
              {
                question: "ما هي طرق الدفع التي تقبلونها؟",
                answer: "نقبل فقط Algerie Poste و Baridimob"
              },
              {
                question: "كيف يمكنني الاتصال بالدعم؟",
                answer: "فريق الدعم لدينا متاح 24/7 عبر البريد الإلكتروني: contact@mensrich.com أو قسم helpdesk."
              }
            ].map((faq, index) => (
              <div key={index} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Documentation;