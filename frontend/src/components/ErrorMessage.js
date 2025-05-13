import React from "react";

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div
      className="alert alert-danger text-center mt-5 mx-auto"
      style={{ maxWidth: "400px", padding: "20px" }}
    >
      <div>
        <i
          className="bi bi-exclamation-triangle-fill"
          style={{ fontSize: "2rem" }}
        ></i>
      </div>
      <p className="mt-3">{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
