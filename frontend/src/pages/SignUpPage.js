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
  const [success, setSuccess] = useState(null);

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

    if (!formData.password1.trim()) {
      newErrors.password1 = 'Password is required';
    } else if (formData.password1.length < 8) {
      newErrors.password1 = 'Password must be at least 8 characters long';
    }

    if (!formData.password2.trim()) {
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

    const result = await signup(formData);
    
    if (result.success) {
      if (result.requiresVerification) {
        // Show email verification message
        setSuccess({
          type: 'verification',
          message: result.message || 'Please check your email to verify your account.'
        });
      } else {
        // User is logged in, redirect to maps
        navigate('/maps');
      }
    } else {
      // Handle errors from dj-rest-auth
      if (typeof result.error === 'object') {
        setErrors(result.error);
      } else {
        setErrors({ general: result.error });
      }
    }

    setLoading(false);
  };

  return (
    <Container>
      <Grid centered columns={2}>
        <Grid.Column>
          <Segment padded>
            <Header as="h2" textAlign="center" color="blue">
              Create Account
            </Header>
            
            {errors.general && (
              <Message error>
                <Message.Header>Signup Failed</Message.Header>
                <p>{errors.general}</p>
              </Message>
            )}
            
            {success && (
              <Message success>
                <Message.Header>Account Created Successfully!</Message.Header>
                <p>{success.message}</p>
                {success.type === 'verification' && (
                  <p><small>After verifying your email, you can <Link to="/login">log in here</Link>.</small></p>
                )}
              </Message>
            )}
            
            {!success && (
              <>
                <Form onSubmit={handleSubmit} loading={loading}>
                  <Form.Input
                    fluid
                    icon="user"
                    iconPosition="left"
                    placeholder="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username ? { content: errors.username, pointing: 'below' } : null}
                    required
                  />
                  <Form.Input
                    fluid
                    icon="mail"
                    iconPosition="left"
                    placeholder="Email address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email ? { content: errors.email, pointing: 'below' } : null}
                    required
                  />
                  <Form.Input
                    fluid
                    icon="lock"
                    iconPosition="left"
                    placeholder="Password (8+ characters)"
                    type="password"
                    name="password1"
                    value={formData.password1}
                    onChange={handleChange}
                    error={errors.password1 ? { content: errors.password1, pointing: 'below' } : null}
                    required
                  />
                  <Form.Input
                    fluid
                    icon="lock"
                    iconPosition="left"
                    placeholder="Confirm password"
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    error={errors.password2 ? { content: errors.password2, pointing: 'below' } : null}
                    required
                  />
                  
                  <Button 
                    color="blue" 
                    fluid 
                    size="large" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Form>
                
                <Message>
                  Already have an account? <Link to="/login">Sign in here</Link>
                </Message>
              </>
            )}
          </Segment>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default SignUpPage;