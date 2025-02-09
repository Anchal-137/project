// Event listener for the search form submission
document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        // Save the search term in localStorage and display the last 3 searches
        saveSearch(query);
        fetchAnimeData(query);
    }
});

// Function to save search query in localStorage
function saveSearch(query) {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    // Add the new query at the beginning of the array
    recentSearches.unshift(query);
    
    // Ensure only the last 3 searches are kept
    if (recentSearches.length > 3) {
        recentSearches = recentSearches.slice(0, 3);
    }

    // Save the updated search history back to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    displayRecentSearches();
}

// Function to display the last 3 search queries
function displayRecentSearches() {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    const recentSearchesList = document.getElementById('recent-searches-list');
    recentSearchesList.innerHTML = ''; // Clear current list
    
    // Create a list item for each recent search
    recentSearches.forEach(query => {
        const listItem = document.createElement('li');
        listItem.textContent = query;
        listItem.onclick = function() {
            document.getElementById('search-input').value = query;
            fetchAnimeData(query);
        };
        recentSearchesList.appendChild(listItem);
    });
}

// Function to fetch anime data from the Jikan API
async function fetchAnimeData(query) {
    try {
        // Search for anime from Jikan API
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=5`);
        const data = await response.json();
        displaySearchResults(data.data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to display search results
function displaySearchResults(animeList) {
    const resultsContainer = document.getElementById('anime-results');
    resultsContainer.innerHTML = ''; // Clear previous results
    animeList.forEach(anime => {
        const animeDiv = document.createElement('div');
        animeDiv.classList.add('anime-result');
        
        // Create and append the anime title and image
        animeDiv.innerHTML = `
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
            <h3>${anime.title}</h3>
            <p><strong>Rating:</strong> ${anime.score ? anime.score : 'N/A'}</p>
            <button onclick="showAnimeDetails(${anime.mal_id})">View Details</button>
        `;
        resultsContainer.appendChild(animeDiv);
    });
}

// Function to show anime details
async function showAnimeDetails(animeId) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
        const data = await response.json();
        const anime = data.data;

        // Display detailed information
        document.getElementById('anime-title').textContent = anime.title;
        document.getElementById('anime-synopsis').textContent = anime.synopsis;
        document.getElementById('anime-rating').textContent = anime.score || 'N/A';
        document.getElementById('anime-image').src = anime.images.jpg.image_url;

        // Optionally, display episodes list (can be a long list, use pagination or limit)
        const episodeList = document.getElementById('episode-list');
        episodeList.innerHTML = '';
        anime.episodes && anime.episodes.forEach((episode, index) => {
            const episodeItem = document.createElement('p');
            episodeItem.textContent = `Episode ${index + 1}: ${episode.title}`;
            episodeList.appendChild(episodeItem);
        });

        // Show details section and hide results
        document.getElementById('details-section').style.display = 'block';
        document.getElementById('search-section').style.display = 'none';
    } catch (error) {
        console.error('Error fetching anime details:', error);
    }
}

// Display the recent searches when the page loads
displayRecentSearches();
// Function to populate the dropdown with recent searches
function populateRecentSearchesDropdown() {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    const dropdown = document.getElementById('recent-searches-dropdown');
    dropdown.innerHTML = ''; // Clear current dropdown options

    // Create a dropdown option for each recent search
    recentSearches.forEach(query => {
        const option = document.createElement('option');
        option.value = query;
        option.textContent = query;
        dropdown.appendChild(option);
    });
}

// Event listener for the dropdown selection
document.getElementById('recent-searches-dropdown').addEventListener('change', function() {
    const selectedQuery = this.value;
    if (selectedQuery) {
        document.getElementById('search-input').value = selectedQuery;
        fetchAnimeData(selectedQuery);
    }
});

// Populate the dropdown when the page loads
populateRecentSearchesDropdown();
