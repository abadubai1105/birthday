import React from 'react';
// Đã sửa lỗi: FaCalendarAlt -> FaCalendarDays và FaMapMarkerAlt -> FaLocationDot
import { FaHeart, FaCalendarDays, FaClock, FaLocationDot } from 'react-icons/fa6'; 
import './LoveThemeInviteCard.css'; 

// Component Pháo hoa (Fireworks)
const Fireworks = () => (
    <div className="fireworks-container">
        <div className="firework"></div>
        <div className="firework"></div>
        <div className="firework"></div>
        <div className="firework"></div>
        <div className="firework"></div> {/* Đã thêm 1 pháo hoa */}
    </div>
);


const LoveThemeInviteCard = ({ names, eventType, date, time, location, message, rsvpLink }) => {
  return (
    <>
      {/* Container pháo hoa chạy nền */}
      <Fireworks /> 
      
      <div className="love-card-container">
        <div className="love-card-inner">
          
          <h1 className="main-title">
            <FaHeart className="icon heart-icon" /> {eventType.toUpperCase()} <FaHeart className="icon heart-icon" />
          </h1>
          
          <p className="invitation-text">{message || `Gửi em yêu,`}</p>
          <p className="invitation-text">
            Em là điều tuyệt vời nhất trong cuộc đời anh. 
            Anh muốn mời người con gái đặc biệt nhất của anh 
            đến dự bữa tiệc lãng mạn mà anh đã chuẩn bị riêng cho em.
          </p>
          
          <h2 className="couple-names">
            <span className="name">Anh</span> 
            <span className="and-text">Mời</span>
            <span className="name">{names}</span> {/* {names} là tên người yêu */}
          </h2>
          <p className="invitation-text">Hãy cùng nhau ăn mừng tuổi mới và tạo thêm những kỷ niệm ngọt ngào nhé!</p>

          <div className="details-section">
            <div className="detail-item">
              <FaCalendarDays className="icon detail-icon" />
              <span>**Thời gian:** {date}</span>
            </div>
            <div className="detail-item">
              <FaClock className="icon detail-icon" />
              <span>**Đúng:** {time}</span>
            </div>
            <div className="detail-item">
              <FaLocationDot className="icon detail-icon" />
              <span>**Địa điểm:** {location}</span>
            </div>
          </div>
          
          <p className="footer-text">Happy birthday Tình iu</p>
          <p className="footer-text">Yêu em!</p>

          {/* {rsvpLink && (
            <a 
              href={rsvpLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="rsvp-button-love"
            >
              <FaChampagneGlasses className="icon button-icon" /> Xác nhận Tham Dự <FaGift className="icon button-icon" />
            </a>
          )} */}
        </div>
      </div>
    </>
  );
};

export default LoveThemeInviteCard;