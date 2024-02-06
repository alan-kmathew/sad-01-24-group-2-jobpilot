import axios from "axios";

const API_URL = "http://localhost:5074/api/ai";

export const sendMessageToAssistant = async (message) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, { question: message });
    return response.data;
  } catch (error) {
    console.error("Error sending message to assistant:", error);
    throw error;
  }
};

export const createNewThread = async () => {
  try {
    const response = await axios.post(`${API_URL}/create-thread`);
    return response.data;

  } catch (error) {
    console.error("Error creating new thread:", error);
    throw error;
  }
};
