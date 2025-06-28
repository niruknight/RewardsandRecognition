import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./hrpage.css";
import Navbar from "../components/navbar";

export default function HrPage() {
  const [nominations, setNominations] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reviewText, setReviewText] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchNominations();
  }, [selectedMonth]);

  const fetchNominations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5246/api/Hr/nominations?month=${selectedMonth}`);
      
      if (Array.isArray(res.data)) {
        setNominations(res.data);
      } else {
        setNominations([]);
        showAlert("Error", "Unexpected data format received", "error");
      }
    } catch (error) {
      console.error("Error fetching nominations:", error);
      setNominations([]);
      showAlert("Error", "Failed to load nominations", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (empId, awardType, action) => {
    try {
      await axios.post(`http://localhost:5246/api/Hr/updateStatus`, {
        empId,
        awardType,
        month: selectedMonth,
        action
      });

      showAlert("Success", `Status updated to ${action}`, "success");
      fetchNominations();
    } catch (error) {
      console.error("Error updating status:", error);
      showAlert("Error", "Failed to update status", "error");
    }
  };

  const submitReview = async (empId, awardType) => {
    const key = `${empId}-${awardType}`;
    if (!reviewText[key] || reviewText[key].trim() === "") {
      showAlert("Warning", "Please enter a review before submitting", "warning");
      return;
    }

    try {
      await axios.post(`http://localhost:5246/api/Hr/addReview`, {
        empId,
        awardType,
        month: selectedMonth,
        reviewText: reviewText[key]
      });

      showAlert("Success", "Review submitted successfully", "success");
      setReviewText(prev => ({ ...prev, [key]: "" }));
    } catch (error) {
      console.error("Error submitting review:", error);
      showAlert("Error", "Failed to submit review", "error");
    }
  };

  const showAlert = (title, message, icon) => {
    Swal.fire({
      title,
      text: message,
      icon,
      confirmButtonColor: "#007bff",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMonthName = (monthNum) => {
    return new Date(0, monthNum - 1).toLocaleString("default", { month: "long" });
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading nominations...</p>
    </div>
  );

  return (
    <>
          <Navbar/>
    <div className="hr-page">

      <div className="header">
        <h1>HR Awards Dashboard</h1>
        <div className="controls">
          <div className="month-selector-container">
            <label htmlFor="month-select">Month:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="month-selector"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMonthName(i + 1)}
                </option>
              ))}
            </select>
          </div>
          <div className="refresh-button" onClick={fetchNominations}>
            ↻ Refresh
          </div>
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-card">
          <h3>Total Nominations</h3>
          <p className="stat-number">{nominations.reduce((sum, award) => sum + award.nominees.length, 0)}</p>
        </div>
        <div className="stat-card">
          <h3>Award Categories</h3>
          <p className="stat-number">{nominations.length}</p>
        </div>
        <div className="stat-card">
          <h3>Winners</h3>
          <p className="stat-number">
            {nominations.reduce((sum, award) => sum + award.nominees.filter(n => n.status === "Winner").length, 0)}
          </p>
        </div>
      </div>

      <div className="awards-container">
        {nominations.length > 0 ? (
          nominations.map((awardGroup) => (
            <div key={awardGroup.awardType} className="award-group">
              <div className="award-header">
                <h3>{awardGroup.awardType}</h3>
                <span className="nominee-count">{awardGroup.nominees.length} nominees</span>
              </div>
              
              <div className="nominees-list">
                {awardGroup.nominees.map((nominee) => {
                  const reviewKey = `${nominee.empId}-${awardGroup.awardType}`;
                  return (
                    <div key={nominee.empId} className={`nominee-card status-${nominee.status.toLowerCase()}-card`}>
                      <div className="nominee-header">
                        <div className="nominee-name-dept">
                          <h4>{nominee.empName}</h4>
                          <span className="dept-badge">{nominee.dept}</span>
                        </div>
                        <div className={`status-badge status-${nominee.status.toLowerCase()}`}>
                          {nominee.status}
                        </div>
                      </div>
                      
                      <div className="nominee-details">
                        <div className="detail-row">
                          <span className="detail-label">Employee ID:</span>
                          <span className="detail-value">{nominee.empId}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Nominated On:</span>
                          <span className="detail-value">{formatDate(nominee.nominatedAt)}</span>
                        </div>
                        <div className="detail-row reason-row">
                          <span className="detail-label">Reason:</span>
                          <p className="reason-text">{nominee.reason}</p>
                        </div>
                      </div>
                      
                      <div className="action-section">
                        <h5>Update Status</h5>
                        <div className="action-buttons">
                          <button 
                            className="btn winner-btn"
                            disabled={nominee.status === "Winner"}
                            onClick={() => updateStatus(nominee.empId, awardGroup.awardType, "Winner")}
                          >
                            Mark as Winner
                          </button>
                          <button 
                            className="btn hold-btn"
                            disabled={nominee.status === "On Hold"}
                            onClick={() => updateStatus(nominee.empId, awardGroup.awardType, "Hold")}
                          >
                            Put on Hold
                          </button>
                        </div>
                      </div>
                      
                      <div className="hr-review-section">
                        <h5>HR Review</h5>
                        <textarea
                          placeholder="Add your review comments here..."
                          value={reviewText[reviewKey] || ""}
                          onChange={(e) => setReviewText(prev => ({...prev, [reviewKey]: e.target.value}))}
                        ></textarea>
                        <button 
                          className="btn submit-review-btn"
                          onClick={() => submitReview(nominee.empId, awardGroup.awardType)}
                        >
                          Submit Review
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <p>No nominations found for {getMonthName(selectedMonth)}.</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
