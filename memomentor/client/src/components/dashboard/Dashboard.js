import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const Dashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await axios.get('/api/meetings');
        setMeetings(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMeetings();
  }, []);
  
  // Group meetings by status
  const upcomingMeetings = meetings.filter(meeting => 
    meeting.status === 'scheduled' && new Date(meeting.date) > new Date()
  );
  
  const pastMeetings = meetings.filter(meeting => 
    meeting.status === 'completed' || new Date(meeting.date) < new Date()
  );
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status badge
  const getStatusBadge = (status, date) => {
    const meetingDate = new Date(date);
    const now = new Date();
    
    if (status === 'completed') {
      return <Badge bg="success">Completed</Badge>;
    } else if (status === 'cancelled') {
      return <Badge bg="danger">Cancelled</Badge>;
    } else if (status === 'in-progress') {
      return <Badge bg="warning">In Progress</Badge>;
    } else if (meetingDate < now) {
      return <Badge bg="secondary">Missed</Badge>;
    } else {
      return <Badge bg="primary">Upcoming</Badge>;
    }
  };
  
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading your meetings...</p>
      </Container>
    );
  }
  
  return (
    <Container>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.name}</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/meetings/new" variant="primary">
            <i className="fas fa-plus me-2"></i>
            New Meeting
          </Button>
        </Col>
      </Row>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="h5 mb-3">Upcoming Meetings</h2>
              
              {upcomingMeetings.length === 0 ? (
                <p className="text-muted">No upcoming meetings scheduled.</p>
              ) : (
                <div className="list-group">
                  {upcomingMeetings.map(meeting => (
                    <Link 
                      to={`/meetings/${meeting._id}`} 
                      key={meeting._id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h5 className="mb-1">{meeting.title}</h5>
                        <p className="mb-1 text-muted">
                          <small>
                            <i className="far fa-calendar me-1"></i>
                            {formatDate(meeting.date)}
                            <span className="mx-2">•</span>
                            <i className="far fa-clock me-1"></i>
                            {meeting.duration} minutes
                          </small>
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(meeting.status, meeting.date)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {upcomingMeetings.length > 0 && (
                <div className="text-end mt-3">
                  <Button as={Link} to="/calendar" variant="outline-primary" size="sm">
                    View Calendar
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="h5 mb-3">Past Meetings</h2>
              
              {pastMeetings.length === 0 ? (
                <p className="text-muted">No past meetings found.</p>
              ) : (
                <div className="list-group">
                  {pastMeetings.slice(0, 5).map(meeting => (
                    <Link 
                      to={`/meetings/${meeting._id}`} 
                      key={meeting._id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h5 className="mb-1">{meeting.title}</h5>
                        <p className="mb-1 text-muted">
                          <small>
                            <i className="far fa-calendar me-1"></i>
                            {formatDate(meeting.date)}
                            <span className="mx-2">•</span>
                            <i className="far fa-clock me-1"></i>
                            {meeting.duration} minutes
                          </small>
                        </p>
                      </div>
                      <div className="d-flex align-items-center">
                        {meeting.summary?.isEdited && (
                          <Badge bg="info" className="me-2">Summarized</Badge>
                        )}
                        {getStatusBadge(meeting.status, meeting.date)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {pastMeetings.length > 5 && (
                <div className="text-end mt-3">
                  <Button as={Link} to="/meetings/history" variant="outline-primary" size="sm">
                    View All Past Meetings
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
