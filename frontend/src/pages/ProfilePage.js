import React from 'react';
import { Container, Grid, Card } from 'semantic-ui-react';
import { useAuth } from '../hooks/useAuth';

function ProfilePage() {
  const { user } = useAuth();

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h3>Profile</h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={3}>
                  <strong>Username:</strong>
                </Col>
                <Col sm={9}>
                  {user.username}
                </Col>
              </Row>
              
              <hr />
              
              <Row>
                <Col sm={3}>
                  <strong>Name:</strong>
                </Col>
                <Col sm={9}>
                  {user.name || 'Not provided'}
                </Col>
              </Row>
              
              <hr />
              
              <div className="text-muted">
                <p>Profile editing features will be added in future updates.</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;