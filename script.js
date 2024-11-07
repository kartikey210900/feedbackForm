// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyADwO6cEpDpPYWYpA1PJvcXbsIfqBjq4B0",
    authDomain: "feedback-form-project-676b3.firebaseapp.com",
    projectId: "feedback-form-project-676b3",
    storageBucket: "feedback-form-project-676b3.firebasestorage.app",
    messagingSenderId: "930627599061",
    appId: "1:930627599061:web:0a8454601ce7a52bb4805c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Set up Firestore
const db = firebase.firestore();

// DOM Elements and Global Variables
const feedbackData = []; // Array to store feedback data
let ratingChart, trendChart;

// Initialize Chart Contexts
const ctxRating = document.getElementById('ratingChart').getContext('2d');
const ctxTrend = document.getElementById('trendChart').getContext('2d');



// Fetch All Feedback Data from Firestore
function fetchFeedbackData() {
    db.collection("feedback").get().then((querySnapshot) => {
        feedbackData.length = 0; // Clear existing data
        querySnapshot.forEach((doc) => {
            console.log("Fetched feedback data:", doc.data()); // Log the fetched data
            feedbackData.push(doc.data()); // Add each feedback entry to feedbackData
        });
        updateCharts(); // Update charts after loading data
    }).catch((error) => {
        console.error("Error fetching feedback data: ", error);
    });
}

// Call fetchFeedbackData on page load to initialize data
window.addEventListener("load", fetchFeedbackData);

// Submit New Feedback and Update Data
// Submit New Feedback and Update Data
document.getElementById("feedbackForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    const comment = document.getElementById('comment').value;
    const rating = parseInt(document.getElementById('satisfaction').value); // Read the satisfaction rating
    const errorMessage = document.getElementById('error-message');

    // Reset error message
    errorMessage.textContent = '';

    // Validate comment and rating
    if (!comment.trim()) {
        errorMessage.textContent = 'Comments/Suggestions are required!';
        return; // Stop submission if validation fails
    }
    if (!rating || rating < 1 || rating > 5) {
        errorMessage.textContent = 'Please select a rating!';
        return; // Stop submission if rating is invalid
    }

    // Prepare feedback data
    const feedback = {
        rating: rating,
        comment: comment,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        date: new Date().toISOString().split('T')[0] // Store the date
    };
    
    // Add feedback to Firestore
    db.collection("feedback").add(feedback)
        .then(() => {
            console.log("Data successfully added to Firestore");

            // Clear form inputs after submission
            document.getElementById("feedbackForm").reset();
            satisfactionInput.value = ""; // Reset hidden rating input
            stars.forEach(star => star.classList.remove("selected")); // Reset star visual selection

            // Show thank you message
            const thankYouMessage = document.getElementById("thankYouMessage");

            // Check if the element exists before showing
            if (thankYouMessage) {
                console.log("Displaying Thank You message...");

                // Show the "Thank You" message by adding the 'show' class
                thankYouMessage.classList.add("show");

                // Log message to confirm it should be displayed
                console.log("Thank You message should be displayed!");

                // Hide the "Thank You" message after 3 seconds
                setTimeout(() => {
                    console.log("Hiding the thank you message...");
                    thankYouMessage.classList.remove("show");
                }, 3000);
            } else {
                console.error("Thank You message element not found!");
            }
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
});


// Update or Initialize Charts
function updateCharts() {
    const selectedRating = document.getElementById('ratingFilter').value;

    // Prepare data for rating chart
    const ratingCounts = [0, 0, 0, 0, 0]; // Initialize counts for ratings 1-5
    
    // Populate the ratingCounts array with feedback data
    feedbackData.forEach(feedback => {
        if (selectedRating === 'all' || feedback.rating.toString() === selectedRating) {
            ratingCounts[feedback.rating - 1]++; // Increment the count for the appropriate rating
        }
    });

    console.log("Rating counts:", ratingCounts); // Log counts to check the data

    // Create or update the rating chart
    if (ratingChart) {
        ratingChart.data.datasets[0].data = ratingCounts;
        ratingChart.update();
    } else {
        ratingChart = new Chart(ctxRating, {
            type: 'bar',
            data: {
                labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
                datasets: [{
                    label: 'Rating Distribution',
                    data: ratingCounts,
                    backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff']
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Prepare data for trend chart (feedback count by date)
    const trendCounts = {}; // Object to hold counts by date
    feedbackData.forEach(feedback => {
        const date = feedback.date;
        trendCounts[date] = (trendCounts[date] || 0) + 1;
    });

    const trendLabels = Object.keys(trendCounts);
    const trendData = trendLabels.map(date => trendCounts[date]);

    // Create or update the trend chart
    if (trendChart) {
        trendChart.data.labels = trendLabels;
        trendChart.data.datasets[0].data = trendData;
        trendChart.update();
    } else {
        trendChart = new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: trendLabels,
                datasets: [{
                    label: 'Feedback Trend',
                    data: trendData,
                    borderColor: '#4bc0c0',
                    fill: false,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

  
// Theme Toggle Logic
const themeToggle = document.getElementById("themeToggle");

// Apply theme toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    themeToggle.textContent = document.body.classList.contains("dark-theme") ? "🌜" : "🌞";
    localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
});

// Load theme on page load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "🌜";
} else {
    themeToggle.textContent = "🌞";
}
// Star rating System in form 

document.addEventListener("DOMContentLoaded", () => {
    const stars = document.querySelectorAll(".star");
    const satisfactionInput = document.getElementById("satisfaction");

    stars.forEach((star) => {
        star.addEventListener("click", () => {
            const ratingValue = star.getAttribute("data-value");
            satisfactionInput.value = ratingValue; // Set the hidden input value

            // Update visual selection for clicked rating
            stars.forEach((s) => {
                s.classList.remove("selected");
                if (s.getAttribute("data-value") <= ratingValue) {
                    s.classList.add("selected");
                }
            });
        });

        // Hover effect to show temporary selection
        star.addEventListener("mouseenter", () => {
            let hoverValue = star.getAttribute("data-value");
            stars.forEach((s) => {
                s.classList.remove("hover");
                if (s.getAttribute("data-value") <= hoverValue) {
                    s.classList.add("hover");
                }
            });
        });
    });

    // Remove hover effect on mouse leave, keeping only selected stars highlighted
    document.getElementById("stars").addEventListener("mouseleave", () => {
        stars.forEach((s) => s.classList.remove("hover"));
        const selectedValue = satisfactionInput.value;
        stars.forEach((s) => {
            if (s.getAttribute("data-value") <= selectedValue) {
                s.classList.add("selected");
            } else {
                s.classList.remove("selected");
            }
        });
    });
});
