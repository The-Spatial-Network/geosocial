import React from 'react';
import { Spinner, Container, Row, Col } from 'react-bootstrap';

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
      <Row>
        <Col className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">{message}</p>
        </Col>
      </Row>
    </Container>
  );
}

export default LoadingSpinner;