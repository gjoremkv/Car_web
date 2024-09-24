import React from 'react';
import './Info.css';

const Info = () => {
  return (
    <div className="sell-page">
      <div className="info-section">
        <h2>How to Sell a Car</h2>
        <p>1. Register an account to get started with selling your car.</p>
        <p>2. Create a listing by providing details like model, year, and price.</p>
        <p>3. Communicate easily with potential buyers through our integrated chat feature.</p>
        <p>4. Boost your car listing with our Premium Subscription for only €20 a month to get more visibility and increase your chances of selling.</p>
      </div>

      <div className="info-section">
        <h2>Why Choose Us?</h2>
        <ul>
          <li>Easy and secure way to buy and sell cars.</li>
          <li>Chat directly with buyers and sellers.</li>
          <li>Promote your car with our Premium Subscription.</li>
          <li>Reliable customer support to assist you at every step.</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>Customer Support</h2>
        <p>If you have any questions or need assistance, our support team is here to help. Contact us via email or live chat for quick responses.</p>
      </div>

      <div className="info-section">
        <h2>Frequently Asked Questions (FAQ)</h2>
        <p><strong>Q: How do I register an account?</strong></p>
        <p>A: Click the 'Register' button at the top of the page and follow the steps to create your account.</p>
        <p><strong>Q: How do I promote my car listing?</strong></p>
        <p>A: After creating a car listing, you can choose to upgrade to our Premium Subscription for €20 a month for increased visibility.</p>
        <p><strong>Q: Can I chat with buyers directly?</strong></p>
        <p>A: Yes, once your listing is live, buyers can contact you directly via our integrated chat feature.</p>
      </div>
    </div>
  );
};

export default Info;
