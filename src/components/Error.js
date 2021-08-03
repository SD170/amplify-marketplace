import React from "react";

const Error = ({ errors }) => {
  return (
    <pre className="error">
      {errors.map((error, i) => (
        <div key={i}>{error.message}</div>
      ))}
    </pre>
  );
};

export default Error;
