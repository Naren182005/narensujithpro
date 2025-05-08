import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import AuthContext from '../../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <Container>
      <Row className="align-items-center py-5">
        <Col md={6}>
          <h1 className="display-4 fw-bold">MemoMentor</h1>
          <h2 className="text-muted">Your Augment AI Meeting Assistant</h2>
          <p className="lead my-4">
            Never miss important details from your meetings again. MemoMentor helps you capture, 
            transcribe, and summarize meetings while keeping you in control of the process.
          </p>
          {isAuthenticated ? (
            <Button as={Link} to="/dashboard" variant="primary" size="lg" className="me-3">
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button as={Link} to="/register" variant="primary" size="lg" className="me-3">
                Get Started
              </Button>
              <Button as={Link} to="/login" variant="outline-primary" size="lg">
                Login
              </Button>
            </>
          )}
        </Col>
        <Col md={6} className="d-none d-md-block">
          <img 
            src="https://via.placeholder.com/600x400?text=MemoMentor" 
            alt="MemoMentor illustration" 
            className="img-fluid rounded shadow"
          />
        </Col>
      </Row>
      
      <Row className="py-5">
        <Col xs={12} className="text-center mb-4">
          <h2>How It Works</h2>
          <p className="text-muted">MemoMentor enhances your meeting experience in 3 simple steps</p>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="display-4 text-primary mb-3">1</div>
              <Card.Title>Record Your Meeting</Card.Title>
              <Card.Text>
                Start recording your meeting through our simple interface. 
                Works with virtual and in-person meetings.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="display-4 text-primary mb-3">2</div>
              <Card.Title>AI-Powered Analysis</Card.Title>
              <Card.Text>
                Our AI transcribes the conversation and identifies key points, 
                action items, and decisions.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="display-4 text-primary mb-3">3</div>
              <Card.Title>Review & Refine</Card.Title>
              <Card.Text>
                You maintain control by reviewing and editing the AI-generated 
                summary before sharing it.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="py-5 bg-light rounded">
        <Col xs={12} className="text-center mb-4">
          <h2>Why Choose MemoMentor?</h2>
        </Col>
        
        <Col md={6} className="mb-4">
          <div className="d-flex">
            <div className="me-3 text-primary">
              <i className="fas fa-brain fa-2x"></i>
            </div>
            <div>
              <h4>Augment, Not Replace</h4>
              <p>
                MemoMentor enhances your capabilities rather than replacing you. 
                You always have the final say on what's important.
              </p>
            </div>
          </div>
        </Col>
        
        <Col md={6} className="mb-4">
          <div className="d-flex">
            <div className="me-3 text-primary">
              <i className="fas fa-lock fa-2x"></i>
            </div>
            <div>
              <h4>Privacy-Focused</h4>
              <p>
                Your meeting data is secure and private. We don't store recordings 
                longer than necessary for processing.
              </p>
            </div>
          </div>
        </Col>
        
        <Col md={6} className="mb-4">
          <div className="d-flex">
            <div className="me-3 text-primary">
              <i className="fas fa-clock fa-2x"></i>
            </div>
            <div>
              <h4>Save Time</h4>
              <p>
                Reduce the time spent on meeting notes by up to 80%. Focus on 
                participation, not documentation.
              </p>
            </div>
          </div>
        </Col>
        
        <Col md={6} className="mb-4">
          <div className="d-flex">
            <div className="me-3 text-primary">
              <i className="fas fa-lightbulb fa-2x"></i>
            </div>
            <div>
              <h4>Continuous Learning</h4>
              <p>
                MemoMentor learns from your edits and preferences to improve 
                future summaries.
              </p>
            </div>
          </div>
        </Col>
      </Row>
      
      <Row className="py-5 text-center">
        <Col xs={12}>
          <h2>Ready to Transform Your Meetings?</h2>
          <p className="lead mb-4">
            Join thousands of professionals who are using MemoMentor to get more 
            value from their meetings.
          </p>
          {isAuthenticated ? (
            <Button as={Link} to="/meetings/new" variant="primary" size="lg">
              Schedule Your First Meeting
            </Button>
          ) : (
            <Button as={Link} to="/register" variant="primary" size="lg">
              Get Started for Free
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
