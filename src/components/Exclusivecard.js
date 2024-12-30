'use client';
import React from 'react';
import styles from '../app/styles/Card.module.css';

function Card() {
  const handleJoinClick = () => {
    alert('Thanks for joining our exclusive riders community!');
    window.location.href = 'https://www.maddycustom.com/';
  };

  return (
    // <a href="https://your-desired-link.com" className={styles.cardLink}>
    <div className={styles.card}>
      {/* Right side with the text/content */}
      <div className={styles.cardContent}>
        <h1 className={styles.cardTitle}>
          <span role="img" aria-label="sparkles">🌟</span>
          Join Our Exclusive Riders Community!
          <span role="img" aria-label="sparkles">🌟</span>

          <img
            className={styles.waIcon}
            src="./whatsapp.png"
            alt="WhatsApp Icon"
          />
        </h1>
        <ul className={styles.cardBenefits}>
          <li>💬 Be the first to know about new launches &amp; discounts</li>
          <li>🎁 Get exclusive deals and rewards only for community members</li>
          <li>❤️ Connect with like-minded people</li>
        </ul>
        <button className={styles.joinButton} onClick={handleJoinClick}>
          Join Now!
        </button>
      </div>

      {/* Left side with the image */}
      <div className={styles.cardImage}>
        <img
          src="/carcomponent.png"
          alt="Car Illustration"
          className={styles.cardImageAdjusted}
        />
      </div>
    </div>
  );
}

export default Card;
