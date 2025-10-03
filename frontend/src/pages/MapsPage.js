import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
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
    <Col md={6} lg={4} className="mb-4" key={map.id}>
      <Card className="h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title">{map.name}</h5>
            {map.public_view && <Badge bg="success">Public</Badge>}
          </div>
          
          {showOwner && (
            <p className="text-muted small mb-2">By {map.owner}</p>
          )}
          
          <p className="card-text text-muted">
            {map.description.length > 100 
              ? `${map.description.substring(0, 100)}...`
              : map.description}
          </p>
          
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {map.pins_count} pins • {map.collaborators_count} collaborators
            </small>
            <Button as={Link} to={`/maps/${map.slug}`} variant="outline-primary" size="sm">
              View Map
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Maps</h1>
        <Button variant="primary">Create New Map</Button>
      </div>

      {/* My Maps Section */}
      <section className="mb-5">
        <h2>My Maps</h2>
        {myMapsError ? (
          <div className="alert alert-danger">
            Error loading your maps: {myMapsError.message}
          </div>
        ) : myMaps.length === 0 ? (
          <Card>
            <Card.Body className="text-center py-5">
              <h4>No maps yet</h4>
              <p className="text-muted">Create your first map to get started!</p>
              <Button variant="primary">Create Your First Map</Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {myMaps.map((map) => (
              <MapCard key={map.id} map={map} />
            ))}
          </Row>
        )}
      </section>

      {/* Public Maps Section */}
      <section>
        <h2>Public Maps</h2>
        {publicMapsError ? (
          <div className="alert alert-danger">
            Error loading public maps: {publicMapsError.message}
          </div>
        ) : publicMaps.length === 0 ? (
          <Card>
            <Card.Body className="text-center py-5">
              <h4>No public maps available</h4>
              <p className="text-muted">Be the first to create a public map!</p>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {publicMaps.map((map) => (
              <MapCard key={map.id} map={map} showOwner={true} />
            ))}
          </Row>
        )}
      </section>
    </Container>
  );
}

export default MapsPage;