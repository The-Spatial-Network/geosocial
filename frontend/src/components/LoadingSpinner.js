import React from 'react';
import { Loader, Container, Segment } from 'semantic-ui-react';

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Container textAlign="center" style={{ minHeight: '50vh', paddingTop: '5em' }}>
      <Segment basic>
        <Loader active size="large">
          {message}
        </Loader>
      </Segment>
    </Container>
  );
}

export default LoadingSpinner;