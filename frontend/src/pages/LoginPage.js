import React, { useState } from 'react';
import { Grid, Segment, Form, Button, Message, Header, Container } from 'semantic-ui-react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/maps" />;
  }

  const handleChange = (e, { name, value }) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      navigate('/maps');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container>
      <Grid centered columns={2}>
        <Grid.Column>
          <Segment padded>
            <Header as="h2" textAlign="center" color="blue">
              Login to GeoSocial
            </Header>
            
            {error && (
              <Message error>
                <Message.Header>Login Failed</Message.Header>
                <p>{error}</p>
              </Message>
            )}
            
            <Form onSubmit={handleSubmit} loading={loading}>
              <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              
              <Button 
                color="blue" 
                fluid 
                size="large" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form>
            
            <Message>
              New to GeoSocial? <Link to="/signup">Create an account</Link>
            </Message>
          </Segment>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default LoginPage;