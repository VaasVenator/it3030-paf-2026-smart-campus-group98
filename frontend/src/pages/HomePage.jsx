import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="public-page">
      <Header />
      
      <main className="public-main">
        <section className="hero">
          <div className="hero-content">
            <h2>Welcome to Smart Campus Hub</h2>
            <p>Your all-in-one solution for campus facility management, resource bookings, and maintenance services.</p>
            <div className="hero-buttons">
              <Link to="/login" className="primary-button">Get Started</Link>
              <Link to="/about" className="secondary-button">Learn More</Link>
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Resource Booking</h3>
              <p>Book lecture halls, labs, media units, and other campus resources with ease. Check availability and manage your bookings in real-time.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Maintenance Tickets</h3>
              <p>Report facility issues and track maintenance requests. Get real-time updates on ticket status and resolution progress.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Smart Notifications</h3>
              <p>Stay informed with real-time notifications about bookings, approvals, rejections, and maintenance updates.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👨‍💼</div>
              <h3>Admin Dashboard</h3>
              <p>Comprehensive admin tools for managing resources, approving bookings, and overseeing maintenance operations.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Access all features from any device. Responsive design ensures seamless experience on desktop, tablet, and mobile.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Secure & Reliable</h3>
              <p>Enterprise-grade security with user authentication, role-based access control, and data protection.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to streamline your campus operations?</h2>
          <p>Join thousands of students and staff using Smart Campus Hub for efficient facility management.</p>
          <div className="cta-buttons">
            <Link to="/signup" className="primary-button">Create Account</Link>
            <Link to="/contact" className="secondary-button">Contact Us</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
