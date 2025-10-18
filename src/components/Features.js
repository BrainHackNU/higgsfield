import React from "react";
import "./Features.css";

export default function Features() {
  return (
    <section id="features" className="features">
      <h2>Why Higgsfield?</h2>
      <div className="feature-list">
        <div className="feature">
          <h3>Fast Generation</h3>
          <p>Create video in seconds, not hours.</p>
        </div>
        <div className="feature">
          <h3>Creative Freedom</h3>
          <p>Control styles, scenes, and storytelling.</p>
        </div>
        <div className="feature">
          <h3>AI Intelligence</h3>
          <p>Backed by cutting-edge deep learning models.</p>
        </div>
      </div>
    </section>
  );
}
