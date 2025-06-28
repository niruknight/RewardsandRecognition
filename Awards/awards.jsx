import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "../Awards/awards.css";
import confetti from "canvas-confetti";

const Awards = () => {
  const [awards, setAwards] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // Holds selected month
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch awards when the month is selected
  useEffect(() => {
    if (!selectedMonth) return; // Don't fetch if no month is selected

    const fetchAwards = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5246/api/Awards?month=${selectedMonth}`);
        if (!response.ok) throw new Error("Failed to fetch awards");
        const data = await response.json();
        setAwards(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, [selectedMonth]);

  // Function to trigger confetti
  useEffect(() => {
    if (awards.length > 0) {
      const launchConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const interval = setInterval(() => {
          if (Date.now() > animationEnd) {
            clearInterval(interval);
            return;
          }
          confetti({
            particleCount: 10,
            spread: 160,
            startVelocity: 30,
            origin: { x: Math.random(), y: Math.random() * 0.6 },
          });
        }, 200);
      };
      launchConfetti();
    }
  }, [awards]);

  // Get Star of the Month
  const starOfTheMonth = awards.find((award) => award.awardType === "STAR OF THE MONTH");

  return (
    <div>
      <Navbar />
      <div className="awards-section">
        <h1>🏆 Our Prestigious Awards 🏆</h1>
        <p>Recognizing and celebrating excellence in various fields.</p>

        {/* Month Selector */}
        <label htmlFor="month-select">Select a Month: </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">-- Select Month --</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        {loading && <p>Loading awards...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && !selectedMonth && <p>Please select a month to view winners.</p>}

        {!loading && !error && selectedMonth && awards.length === 0 && (
          <p>No awards found for this month.</p>
        )}

        {/* Star of the Month */}
        {!loading && !error && starOfTheMonth && starOfTheMonth.winners.length > 0 && (
          <div className="star-of-the-month">
            <img src="crown.png" alt="Crown" className="crown-icon" />
            <div className="profile-container">
              <img src="images.png" alt="Star of the Month" className="profile-pic" />
              <h2 className="star-name">{starOfTheMonth.winners[0].empName}</h2>
            </div>
            <h3>⭐ Star of the Month ⭐</h3>
            <p>{starOfTheMonth.winners[0].reason}</p>
          </div>
        )}

        {/* Awards Section */}
        {!loading && !error && awards.length > 0 && (
          <div className="awards-container">
            {awards.map((award) => (
              <div className="award-card" key={award.awardType}>
                <h3>{award.awardType}</h3>
                {award.winners.map((winner) => (
                  <div key={winner.empId} className="winner-info">
                    <p>
                      <strong>{winner.empName}</strong> ({winner.dept})
                    </p>
                    <p>{winner.reason}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Awards;
