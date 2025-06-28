import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/navbar";
import Swal from "sweetalert2";
import "./manager.css";

const Manager = () => {
  // State variables
  const [employees, setEmployees] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nominated, setNominated] = useState(null);
  const [nominationReason, setNominationReason] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchId, setSearchId] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [isScrolling, setIsScrolling] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const employeeContainerRef = useRef(null);
  const [nominations, setNominations] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Award categories mapping (frontend display name to API value)
  const awardCategories = [
    { display: "Employee of the Month", value: "Employee of the Month" },
    { display: "Outstanding Achievement", value: "Outstanding Achievement" },
    { display: "Innovation Award", value: "Innovation Award" },
    { display: "Team Player Award", value: "Team Player Award" },
    { display: "Leadership Excellence", value: "Leadership Excellence" },
    { display: "Customer Service Star", value: "Customer Service Star" },
    { display: "Rookie of the Year", value: "Rookie of the Year" }
  ];

  // Month mapping (frontend display name to API value 1-12)
  const monthMapping = {
    "January": 1, "February": 2, "March": 3, "April": 4,
    "May": 5, "June": 6, "July": 7, "August": 8,
    "September": 9, "October": 10, "November": 11, "December": 12
  };

  // Get manager ID from localStorage
  const getManagerId = () => {
    return localStorage.getItem('employeeId') || "";
  };

  // Fetch employees data from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const managerId = getManagerId();
        
        if (!managerId) {
          throw new Error("Manager ID not found in localStorage");
        }

        const response = await fetch(`http://localhost:5246/api/Manager/employees?managerEmpId=${managerId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching employees: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transform API data to match our component's expected format
        const transformedData = data.map(emp => ({
          id: emp.empId,
          name: emp.empName,
          department: "Same as manager", // Department information not provided by API
          image: "https://randomuser.me/api/portraits/men/1.jpg", // Placeholder
        }));
        
        setEmployees(transformedData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Handle nomination submission to API
  const submitNominationToAPI = async (employee, reason, month, category) => {
    try {
      const managerId = getManagerId();
      
      if (!managerId) {
        throw new Error("Manager ID not found in localStorage");
      }

      // Convert selected month to numeric value (1-12)
      const monthValue = monthMapping[month];
      
      // Find the award category value from the display name
      const awardTypeValue = awardCategories.find(cat => cat.display === category)?.value;
      
      if (!awardTypeValue) {
        throw new Error("Invalid award category");
      }

      const response = await fetch('http://localhost:5246/api/Manager/nominate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          managerEmpId: managerId,
          nomineeEmpId: employee.id,
          awardType: awardTypeValue,
          month: monthValue,
          reason: reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit nomination");
      }

      return await response.json();
    } catch (err) {
      console.error("Nomination submission failed:", err);
      throw err;
    }
  };

  // Handle nomination
  const handleNominate = (employee) => {
    if (!selectedMonth || !selectedCategory) {
      Swal.fire({
        title: "Missing Information",
        text: "Please select both a month and award category before nominating.",
        icon: "warning"
      });
      return;
    }

    Swal.fire({
      title: `Nominate ${employee.name}?`,
      html: `
        <p>You're nominating for: <strong>${selectedCategory}</strong></p>
        <p>Month: <strong>${selectedMonth}</strong></p>
        <textarea id="nomination-reason" class="swal2-textarea" placeholder="Why are you nominating this employee? (Required)"></textarea>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Nominate",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const reason = document.getElementById('nomination-reason').value;
        if (!reason) {
          Swal.showValidationMessage('Please provide a reason for the nomination');
          return false;
        }
        return reason;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const reason = result.value;
        
        try {
          // Show loading state
          Swal.fire({
            title: 'Submitting nomination...',
            didOpen: () => {
              Swal.showLoading();
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false
          });
          
          // Submit nomination to API
          const response = await submitNominationToAPI(
            employee, 
            reason, 
            selectedMonth, 
            selectedCategory
          );
          
          // Update local state
          setNominated(employee.id);
          setNominationReason(reason);
          
          // Add to nominations list
          const newNomination = {
            employeeId: employee.id,
            employeeName: employee.name,
            department: employee.department,
            month: selectedMonth,
            category: selectedCategory,
            reason: reason,
            timestamp: new Date().toISOString()
          };
          
          setNominations([...nominations, newNomination]);
          
          // Show success message
          Swal.fire({
            title: "Nominated!",
            html: `<p>${employee.name} has been nominated for <strong>${selectedCategory}</strong>.</p>
                  <p>Your nomination has been sent to HR.</p>`,
            icon: "success"
          });
        } catch (error) {
          // Show error message
          Swal.fire({
            title: "Nomination Failed",
            text: error.message || "There was a problem submitting your nomination.",
            icon: "error"
          });
        }
      }
    });
  };

  // Get unique departments for filter dropdown
  const departments = [...new Set(employees.map(emp => emp.department))];

  // Handle scroll event
  const handleScroll = (event) => {
    event.preventDefault();
    if (isScrolling || !employeeContainerRef.current.contains(event.target)) return;

    setIsScrolling(true);
    setAnimate(true);
    
    setTimeout(() => {
      if (event.deltaY > 0) {
        setCurrentIndex((prev) => Math.min(prev + 1, filteredEmployees.length - 1));
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
      setIsScrolling(false);
      
      setTimeout(() => {
        setAnimate(false);
      }, 400);
    }, 300);
  };

  useEffect(() => {
    const preventPageScroll = (event) => {
      if (employeeContainerRef.current && employeeContainerRef.current.contains(event.target)) {
        event.preventDefault();
      }
    };
    document.addEventListener("wheel", preventPageScroll, { passive: false });
    return () => document.removeEventListener("wheel", preventPageScroll);
  }, []);

  // Handle card navigation
  const handleCardNavigation = (direction) => {
    setAnimate(true);
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentIndex((prev) => Math.min(prev + 1, filteredEmployees.length - 1));
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
      
      setTimeout(() => {
        setAnimate(false);
      }, 100);
    }, 150);
  };

  // Filter employees based on all criteria
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      emp.id.toString().includes(searchId) &&
      (departmentFilter === "" || emp.department === departmentFilter)
  );

  // Reset current index when filters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [searchTerm, searchId, departmentFilter]);

  // View nominations
  const handleViewNominations = () => {
    if (nominations.length === 0) {
      Swal.fire({
        title: "No Nominations",
        text: "You haven't made any nominations yet.",
        icon: "info"
      });
      return;
    }

    let nominationsHtml = `
      <div class="nominations-list">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Employee</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Award</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Month</th>
            </tr>
          </thead>
          <tbody>
    `;

    nominations.forEach(nom => {
      nominationsHtml += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${nom.employeeName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${nom.category}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${nom.month}</td>
        </tr>
      `;
    });

    nominationsHtml += `
        </tbody>
      </table>
    </div>`;

    Swal.fire({
      title: "Your Nominations",
      html: nominationsHtml,
      width: 600,
      confirmButtonText: "Close"
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSearchId("");
    setDepartmentFilter("");
    setCurrentIndex(0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="create-award">
        <Navbar />
        <div className="container">
          <h1>Loading employees...</h1>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="create-award">
        <Navbar />
        <div className="container">
          <h1>Error</h1>
          <p>{error}</p>
          <p>Make sure you are logged in as a manager and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="create-award">


      <div className="container">
        <div className="award-header">
          <h1>Employee Recognition</h1>
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === "card" ? "active" : ""}`}
              onClick={() => setViewMode("card")}
            >
              Card View
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              List View
            </button>
          </div>
        </div>

        {/* Award Details */}
        <div className="award-details">
          <div className="award-selection">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-select"
            >
              <option value="">Select Month</option>
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">Select Award Category</option>
              {awardCategories.map((category) => (
                <option key={category.value} value={category.display}>{category.display}</option>
              ))}
            </select>
          </div>

          <div className="nomination-actions">
            <button onClick={handleViewNominations} className="view-nominations-btn">
              View Nominations
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <h3>Filters</h3>
          <div className="filters">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search by Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search by ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="id-input"
              />
            </div>
            
            <div className="filter-group">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="department-select"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <button onClick={clearAllFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Employee Display - Card View */}
        {viewMode === "card" && (
          <div className="card-view-container">
            <div className="navigation-controls">
              <button
                className="nav-btn prev-btn"
                onClick={() => handleCardNavigation('prev')}
                disabled={currentIndex === 0}
              >
                ←
              </button>
              <span className="pagination-info">
                {filteredEmployees.length > 0 ?
                  `${currentIndex + 1} of ${filteredEmployees.length}` :
                  "No employees found"}
              </span>
              <button
                className="nav-btn next-btn"
                onClick={() => handleCardNavigation('next')}
                disabled={currentIndex >= filteredEmployees.length - 1}
              >
                →
              </button>
            </div>

            <div
              className="employee-container"
              ref={employeeContainerRef}
              onWheel={handleScroll}
            >
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee, index) => (
                  <div
                    key={employee.id}
                    className={`employee-card ${nominated === employee.id ? "nominated" : ""} ${animate ? "animate" : ""}`}
                    style={{
                      display: index === currentIndex ? "block" : "none",
                    }}
                  >
                    <div className="card-content">
                      <div className="employee-header">
                        <div className="employee-avatar">
                          <img src="/api/placeholder/80/80" alt={employee.name} />
                        </div>
                        <div className="employee-info">
                          <h3>{employee.name}</h3>
                          <p className="employee-id">ID: {employee.id}</p>
                          <p className="employee-dept">Department: {employee.department}</p>
                        </div>
                      </div>
                      
                      <div className="employee-achievements">
                        <h4>Recent Achievements</h4>
                        <p>{employee.achievements}</p>
                      </div>
                      
                      <button
                        onClick={() => handleNominate(employee)}
                        className="nominate-btn"
                        disabled={nominated === employee.id}
                      >
                        {nominated === employee.id ? "Nominated" : "Nominate"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No employees match your search criteria</p>
                  <button onClick={clearAllFilters} className="clear-btn">Clear Filters</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employee Display - List View */}
        {viewMode === "list" && (
          <div className="list-view-container">
            {filteredEmployees.length > 0 ? (
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className={nominated === employee.id ? "nominated-row" : ""}>
                      <td>{employee.id}</td>
                      <td>{employee.name}</td>
                      <td>{employee.department}</td>
                      <td>
                        <button
                          onClick={() => handleNominate(employee)}
                          className={`list-nominate-btn ${nominated === employee.id ? "nominated-btn" : ""}`}
                          disabled={nominated === employee.id}
                        >
                          {nominated === employee.id ? "Nominated" : "Nominate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-results">
                <p>No employees match your search criteria</p>
                <button onClick={clearAllFilters} className="clear-btn">Clear Filters</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Manager;




// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import './manager.css';
// import Navbar from '../components/navbar';
 
// const CreateAward = () => {
//     const [employees, setEmployees] = useState([]);
//     const [awardName, setAwardName] = useState('');
//     const [month, setMonth] = useState('');
//     const [status, setStatus] = useState('Nominated');
//     const [message, setMessage] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [nominatedEmployees, setNominatedEmployees] = useState([]);
//     const [managerDepartment, setManagerDepartment] = useState('Salesforce');
//     const [showReviewModal, setShowReviewModal] = useState(false);
//     const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
//     const [managerReview, setManagerReview] = useState('');
 
//     // List of predefined awards
//     const awardsList = [
//         'Star of the Month',
//         'Pioneer Excellence Award',
//         'Visionary Leadership Award',
//         'Social Impact Award',
//         'Outstanding Performer Award',
//         'Eco Champion Award'
//     ];
 
//     // List of months
//     const months = [
//         'January', 'February', 'March', 'April', 'May', 'June',
//         'July', 'August', 'September', 'October', 'November', 'December'
//     ];
 
//     useEffect(() => {
//         const fetchData = async () => {
//             setIsLoading(true);
//             try {
//                 const employeesRes = await axios.get('http://localhost:5246/api/Employee');
//                 const filteredEmployees = employeesRes.data.filter(emp => emp.department === managerDepartment);
//                 const filtered = filteredEmployees.filter(emp => emp.designation === 'Employee');
//                 setEmployees(filtered);
 
//                 const awardsRes = await axios.get('http://localhost:5246/api/AwardPage');
//                 const nominated = awardsRes.data
//                     .filter(award => award.status === 'Nominated')
//                     .map(award => award.EmployeeId);
//                 setNominatedEmployees(nominated);
//             } catch (error) {
//                 setMessage("Error fetching data. Please try again later.");
//                 console.error("Error fetching data:", error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
 
//         fetchData();
//     }, [managerDepartment]);
 
//     const handleNominate = async (employee) => {
//         if (!awardName || !month) {
//             setMessage("Please select an award and a month.");
//             return;
//         }
 
//         const awardData = {
//             AwardName: awardName,
//             EmployeeName: employee.name,
//             EmployeeId: employee.employeeId,
//             Department: employee.department,
//             status: status,
//             Month: month,
//         };
 
//         setIsLoading(true);
//         try {
//             const res = await axios.post('http://localhost:5246/api/AwardPage', awardData);
//             setMessage("Award created successfully!");
//             console.log("Award created:", res.data);
//             setNominatedEmployees([...nominatedEmployees, employee.employeeId]);
//         } catch (error) {
//             setMessage("Error creating award. Please try again.");
//             console.error("Error:", error);
//         } finally {
//             setIsLoading(false);
//         }
//     };
 
//     const openReviewModal = (employeeId) => {
//         setSelectedEmployeeId(employeeId);
//         setShowReviewModal(true);
//     };
 
//     const closeReviewModal = () => {
//         setShowReviewModal(false);
//         setSelectedEmployeeId(null);
//         setManagerReview('');
//     };
 
//     const handleSubmitReview = async () => {
//         if (!managerReview) {
//             setMessage("Please write a review.");
//             return;
//         }
 
//         const reviewData = {
//             employeeId: selectedEmployeeId,
//             managerReview: managerReview,
//             hrReview: "",
//             adminReview: ""
//         };
 
//         setIsLoading(true);
//         try {
//             const res = await axios.post('http://localhost:5246/api/Review', reviewData);
//             setMessage("Review submitted successfully!");
//             console.log("Review submitted:", res.data);
//             closeReviewModal();
//         } catch (error) {
//             setMessage("Error submitting review. Please try again.");
//             console.error("Error:", error);
//         } finally {
//             setIsLoading(false);
//         }
//     };
 
//     return (
//         <>
       
   
   
//         <div className="container ">
//             <Navbar />
   
//             <div className="form-container">
//                 <h2>Create Award</h2>
 
//                 <div className="input-group">
//                     <div>
//                         <label>Select Award</label>
//                         <select
//                             value={awardName}
//                             onChange={(e) => setAwardName(e.target.value)}
//                             required
//                         >
//                             <option value="">Select an award</option>
//                             {awardsList.map((award, index) => (
//                                 <option key={index} value={award}>
//                                     {award}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <label>Select Month</label>
//                         <select
//                             value={month}
//                             onChange={(e) => setMonth(e.target.value)}
//                             required
//                         >
//                             <option value="">Select a month</option>
//                             {months.map((month, index) => (
//                                 <option key={index} value={month}>
//                                     {month}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>
 
//                 <table className="employees-table">
//                     <thead>
//                         <tr>
//                             <th>Name</th>
//                             <th>Email</th>
//                             <th>Department</th>
//                             <th>Designation</th>
//                             <th>Action</th>
//                             <th>Review</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {employees.map(emp => (
//                             <tr key={emp.employeeId} className={nominatedEmployees.includes(emp.employeeId) ? 'nominated' : ''}>
//                                 <td>{emp.name}</td>
//                                 <td>{emp.email}</td>
//                                 <td>{emp.department}</td>
//                                 <td>{emp.designation}</td>
//                                 <td>
//                                     <button
//                                         onClick={() => handleNominate(emp)}
//                                         disabled={nominatedEmployees.includes(emp.employeeId) || isLoading}
//                                         className={`button primary ${nominatedEmployees.includes(emp.employeeId) ? 'disabled' : ''}`}
//                                     >
//                                         {nominatedEmployees.includes(emp.employeeId) ? 'Nominated' : 'Nominate'}
//                                     </button>
//                                 </td>
//                                 <td>
//                                     <button
//                                         onClick={() => openReviewModal(emp.employeeId)}
//                                         className="button secondary"
//                                     >
//                                         Write Review
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
 
//                 {showReviewModal && (
//                     <div className="modal">
//                         <div className="modal-content">
//                             <h3>Write Review</h3>
//                             <textarea
//                                 value={managerReview}
//                                 onChange={(e) => setManagerReview(e.target.value)}
//                                 placeholder="Enter your review"
//                             />
//                             <div className="modal-actions">
//                                 <button onClick={closeReviewModal} className="button primary">
//                                     Cancel
//                                 </button>
//                                 <button onClick={handleSubmitReview} className="button secondary">
//                                     Submit
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
 
//                 {message && (
//                     <p className={`message ${message.includes("successfully") ? "success" : "error"}`}>
//                         {message}
//                     </p>
//                 )}
//             </div>
//         </div>
//         </>
//     );
// };
 
// export default CreateAward;