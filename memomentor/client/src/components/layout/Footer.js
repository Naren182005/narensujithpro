import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light py-3 mt-auto">
      <div className="container text-center">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} MemoMentor - Augment AI Meeting Assistant
        </p>
        <small className="text-muted">
          Enhancing human capabilities, not replacing them
        </small>
      </div>
    </footer>
  );
};

export default Footer;
