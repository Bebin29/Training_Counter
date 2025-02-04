import { TrophyFill } from "react-bootstrap-icons";
import { Container } from "react-bootstrap";

export function CompletionBadge() {
  return (
    <Container className="d-flex justify-content-center align-items-center gap-2 p-3 bg-success text-white rounded">
      <TrophyFill size={24} className="text-warning" />
      <span className="fs-5 fw-medium">Exercise Completed!</span>
    </Container>
  );
}
