import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function HomePage() {
  const { user } = useAuth();

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-5">
            <h1 className="display-4 mb-3">Map Your Story</h1>
            <p className="lead">
              Share your experiences and discover the world through interactive maps.
            </p>
          </div>

          {user ? (
            <Card>
              <Card.Body className="text-center">
                <h3>Welcome back, {user.username}!</h3>
                <p>Ready to create or explore maps?</p>
                <div className="d-grid gap-2">
                  <Button as={Link} to="/maps" variant="primary" size="lg">
                    View My Maps
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body className="text-center">
                <h3>Get Started</h3>
                <p>
                  Join GeoSocial to create interactive maps, share your stories,
                  and collaborate with others.
                </p>
                <div className="d-grid gap-2">
                  <Button as={Link} to="/login" variant="primary" size="lg">
                    Login / Sign Up
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          <Row className="mt-5">
            <Col md={4} className="mb-3">
              <div className="text-center">
                <h5>📍 Pin Locations</h5>
                <p>Mark important places and add rich media content</p>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="text-center">
                <h5>🗺️ Create Maps</h5>
                <p>Build custom maps for your adventures and projects</p>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="text-center">
                <h5>👥 Collaborate</h5>
                <p>Share and work together on maps with friends</p>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;