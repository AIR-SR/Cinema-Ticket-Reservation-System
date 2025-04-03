import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // Adjust the import path as necessary

const Homepage = () => {
    const navigate = useNavigate();
    const [apiStatus, setApiStatus] = useState(null);
    const [apiMessage, setApiMessage] = useState("");

    useEffect(() => {
        const checkApiHealth = async () => {
          try {
            const response = await api.get("/health"); // Assuming your API has a `/health` endpoint
            console.log("API Health Response:", response.data);
    
            // Ensure response has the expected structure
            if (response.data.status === "ok" && response.data.message) {
              setApiStatus("connected");
              setApiMessage(response.data.message);
            } else {
              setApiStatus("misconfigured");
              setApiMessage("Unexpected API response format.");
            }
          } catch (error) {
            console.error("API health check failed:", error);
            setApiStatus("disconnected");
            setApiMessage("API is not reachable.");
          }
        };
    
        checkApiHealth();
    }, []);
    

    return (
        <div className="container mt-5">
            <h1>Homepage</h1>

            {apiStatus === "disconnected" && (
                <div className="alert alert-danger text-center">
                    ⚠️ Unable to connect to the API. Please check your network or backend service.
                </div>
            )}
      
            {apiStatus === "misconfigured" && (
                <div className="alert alert-warning text-center">
                    ⚠️ API is reachable but returned an unexpected response format.
                </div>
            )}

            {apiStatus === "connected" && (
                <div className="alert alert-success text-center">
                    ✅ {apiMessage}
                </div>
            )}
        </div>
    );

}

export default Homepage;