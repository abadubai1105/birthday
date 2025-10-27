import React from 'react';
import LoveThemeInviteCard from './LoveThemeInviteCard'; 

function App() {
  // THÔNG TIN BẠN CẦN THAY ĐỔI
  const partnerName = "Tình iu"; // Tên người yêu của bạn

  return (
    <div className="App">
      <LoveThemeInviteCard 
        names={partnerName}
        eventType="Sinh Nhật"
        date="Thứ Bảy, 1 tháng 11 năm 2025"
        time="19:30"
        location="Bí mật"
      />
    </div>
  );
}

export default App;