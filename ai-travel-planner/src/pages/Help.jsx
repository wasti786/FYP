import React, { useState } from "react";

export default function Help() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="bg-light text-dark">
      {/* Hero Section */}
      <section className="text-center py-5 bg-white shadow-sm mb-5"  style={{ marginTop: "100px" }} >
        <h1 className="fw-bold text-primary mb-3">Help & Support</h1>
        <p className="text-muted mx-auto" style={{ maxWidth: "700px" }}>
          Need assistance? We’re here to help you with your travel planning, account issues, 
          or any technical questions.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="container mb-5">
        <h3 className="fw-bold text-primary text-center mb-4">Frequently Asked Questions</h3>
        <div className="accordion" id="faqAccordion">
          {[
            {
              q: "How does the AI travel planner work?",
              a: "Our AI uses destination data, your interests, and travel preferences to create smart itineraries, suggest activities, and manage budgets automatically.",
            },
            {
              q: "Can I edit my saved trips?",
              a: "Yes! Go to your planner page, click on 'My Trips', and you can edit, update, or delete any saved trip.",
            },
            {
              q: "Is my data secure?",
              a: "Absolutely. We use Firebase Authentication and Firestore with full encryption to ensure your travel data remains private and secure.",
            },
            {
              q: "Do I need to be logged in to save trips?",
              a: "Yes, you need to log in with your Google or email account to save and access your personalized travel plans.",
            },
          ].map((item, index) => (
            <div className="accordion-item mb-3 border-0 shadow-sm rounded-3" key={index}>
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className="accordion-button collapsed fw-semibold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                  aria-expanded="false"
                  aria-controls={`collapse${index}`}
                >
                  {item.q}
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading${index}`}
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body text-muted">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="container mb-5">
        <div className="card shadow border-0 rounded-4 p-4">
          <h4 className="fw-bold text-primary mb-3 text-center">Contact Support</h4>
          <p className="text-center text-muted mb-4">
            Couldn’t find what you’re looking for? Send us a message.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="How can we help you?"
                    className="form-control"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="text-center mt-4">
                <button className="btn btn-primary px-5 fw-semibold" type="submit">
                  Submit Request
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center p-4">
              <i className="fas fa-check-circle text-success fa-3x mb-3"></i>
              <h5>Thank you!</h5>
              <p className="text-muted">
                Your message has been received. Our support team will contact you soon.
              </p>
              <button
                className="btn btn-outline-primary mt-2"
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="bg-white py-5">
        <div className="container text-center">
          <h4 className="fw-bold text-primary mb-3">Other Resources</h4>
          <p className="text-muted mb-4">
            Access helpful resources to enhance your experience.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <a href="#" className="btn btn-outline-primary px-4">
              <i className="fas fa-book me-2"></i>Documentation
            </a>
            <a href="#" className="btn btn-outline-success px-4">
              <i className="fas fa-headset me-2"></i>Live Chat Support
            </a>
            <a href="#" className="btn btn-outline-warning px-4">
              <i className="fas fa-video me-2"></i>Video Tutorials
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
