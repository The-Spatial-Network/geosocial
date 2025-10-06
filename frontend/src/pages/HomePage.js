import React from 'react';
import { Container, Grid, Segment, Button, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function HomePage() {
  const { user } = useAuth();

  return (
    <Container>
      <Grid centered columns={2}>
        <Grid.Column>
          <Segment textAlign="center" padded="very">
            <Header as="h1" size="huge" color="blue">
              Map Your Story
            </Header>
            <Header.Subheader style={{ fontSize: '1.2em', marginBottom: '2em' }}>
              Share your experiences and discover the world through interactive maps.
            </Header.Subheader>

            {user ? (
              <Segment>
                <Header as="h3">Welcome back, {user.username}!</Header>
                <p>Ready to create or explore maps?</p>
                <Button 
                  as={Link} 
                  to="/maps" 
                  color="blue" 
                  size="large"
                  fluid
                >
                  View My Maps
                </Button>
              </Segment>
            ) : (
              <Segment>
                <Header as="h3">Get Started</Header>
                <p>
                  Join GeoSocial to create interactive maps, share your stories,
                  and collaborate with others.
                </p>
                <Button 
                  as={Link} 
                  to="/login" 
                  color="blue" 
                  size="large"
                  fluid
                >
                  Login / Sign Up
                </Button>
              </Segment>
            )}

            <Grid columns={3} padded style={{ marginTop: '3em' }}>
              <Grid.Column textAlign="center">
                <Header as="h4">📍 Pin Locations</Header>
                <p>Mark important places and add rich media content</p>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <Header as="h4">🗺️ Create Maps</Header>
                <p>Build custom maps for your adventures and projects</p>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <Header as="h4">👥 Collaborate</Header>
                <p>Share and work together on maps with friends</p>
              </Grid.Column>
            </Grid>
          </Segment>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default HomePage;