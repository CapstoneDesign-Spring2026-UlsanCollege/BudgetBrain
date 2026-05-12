import React from "react";

export default function WelcomeBanner({ userName }) {
  return (
    <section className="welcome-banner glass-card">
      <div className="banner-content">
        <h1>Welcome back, <span className="highlight">{userName || "Friend"}</span> 👋</h1>
        <p>Here’s a quick glance at your finances and recent activity.</p>
      </div>
      <div className="banner-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>
    </section>
  );
}
