import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card, Button, Form, Spinner, Pagination } from 'react-bootstrap';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page) => {
    setLoading(true);
    try {
      const response = await apiService.getUsers(page);
      setUsers(response.data);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError('Failed to fetch users');
      toast.error('Failed to fetch users');
      if (err.response && err.response.status === 401) {
        // Token might be expired or invalid
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/users/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(id);
        toast.success('User deleted successfully');
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management System</h2>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Form className="mb-4">
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </Form.Group>
      </Form>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <div className="text-center text-danger my-5">{error}</div>
      ) : (
        <>
          <Row>
            {filteredUsers.map(user => (
              <Col key={user.id} md={4} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <div className="text-center p-3">
                    <Card.Img 
                      variant="top" 
                      src={user.avatar} 
                      className="rounded-circle" 
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                  <Card.Body className="text-center">
                    <Card.Title>
                      {user.first_name} {user.last_name}
                    </Card.Title>
                    <Card.Text className="text-muted mb-4">
                      {user.email}
                    </Card.Text>
                    <div className="d-flex justify-content-center gap-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleEdit(user.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.Prev 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Pagination.Item 
                  key={page}
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              
              <Pagination.Next 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </>
      )}
    </Container>
  );
};

export default UserList;