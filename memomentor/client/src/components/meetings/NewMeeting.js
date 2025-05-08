import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const NewMeeting = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingType: 'general',
    date: '',
    time: '',
    duration: 30,
    participants: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { title, description, meetingType, date, time, duration, participants } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!title) {
      errors.title = 'Title is required';
    }
    
    if (!date) {
      errors.date = 'Date is required';
    }
    
    if (!time) {
      errors.time = 'Time is required';
    }
    
    if (!duration) {
      errors.duration = 'Duration is required';
    } else if (isNaN(duration) || duration <= 0) {
      errors.duration = 'Duration must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Combine date and time
        const dateTime = new Date(`${date}T${time}`);
        
        // Parse participants emails
        const participantsList = participants
          ? participants.split(',').map(email => email.trim())
          : [];
        
        const meetingData = {
          title,
          description,
          meetingType,
          date: dateTime.toISOString(),
          duration: parseInt(duration),
          participants: participantsList
        };
        
        const res = await axios.post('/api/meetings', meetingData);
        
        setIsSubmitting(false);
        navigate(`/meetings/${res.data._id}`);
      } catch (err) {
        console.error('Error creating meeting:', err);
        setError(err.response?.data?.message || 'Failed to create meeting');
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Schedule New Meeting</h1>
        </Col>
      </Row>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3" controlId="title">
                  <Form.Label>Meeting Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={title}
                    onChange={onChange}
                    placeholder="Enter meeting title"
                    isInvalid={!!formErrors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.title}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={description}
                    onChange={onChange}
                    placeholder="Enter meeting description"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="meetingType">
                  <Form.Label>Meeting Type</Form.Label>
                  <Form.Select
                    name="meetingType"
                    value={meetingType}
                    onChange={onChange}
                  >
                    <option value="general">General</option>
                    <option value="standup">Stand-up</option>
                    <option value="planning">Planning</option>
                    <option value="retrospective">Retrospective</option>
                    <option value="client">Client Meeting</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    This helps our AI better understand the context of your meeting.
                  </Form.Text>
                </Form.Group>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="date">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={date}
                        onChange={onChange}
                        isInvalid={!!formErrors.date}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.date}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="time">
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="time"
                        value={time}
                        onChange={onChange}
                        isInvalid={!!formErrors.time}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.time}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3" controlId="duration">
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={duration}
                    onChange={onChange}
                    min="1"
                    isInvalid={!!formErrors.duration}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.duration}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="participants">
                  <Form.Label>Participants (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="participants"
                    value={participants}
                    onChange={onChange}
                    placeholder="Enter email addresses, separated by commas"
                  />
                  <Form.Text className="text-muted">
                    Enter email addresses of participants, separated by commas.
                  </Form.Text>
                </Form.Group>
                
                <div className="d-flex justify-content-end mt-4">
                  <Button 
                    variant="secondary" 
                    className="me-2"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Schedule Meeting'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Meeting Tips</h5>
              <hr />
              <p>
                <strong>Clear Title:</strong> Use a descriptive title that clearly 
                communicates the purpose of the meeting.
              </p>
              <p>
                <strong>Meeting Type:</strong> Selecting the right meeting type helps 
                our AI better understand the context and generate more relevant summaries.
              </p>
              <p>
                <strong>Participants:</strong> Adding participants will allow them to 
                access the meeting details and summary.
              </p>
              <p>
                <strong>Duration:</strong> Keep meetings focused by setting an 
                appropriate time limit.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NewMeeting;
