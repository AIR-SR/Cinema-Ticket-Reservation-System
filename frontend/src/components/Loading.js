import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="text-center mt-5">
      {/* <ToastContainer /> */}
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">{message}</p>
    </div>
  );
};

export default Loading;
