
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

const slider = document.getElementById('satisfaction');
const sliderValue = document.getElementById('slider-value');

slider.oninput = function() {
    sliderValue.textContent = this.value; // Update displayed value
};

const feedbackData = []; // Array to store feedback data

document.getElementById("feedbackForm").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent default form submission

  const comment = document.getElementById('comment').value;
  const errorMessage = document.getElementById('error-message');
  
  // Reset error message
  errorMessage.textContent = '';

  // Validate comment
  if (!comment.trim()) {
      errorMessage.textContent = 'Comments/Suggestions are required!';
      return; // Stop submission if validation fails
  }

  // If validation passes, get the form data
  const feedback = {
      rating: document.getElementById('satisfaction').value,
      comment: comment,
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      date: new Date().toISOString().split('T')[0] // Store the date
  };
  feedbackData.push(feedback); // Add feedback to the array
  console.log(feedback); // Log feedback to the console (for testing)

  // Show thank you message
  document.getElementById("thankYouMessage").style.display = "block";

  // Clear form inputs if needed
  document.getElementById("feedbackForm").reset();
  
  document.getElementById('ratingFilter').addEventListener('change', function() {
    updateCharts();
});
    // Add form data to Firestore "feedback" collection
    db.collection("feedback").add(feedback)
        .then(() => {
            console.log("Data successfully added!"); // Confirm data addition
            document.getElementById('thankYouMessage').style.display = 'block';
            document.getElementById('feedbackForm').reset();
        })
        .catch((error) => {
            console.error("Error adding document: ", error); // Log any error
        });
});

//Chart adding functionality
const ctxRating = document.getElementById('ratingChart').getContext('2d');
const ctxTrend = document.getElementById('trendChart').getContext('2d');

let ratingChart, trendChart;

function updateCharts() {
  const selectedRating = document.getElementById('ratingFilter').value;
    // Prepare data for rating chart
    const ratingCounts = [0, 0, 0, 0, 0]; // Counts for ratings 1-5
    feedbackData.forEach(feedback => {
      if (selectedRating === 'all' || feedback.rating.toString() === selectedRating) {
          ratingCounts[feedback.rating - 1]++; // Increment count based on rating
      }
  });

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

    // Prepare data for trend chart (if you want to show daily trends)
    const trendCounts = {}; // Object to hold counts by date
    feedbackData.forEach(feedback => {
        const date = feedback.date;
        trendCounts[date] = (trendCounts[date] || 0) + 1; // Increment count for the date
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

    // Change icon based on theme
    if (document.body.classList.contains("dark-theme")) {
        themeToggle.textContent = "🌜";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.textContent = "🌞";
        localStorage.setItem("theme", "light");
    }
});

// Load theme on page load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "🌜";
} else {
    themeToggle.textContent = "🌞";
}
