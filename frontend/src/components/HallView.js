import React from "react";
import "../styles/hall_view.css"; // Adjust the path as necessary

const HallView = ({ rows, onSeatClick, selectedSeats = [] }) => {
  return (
    <div>
      <div className="screen">Screen</div>
      <div className="hall-layout">
        {rows.map((row) => (
          <div key={row.id} className="row-layout">
            <div className="row-number">{row.row_number}</div>
            <div className="seats-layout">
              {row.seats.map((seat) => (
                <div
                  key={seat.id || seat.seat_number}
                  className={`seat-box ${
                    seat.is_reserved
                      ? "reserved"
                      : selectedSeats.includes(seat.id)
                      ? "selected"
                      : "available"
                  }`}
                  onClick={() =>
                    onSeatClick && !seat.is_reserved && onSeatClick(seat.id)
                  }
                >
                  {seat.seat_number}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HallView;
