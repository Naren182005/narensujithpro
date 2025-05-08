import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';

const RecordMeeting = () => {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch meeting details
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
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);
  
  // Format recording time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      };
      
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check your permissions.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  // Process recording
  const processRecording = async () => {
    if (audioChunks.length === 0) {
      setError('No recording data available.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      // Send to transcription API
      const transcriptionRes = await axios.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setTranscript(transcriptionRes.data.transcript);
      
      // Update meeting with transcript
      await axios.post(`/api/meetings/${id}/transcript`, {
        transcript: transcriptionRes.data.transcript
      });
      
      // Generate summary
      const analysisRes = await axios.post('/api/analyze', {
        transcript: transcriptionRes.data.transcript,
        meetingType: meeting.meetingType
      });
      
      // Update meeting with summary
      await axios.put(`/api/meetings/${id}/summary`, {
        summary: analysisRes.data,
        isEdited: false
      });
      
      setIsProcessing(false);
      
      // Navigate to meeting detail page
      navigate(`/meetings/${id}`);
    } catch (err) {
      console.error('Error processing recording:', err);
      setError('Failed to process recording. Please try again.');
      setIsProcessing(false);
    }
  };
  
  // Discard recording
  const discardRecording = () => {
    setAudioChunks([]);
    setRecordingTime(0);
    setTranscript('');
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
          <Button variant="primary" onClick={() => navigate(`/meetings/${id}`)}>
            Return to Meeting
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
          <h1>Record Meeting</h1>
          <p className="text-muted">{meeting.title}</p>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body className="text-center py-5">
              {isProcessing ? (
                <div>
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Processing...</span>
                  </Spinner>
                  <h4 className="mt-3">Processing Recording</h4>
                  <p className="text-muted">
                    We're transcribing and analyzing your meeting. This may take a few minutes.
                  </p>
                </div>
              ) : isRecording ? (
                <div>
                  <div className="recording-indicator mx-auto mb-3" style={{ width: '30px', height: '30px' }}></div>
                  <h3 className="mb-4">Recording in Progress</h3>
                  <div className="display-4 mb-4">{formatTime(recordingTime)}</div>
                  <Button 
                    variant="danger" 
                    size="lg" 
                    onClick={stopRecording}
                    className="px-5"
                  >
                    <i className="fas fa-stop me-2"></i>
                    Stop Recording
                  </Button>
                </div>
              ) : audioChunks.length > 0 ? (
                <div>
                  <h3 className="mb-3">Recording Complete</h3>
                  <p className="mb-4">
                    <Badge bg="success">Recorded</Badge>
                    <span className="ms-2">{formatTime(recordingTime)}</span>
                  </p>
                  <audio controls className="w-100 mb-4">
                    <source src={URL.createObjectURL(new Blob(audioChunks, { type: 'audio/webm' }))} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                  <div className="d-flex justify-content-center">
                    <Button 
                      variant="secondary" 
                      onClick={discardRecording}
                      className="me-3"
                    >
                      <i className="fas fa-trash me-2"></i>
                      Discard
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={processRecording}
                    >
                      <i className="fas fa-check me-2"></i>
                      Process Recording
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="mb-4">Ready to Record</h3>
                  <p className="mb-4">
                    Click the button below to start recording your meeting.
                    Make sure your microphone is properly connected.
                  </p>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={startRecording}
                    className="px-5"
                  >
                    <i className="fas fa-microphone me-2"></i>
                    Start Recording
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>Recording Tips</h5>
              <hr />
              <ul className="mb-0">
                <li className="mb-2">
                  <strong>Quiet Environment:</strong> Find a quiet place to minimize background noise.
                </li>
                <li className="mb-2">
                  <strong>Speak Clearly:</strong> Encourage all participants to speak clearly and at a moderate pace.
                </li>
                <li className="mb-2">
                  <strong>Introductions:</strong> Have participants introduce themselves before speaking.
                </li>
                <li className="mb-2">
                  <strong>One at a Time:</strong> Avoid overlapping conversations for better transcription.
                </li>
                <li>
                  <strong>Key Terms:</strong> Define any specialized terms or acronyms for better context.
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RecordMeeting;
