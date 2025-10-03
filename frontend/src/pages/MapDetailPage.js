import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
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
        <div className="alert alert-danger">
          Error loading map: {error.message}
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col lg={3} className="mb-4">
          <Card>
            <Card.Header>
              <h4>{map.name}</h4>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">{map.description}</p>
              
              <div className="mb-3">
                <strong>Owner:</strong> {map.owner}
              </div>
              
              <div className="mb-3">
                <strong>Style:</strong> {map.style}
              </div>
              
              <div className="mb-3">
                <strong>Pins:</strong> {map.pins_count}
              </div>
              
              <div className="mb-3">
                <strong>Collaborators:</strong> {map.collaborators_count}
              </div>
              
              {map.public_view && (
                <span className="badge bg-success">Public</span>
              )}
            </Card.Body>
          </Card>

          {/* Pins List */}
          {map.pins && map.pins.length > 0 && (
            <Card className="mt-3">
              <Card.Header>
                <h5>Pins ({map.pins.length})</h5>
              </Card.Header>
              <Card.Body style={{maxHeight: '400px', overflowY: 'auto'}}>
                {map.pins.map((pin) => (
                  <div key={pin.id} className="border-bottom pb-2 mb-2">
                    <h6>{pin.name}</h6>
                    <p className="small text-muted mb-1">{pin.description}</p>
                    <small className="text-muted">
                      By {pin.placed_by} • {pin.content_type}
                    </small>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col lg={9}>
          {/* Map Component Placeholder */}
          <Card style={{height: '600px'}}>
            <Card.Body className="d-flex align-items-center justify-content-center">
              <div className="text-center">
                <h4>Interactive Map</h4>
                <p className="text-muted">
                  Map component will be implemented here using React Leaflet
                </p>
                <p className="text-muted">
                  Latitude/Longitude coordinates will be displayed for pins:
                </p>
                {map.pins && map.pins.map((pin) => (
                  <div key={pin.id} className="small">
                    {pin.name}: {pin.latitude}, {pin.longitude}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default MapDetailPage;