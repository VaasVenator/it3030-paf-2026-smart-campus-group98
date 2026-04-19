import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError("All fields are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Simulate form submission
    console.log("Contact form submitted:", form);
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });

    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  }

  return (
    <div className="public-page">
      <Header />
      
      <main className="public-main">
        <section className="page-header">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with our team.</p>
        </section>

        <section className="contact-content">
          <div className="contact-info">
            <div className="contact-card">
              <h3>📧 Email</h3>
              <p><a href="mailto:support@smartcampus.edu">support@smartcampus.edu</a></p>
              <p className="text-muted">For general inquiries and support</p>
            </div>

            <div className="contact-card">
              <h3>📞 Phone</h3>
              <p><a href="tel:+94701234567">+94 (70) 123-4567</a></p>
              <p className="text-muted">Monday - Friday, 9 AM - 5 PM</p>
            </div>

            <div className="contact-card">
              <h3>📍 Address</h3>
              <p>Smart Campus Hub<br />123 Campus Avenue<br />Education City, SC 12345</p>
              <p className="text-muted">Main Office</p>
            </div>

            <div className="contact-card">
              <h3>💬 Chat Support</h3>
              <p>Available during business hours</p>
              <p className="text-muted">Real-time assistance from our team</p>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send us a Message</h2>
            
            {submitted && (
              <div className="success-message">
                ✓ Thank you for your message! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div className="error-message">
                ✗ {error}
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us more..."
                  rows="6"
                ></textarea>
              </div>

              <button type="submit" className="primary-button">Send Message</button>
            </form>
          </div>
        </section>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How do I create an account?</h4>
              <p>Click the "Sign Up" button on our website and follow the registration process with your student or staff credentials.</p>
            </div>
            <div className="faq-item">
              <h4>How do I book a resource?</h4>
              <p>Log in to your account, navigate to the Resources section, select your desired facility, choose your preferred date and time, and submit your booking request.</p>
            </div>
            <div className="faq-item">
              <h4>What if I need to cancel a booking?</h4>
              <p>You can cancel pending or approved bookings from your bookings page. Please note that cancellations should be made at least 24 hours in advance.</p>
            </div>
            <div className="faq-item">
              <h4>How do I report a maintenance issue?</h4>
              <p>Go to the Tickets section, create a new ticket, describe the issue, and select the affected facility. Our team will be notified immediately.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
