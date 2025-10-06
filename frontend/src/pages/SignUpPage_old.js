import React, { useState } from 'react';
import { Grid, Segment, Form, Button, Message, Header, Container } from 'semantic-ui-react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function SignUpPage() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/maps" />;
  }

  const handleChange = (e, { name, value }) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password1) {
      newErrors.password1 = 'Password is required';
    } else if (formData.password1.length < 8) {
      newErrors.password1 = 'Password must be at least 8 characters long';
    }

    if (!formData.password2) {
      newErrors.password2 = 'Please confirm your password';
    } else if (formData.password1 !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      // The allauth-fetch package should handle conflicts properly
      await authAPI.signup(formData);
      setSuccess(true);
      // Don't automatically redirect - let user know to check email
    } catch (error) {
      console.log('Signup error:', error);
      
      // The allauth-fetch package should provide cleaner error handling
      if (error.errors) {
        // Handle allauth-fetch error format
        const backendErrors = {};
        error.errors.forEach(err => {
          const field = err.param || 'general';
          backendErrors[field] = err.message;
        });
        setErrors(backendErrors);
      } else if (error.message) {
        // Simple error message
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'An error occurred during signup. Please try again.' });
      }
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card>
              <Card.Header>
                <h3 className="text-center mb-0 text-success">Registration Successful!</h3>
              </Card.Header>
              <Card.Body>
                <Alert variant="success">
                  <strong>Account created successfully!</strong>
                  <br />
                  Please check your email to verify your account before logging in.
                </Alert>
                <div className="d-grid gap-2">
                  <Button variant="primary" onClick={() => navigate('/login')}>
                    Go to Login
                  </Button>
                  <Button variant="outline-secondary" onClick={() => setSuccess(false)}>
                    Create Another Account
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Header>
              <h3 className="text-center mb-0">Create Account</h3>
            </Card.Header>
            <Card.Body>
              {errors.general && (
                <Alert variant="danger">{errors.general}</Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username *</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={!!errors.username}
                    disabled={loading}
                    placeholder="Choose a username"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    disabled={loading}
                    placeholder="your.email@example.com"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password1"
                    value={formData.password1}
                    onChange={handleChange}
                    isInvalid={!!errors.password1}
                    disabled={loading}
                    placeholder="Enter a strong password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password1}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Password must be at least 8 characters long.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    isInvalid={!!errors.password2}
                    disabled={loading}
                    placeholder="Confirm your password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password2}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </Form>

              <hr />
              <div className="text-center">
                <small className="text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Sign in here
                  </Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default SignUpPage;