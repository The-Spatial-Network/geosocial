import React from 'react';
import { Container, Grid, Card, Header, Message, Label, Segment, List } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mapsAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function MapDetailPage() {
  const { slug } = useParams();
  
  const { 
    data: map, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['map', slug],
    queryFn: () => mapsAPI.getMap(slug),
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading map..." />;
  }

  if (error) {
    return (
      <Container>
        <Message negative>
          <Message.Header>Error loading map</Message.Header>
          <p>{error.message}</p>
        </Message>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Grid>
        <Grid.Column width={4}>
          <Card fluid>
            <Card.Content>
              <Card.Header>{map.name}</Card.Header>
              <Card.Description>{map.description}</Card.Description>
            </Card.Content>
            <Card.Content extra>
              <List divided relaxed>
                <List.Item>
                  <List.Content>
                    <List.Header>Owner</List.Header>
                    {map.owner}
                  </List.Content>
                </List.Item>
                <List.Item>
                  <List.Content>
                    <List.Header>Style</List.Header>
                    {map.style}
                  </List.Content>
                </List.Item>
                <List.Item>
                  <List.Content>
                    <List.Header>Pins</List.Header>
                    {map.pins_count}
                  </List.Content>
                </List.Item>
                <List.Item>
                  <List.Content>
                    <List.Header>Collaborators</List.Header>
                    {map.collaborators_count}
                  </List.Content>
                </List.Item>
              </List>
              
              {map.public_view && (
                <Label color="green">Public</Label>
              )}
            </Card.Content>
          </Card>

          {/* Pins List */}
          {map.pins && map.pins.length > 0 && (
            <Card fluid style={{ marginTop: '1rem' }}>
              <Card.Content>
                <Card.Header>Pins ({map.pins.length})</Card.Header>
              </Card.Content>
              <Card.Content style={{maxHeight: '400px', overflowY: 'auto'}}>
                <List divided>
                  {map.pins.map((pin) => (
                    <List.Item key={pin.id}>
                      <List.Content>
                        <List.Header>{pin.name}</List.Header>
                        <List.Description>{pin.description}</List.Description>
                        <div style={{ fontSize: '0.9em', color: '#999', marginTop: '0.5rem' }}>
                          By {pin.placed_by} • {pin.content_type}
                        </div>
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              </Card.Content>
            </Card>
          )}
        </Grid.Column>
        
        <Grid.Column width={12}>
          {/* Map Component Placeholder */}
          <Card fluid style={{height: '600px'}}>
            <Card.Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Segment placeholder textAlign="center">
                <Header as="h4">Interactive Map</Header>
                <p>Map component will be implemented here using React Leaflet</p>
                <p>Latitude/Longitude coordinates will be displayed for pins:</p>
                {map.pins && map.pins.map((pin) => (
                  <div key={pin.id} style={{ fontSize: '0.9em', margin: '0.5rem 0' }}>
                    {pin.name}: {pin.latitude}, {pin.longitude}
                  </div>
                ))}
              </Segment>
            </Card.Content>
          </Card>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default MapDetailPage;