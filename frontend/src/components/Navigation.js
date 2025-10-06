import React from 'react';
import { Menu, Container, Button } from 'semantic-ui-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Menu inverted color="blue" size="large">
      <Container>
        <Menu.Item as={Link} to="/" header>
          GeoSocial
        </Menu.Item>
        
        <Menu.Item as={Link} to="/">
          Home
        </Menu.Item>
        
        {user && (
          <Menu.Item as={Link} to="/maps">
            My Maps
          </Menu.Item>
        )}
        
        <Menu.Menu position="right">
          {user ? (
            <>
              <Menu.Item as={Link} to="/profile">
                {user.username}
              </Menu.Item>
              <Menu.Item>
                <Button 
                  basic 
                  inverted
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item as={Link} to="/login">
                Login
              </Menu.Item>
              <Menu.Item as={Link} to="/signup">
                Sign Up
              </Menu.Item>
            </>
          )}
        </Menu.Menu>
      </Container>
    </Menu>
  );
}

export default Navigation;