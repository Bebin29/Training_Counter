import {  Button } from "react-bootstrap";
import { House, Activity } from "react-bootstrap-icons";
import "../../styles/index.css";

export function Navbar({ currentPage, onNavigate }: { 
  currentPage: string; 
  onNavigate: (page: string) => void;
}) {
  return (
    <nav className="mobile-navbar">
      <div className="fixed-bottom bg-light border-top py-3">
        <div className="container d-flex justify-content-around">
          <Button className={`nav-button ${currentPage === "home" ? "active" : ""}`} variant="light" size="sm" onClick={() => onNavigate("home")}>
            <House size={20} />
          </Button>
          <Button className={`nav-button ${currentPage === "home" ? "active" : ""}`} variant="light" size="sm" onClick={() => onNavigate("analysis")}>
            <Activity size={20} />
          </Button>
        </div>
      </div>
    </nav>
  );
}
