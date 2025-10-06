import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Segment, Header, Message, Loader } from 'semantic-ui-react';

function EmailVerificationPage() {
  const { key } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/registration/verify-email/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key }),
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now log in to your account.');
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setStatus('error');
          setMessage(errorData.detail || 'The verification link is invalid or has expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please check your connection and try again.');
      }
    };

    if (key) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }
  }, [key, navigate]);

  return (
    <Container>
      <Segment textAlign="center" padded="very">
        <Header as="h2" color="blue">
          Email Verification
        </Header>

        {status === 'verifying' && (
          <Segment basic>
            <Loader active size="large">
              Verifying your email address...
            </Loader>
          </Segment>
        )}

        {status === 'success' && (
          <Message positive>
            <Message.Header>Email Verified Successfully!</Message.Header>
            <p>{message}</p>
            <p><small>You will be redirected to the login page in a few seconds...</small></p>
          </Message>
        )}

        {status === 'error' && (
          <Message negative>
            <Message.Header>Verification Failed</Message.Header>
            <p>{message}</p>
          </Message>
        )}
      </Segment>
    </Container>
  );
}

export default EmailVerificationPage;