import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Smart Campus Hub</h3>
          <p>Your all-in-one campus facility management solution for bookings, maintenance, and notifications.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Features</h4>
          <ul>
            <li><a href="#features">Resource Booking</a></li>
            <li><a href="#features">Maintenance Tickets</a></li>
            <li><a href="#features">Notifications</a></li>
            <li><a href="#features">Admin Dashboard</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="mailto:support@smartcampus.edu">Email Support</a></li>
            <li><a href="tel:+94701234567">Call Us</a></li>
            <li><a href="#help">FAQ</a></li>
            <li><a href="#help">Help Center</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Smart Campus Hub. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#cookies">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
