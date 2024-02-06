import React from 'react';
import '../styles/AboutUs.css';



const About = () => {
  return (
    <div className="about-section">
      <h1>About Us Page</h1>

      <h2>Our Team</h2>
      <div className="team-section">
        <div className="team-card">
          <img src="https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg" alt="Team member 1" />
          <div className="container">
            <h2>Adith Adithya</h2>
            <p className="titleAboutUs">Frontend Developer</p>
          </div>
        </div>

        <div className="team-card">
          <img src="https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg" alt="Team member 2" />
          <div className="container">
            <h2>Alan K Mathew</h2>
            <p className="titleAboutUs">Frontend Developer</p>
          </div>
        </div>

        <div className="team-card">
          <img src="https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg" alt="Team member 3" />
          <div className="container">
            <h2> Mahesh Nidugala</h2>
            <p className="titleAboutUs">Backend Developer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;