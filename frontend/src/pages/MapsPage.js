import React from 'react';
import { Container, Grid, Card, Button, Label, Header, Message, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mapsAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function MapsPage() {
  const { 
    data: myMaps = [], 
    isLoading: myMapsLoading, 
    error: myMapsError 
  } = useQuery({
    queryKey: ['my-maps'],
    queryFn: mapsAPI.getMyMaps,
  });

  const { 
    data: publicMaps = [], 
    isLoading: publicMapsLoading, 
    error: publicMapsError 
  } = useQuery({
    queryKey: ['public-maps'],
    queryFn: mapsAPI.getPublicMaps,
  });

  if (myMapsLoading || publicMapsLoading) {
    return <LoadingSpinner message="Loading maps..." />;
  }

  const MapCard = ({ map, showOwner = false }) => (
    <Grid.Column key={map.id}>
      <Card fluid>
        <Card.Content>
          <Card.Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {map.name}
            {map.public_view && <Label color="green" size="mini">Public</Label>}
          </Card.Header>
          
          {showOwner && (
            <Card.Meta>By {map.owner}</Card.Meta>
          )}
          
          <Card.Description>
            {map.description && map.description.length > 100 
              ? `${map.description.substring(0, 100)}...`
              : map.description}
          </Card.Description>
        </Card.Content>
        
        <Card.Content extra>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#999', fontSize: '0.9em' }}>
              {map.pins_count} pins • {map.collaborators_count} collaborators
            </div>
            <Button as={Link} to={`/maps/${map.slug}`} color="blue" size="small">
              View Map
            </Button>
          </div>
        </Card.Content>
      </Card>
    </Grid.Column>
  );

  return (
    <Container>
      <Segment style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Header as="h1">Maps</Header>
        <Button color="blue">Create New Map</Button>
      </Segment>

      {/* My Maps Section */}
      <Segment style={{ marginBottom: '2rem' }}>
        <Header as="h2">My Maps</Header>
        {myMapsError ? (
          <Message negative>
            <Message.Header>Error loading your maps</Message.Header>
            <p>{myMapsError.message}</p>
          </Message>
        ) : myMaps.length === 0 ? (
          <Segment placeholder textAlign="center">
            <Header as="h4">No maps yet</Header>
            <p>Create your first map to get started!</p>
            <Button color="blue">Create Your First Map</Button>
          </Segment>
        ) : (
          <Grid stackable columns={3}>
            {myMaps.map((map) => (
              <MapCard key={map.id} map={map} />
            ))}
          </Grid>
        )}
      </Segment>

      {/* Public Maps Section */}
      <Segment>
        <Header as="h2">Public Maps</Header>
        {publicMapsError ? (
          <Message negative>
            <Message.Header>Error loading public maps</Message.Header>
            <p>{publicMapsError.message}</p>
          </Message>
        ) : publicMaps.length === 0 ? (
          <Segment placeholder textAlign="center">
            <Header as="h4">No public maps available</Header>
            <p>Be the first to create a public map!</p>
          </Segment>
        ) : (
          <Grid stackable columns={3}>
            {publicMaps.map((map) => (
              <MapCard key={map.id} map={map} showOwner={true} />
            ))}
          </Grid>
        )}
      </Segment>
    </Container>
  );
}

export default MapsPage;