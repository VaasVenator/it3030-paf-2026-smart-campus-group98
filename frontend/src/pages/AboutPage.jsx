import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="public-page">
      <Header />
      
      <main className="public-main">
        <section className="page-header">
          <h1>About Smart Campus Hub</h1>
          <p>Transforming campus facility management for the modern era</p>
        </section>

        <section className="about-content">
          <div className="about-section">
            <h2>Our Mission</h2>
            <p>
              Smart Campus Hub is dedicated to simplifying and streamlining campus facility management. We believe that efficient resource allocation and maintenance operations are crucial to creating a productive and comfortable campus environment for students and staff.
            </p>
          </div>

          <div className="about-section">
            <h2>What We Do</h2>
            <p>
              We provide a comprehensive digital solution that enables:
            </p>
            <ul className="about-list">
              <li>Seamless booking of campus facilities and resources</li>
              <li>Transparent maintenance ticket tracking and management</li>
              <li>Real-time notifications and updates</li>
              <li>Efficient admin oversight and reporting</li>
              <li>Data-driven insights for campus planning</li>
            </ul>
          </div>

          <div className="about-section">
            <h2>Why Choose Us?</h2>
            <div className="about-grid">
              <div className="about-card">
                <h3>User-Friendly</h3>
                <p>Intuitive interface designed for students, staff, and administrators with minimal learning curve.</p>
              </div>
              <div className="about-card">
                <h3>Reliable</h3>
                <p>Built on enterprise-grade technology with 99.9% uptime guarantee and continuous support.</p>
              </div>
              <div className="about-card">
                <h3>Scalable</h3>
                <p>Easily adapts to institutions of any size, from small departments to large university campuses.</p>
              </div>
              <div className="about-card">
                <h3>Secure</h3>
                <p>Industry-standard security protocols protect user data and ensure privacy compliance.</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h2>Our Team</h2>
            <p>
              Smart Campus Hub is developed by a dedicated team of software engineers, designers, and campus operations professionals who understand the unique challenges of modern educational institutions. Our expertise spans facility management, technology infrastructure, and user experience design.
            </p>
          </div>

          <div className="about-section">
            <h2>Technology Stack</h2>
            <p>
              Built with cutting-edge technologies including React for responsive frontend interfaces, Spring Boot for robust backend services, MongoDB for flexible data management, and OAuth2 for secure authentication.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
