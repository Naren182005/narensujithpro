import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';

const MeetingDetail = () => {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await axios.get(`/api/meetings/${id}`);
        setMeeting(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching meeting:', err);
        setError('Failed to load meeting details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMeeting();
  }, [id]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
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
  
  // Check if meeting is upcoming
  const isUpcoming = (meeting) => {
    if (!meeting) return false;
    
    const meetingDate = new Date(meeting.date);
    const now = new Date();
    
    return meetingDate > now && meeting.status !== 'cancelled';
  };
  
  // Check if meeting can be recorded
  const canRecord = (meeting) => {
    if (!meeting) return false;
    
    const meetingDate = new Date(meeting.date);
    const now = new Date();
    const fiveMinutesBefore = new Date(meetingDate.getTime() - 5 * 60000);
    
    return (now >= fiveMinutesBefore && meeting.status !== 'completed' && meeting.status !== 'cancelled');
  };
  
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading meeting details...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
        </Alert>
        <div className="text-center mt-4">
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Container>
    );
  }
  
  if (!meeting) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Meeting not found.
        </Alert>
        <div className="text-center mt-4">
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>{meeting.title}</h1>
          <div className="d-flex align-items-center">
            {getStatusBadge(meeting.status, meeting.date)}
            <span className="ms-3 text-muted">
              <i className="far fa-calendar me-1"></i>
              {formatDate(meeting.date)}
            </span>
            <span className="ms-3 text-muted">
              <i className="far fa-clock me-1"></i>
              {meeting.duration} minutes
            </span>
          </div>
        </Col>
        <Col xs="auto">
          {canRecord(meeting) && (
            <Button 
              as={Link} 
              to={`/meetings/${meeting._id}/record`}
              variant="primary"
              className="me-2"
            >
              <i className="fas fa-microphone me-2"></i>
              Record Meeting
            </Button>
          )}
          
          {isUpcoming(meeting) && (
            <Button variant="outline-secondary">
              <i className="fas fa-edit me-2"></i>
              Edit
            </Button>
          )}
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5>Meeting Details</h5>
              <hr />
              
              {meeting.description && (
                <div className="mb-3">
                  <h6>Description</h6>
                  <p>{meeting.description}</p>
                </div>
              )}
              
              <div className="mb-3">
                <h6>Meeting Type</h6>
                <p className="text-capitalize">{meeting.meetingType}</p>
              </div>
              
              <div className="mb-3">
                <h6>Organizer</h6>
                <p>{meeting.organizer?.name || 'Unknown'}</p>
              </div>
              
              {meeting.participants && meeting.participants.length > 0 && (
                <div>
                  <h6>Participants</h6>
                  <ul className="list-unstyled">
                    {meeting.participants.map((participant, index) => (
                      <li key={index}>{participant.name || participant}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {meeting.transcript && (
            <Card className="shadow-sm">
              <Card.Body>
                <Tabs defaultActiveKey="summary" className="mb-3">
                  <Tab eventKey="summary" title="Summary">
                    {meeting.summary ? (
                      <div>
                        <h5>Key Points</h5>
                        <ul>
                          {meeting.summary.userEdited?.keyPoints?.map((point, index) => (
                            <li key={index}>{point}</li>
                          )) || meeting.summary.aiGenerated?.keyPoints?.map((point, index) => (
                            <li key={index}>{point}</li>
                          )) || <li>No key points identified</li>}
                        </ul>
                        
                        <h5>Decisions</h5>
                        <ul>
                          {meeting.summary.userEdited?.decisions?.map((decision, index) => (
                            <li key={index}>{decision}</li>
                          )) || meeting.summary.aiGenerated?.decisions?.map((decision, index) => (
                            <li key={index}>{decision}</li>
                          )) || <li>No decisions identified</li>}
                        </ul>
                        
                        <h5>Action Items</h5>
                        <ul>
                          {meeting.summary.userEdited?.actionItems?.map((item, index) => (
                            <li key={index}>
                              {item.description}
                              {item.assignee && <span className="text-primary"> ({item.assignee})</span>}
                            </li>
                          )) || meeting.summary.aiGenerated?.actionItems?.map((item, index) => (
                            <li key={index}>
                              {item.description}
                              {item.assignee && <span className="text-primary"> ({item.assignee})</span>}
                            </li>
                          )) || <li>No action items identified</li>}
                        </ul>
                        
                        <h5>Questions for Follow-up</h5>
                        <ul>
                          {meeting.summary.userEdited?.questions?.map((question, index) => (
                            <li key={index}>{question}</li>
                          )) || meeting.summary.aiGenerated?.questions?.map((question, index) => (
                            <li key={index}>{question}</li>
                          )) || <li>No questions identified</li>}
                        </ul>
                        
                        <div className="text-end mt-4">
                          <Button variant="outline-primary" size="sm">
                            <i className="fas fa-edit me-2"></i>
                            Edit Summary
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p>No summary available yet.</p>
                        <Button variant="primary">
                          Generate Summary
                        </Button>
                      </div>
                    )}
                  </Tab>
                  <Tab eventKey="transcript" title="Full Transcript">
                    <div className="transcript-container p-3 bg-light rounded">
                      <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {meeting.transcript}
                      </pre>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5>Actions</h5>
              <hr />
              
              <div className="d-grid gap-2">
                {canRecord(meeting) && (
                  <Button 
                    as={Link} 
                    to={`/meetings/${meeting._id}/record`}
                    variant="primary"
                  >
                    <i className="fas fa-microphone me-2"></i>
                    Record Meeting
                  </Button>
                )}
                
                {meeting.transcript && !meeting.summary && (
                  <Button variant="outline-primary">
                    <i className="fas fa-magic me-2"></i>
                    Generate Summary
                  </Button>
                )}
                
                {meeting.summary && (
                  <Button variant="outline-primary">
                    <i className="fas fa-share-alt me-2"></i>
                    Share Summary
                  </Button>
                )}
                
                {isUpcoming(meeting) && (
                  <>
                    <Button variant="outline-secondary">
                      <i className="fas fa-edit me-2"></i>
                      Edit Meeting
                    </Button>
                    
                    <Button variant="outline-danger">
                      <i className="fas fa-times me-2"></i>
                      Cancel Meeting
                    </Button>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
          
          {meeting.transcript && meeting.summary && (
            <Card className="shadow-sm">
              <Card.Body>
                <h5>AI Insights</h5>
                <hr />
                
                <p>
                  <strong>Meeting Efficiency:</strong> 85%
                </p>
                <div className="progress mb-3">
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: '85%' }} 
                    aria-valuenow={85} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                  ></div>
                </div>
                
                <p>
                  <strong>Participation Balance:</strong> 70%
                </p>
                <div className="progress mb-3">
                  <div 
                    className="progress-bar bg-info" 
                    role="progressbar" 
                    style={{ width: '70%' }} 
                    aria-valuenow={70} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                  ></div>
                </div>
                
                <p>
                  <strong>Action Item Clarity:</strong> 90%
                </p>
                <div className="progress mb-3">
                  <div 
                    className="progress-bar bg-primary" 
                    role="progressbar" 
                    style={{ width: '90%' }} 
                    aria-valuenow={90} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                  ></div>
                </div>
                
                <div className="mt-3">
                  <h6>Top Topics</h6>
                  <div>
                    <Badge bg="secondary" className="me-2 mb-2">Product Roadmap</Badge>
                    <Badge bg="secondary" className="me-2 mb-2">Q3 Goals</Badge>
                    <Badge bg="secondary" className="me-2 mb-2">Customer Feedback</Badge>
                    <Badge bg="secondary" className="me-2 mb-2">Timeline</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default MeetingDetail;
