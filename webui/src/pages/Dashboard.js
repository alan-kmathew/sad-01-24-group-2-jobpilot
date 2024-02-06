import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import MyJob from '../../src/pages/MyJob/MyJob.js';
import AssistantAI from '../pages/AssistantAI.js';
import AboutUs from '../pages/AboutUs.js';
import JobSearch from '../pages/Home/JobSearch.js';
import Header from '../pages/Header.js';
import UserPage from '../pages/UserPage.js';
import Footer from '../pages/Footer.js';
import '../styles/Dashboard.css';
import Cookies from 'js-cookie';
import Loading from '../components/loader/loading.jsx';
import { fetchMyJobData } from '../apicalls/api.js';
import { handleApiError } from '../apicalls/helpers.js';

const Dashboard = () => {
  const navigate = useNavigate(); // Create a history object
  const [selectedPage, setSelectedPage] = useState('Home');
  const [loading, setLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState([
    { type: 'ai', text: 'Hello! How can I assist you today?' }
  ]);
  const [userData, setUserData] = useState({});
  const [myJobData, setMyJobData] = useState(null);

  useEffect(() => {
    const email = Cookies.get('email');
    const accessToken = Cookies.get('access_token');
    const expiryDate = Cookies.get('expiry_date');
    const refreshToken = Cookies.get('refresh_token');

    setUserData({ email, accessToken, expiryDate, refreshToken });

    if (email && accessToken) {
      const fetchDataFromApi = async () => {
        try {
     
          setLoading(true);
          const result = await fetchMyJobData({ email, accessToken, expiryDate, refreshToken });
          setMyJobData(result);
        } catch (error) {
          handleApiError(error);
          // Check for a 500 error and redirect to the login screen
          if (error.response && error.response.status === 500 && selectedPage === 'MyJob') {
            navigate('/login'); // Redirect to the login page
          }
        } finally {
          setTimeout(() => setLoading(false), 3300)
        }
      };
      fetchDataFromApi();
    }
  }, [selectedPage, navigate]);

  const handleSelection = (page) => {
    setSelectedPage(page);
  };

  const renderPage = () => {
    switch (selectedPage) {
      case 'MyJob':
        if (loading) {
          return<Loading/>
        } 
        else if (myJobData === null) {
          return (
            <div style={{ textAlign: 'center', paddingTop: '50px' }}>
              <p style={{ fontSize: '30px', fontWeight: 'bold' }}>404 Page Not Found</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Please contact admin</p>
            </div>
          );
        }
        return <MyJob myJobData={myJobData} />;
      case 'AssistantAI':
        return <AssistantAI messages={assistantMessages} setMessages={setAssistantMessages} />;
      case 'AboutUs':
        return <AboutUs />;
      default:
        return <JobSearch />;
    }
  };

  return (
    <div className="app-container">
      <Header onSelection={handleSelection} currentPage={selectedPage} />
      <div className="page-content">
        {renderPage()}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
