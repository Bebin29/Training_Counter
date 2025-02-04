import { Github, Twitter } from "react-bootstrap-icons";
import { Container, Button } from "react-bootstrap";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-3 border-top bg-light">
      <Container className="text-center">
        {/* Social Links */}
        <div className="d-flex justify-content-center gap-3 mb-3">
          <Button variant="outline-dark" size="sm" as="a" href="https://github.com/yourusername/shadow-gains" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github size={20} />
          </Button>
          <Button variant="outline-dark" size="sm" as="a" href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <Twitter size={20} />
          </Button>
        </div>

        <hr />

        {/* Credits */}
        <div className="text-muted small">
          <p className="mb-1">Inspired by Solo Leveling</p>
          <p>© {currentYear} Shadow Gains. All rights reserved.</p>
        </div>

        {/* Optional: Links */}
        <div className="d-flex justify-content-center gap-3 mt-2">
          <Button variant="link" href="/privacy">Privacy</Button>
          <Button variant="link" href="/terms">Terms</Button>
          <Button variant="link" href="/contact">Contact</Button>
        </div>
      </Container>
    </footer>
  );
}
