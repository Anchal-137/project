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
    const recentSearchesDiv = document.getElementById('recent-searches');
    recentSearchesDiv.innerHTML = ''; // Clear current div
    
    // Create a div for each recent search
    recentSearches.forEach(query => {
        const searchDiv = document.createElement('div');
        searchDiv.textContent = query;
        searchDiv.onclick = function() {
            document.getElementById('search-input').value = query;
            fetchAnimeData(query);
            recentSearchesDiv.style.display = 'none'; // Hide recent searches once selected
        };
        recentSearchesDiv.appendChild(searchDiv);
    });

    // Show recent searches dropdown if there are any
    if (recentSearches.length > 0) {
        recentSearchesDiv.style.display = 'block';
    } else {
        recentSearchesDiv.style.display = 'none';
    }
}

// Function to fetch anime data from the Jikan API based on category
async function fetchCategoryAnime(category) {
    try {
        // Get anime data based on category (e.g., 'popular', 'lighthearted', 'romance')
        let categoryParam = '';

        // Define category parameters for various categories
        switch (category) {
            case 'popular':
                categoryParam = 'order_by=popularity';
                break;
            case 'lighthearted':
                categoryParam = 'genres=4'; // Example genre code for Comedy
                break;
            case 'romance':
                categoryParam = 'genres=22'; // Example genre code for Romance
                break;
            case 'action':
                categoryParam = 'genres=1'; // Example genre code for Action
                break;
            default:
                break;
        }

        const response = await fetch(`https://api.jikan.moe/v4/anime?${categoryParam}&limit=5`);
        const data = await response.json();
        displaySearchResults(data.data);
        
        // Hide the recent searches dropdown when results are displayed
        document.getElementById('recent-searches').style.display = 'none';
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to fetch anime data from the Jikan API for a specific search query
async function fetchAnimeData(query) {
    try {
        // Search for anime from Jikan API
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=5`);
        const data = await response.json();
        displaySearchResults(data.data);
        
        // Hide the recent searches dropdown when results are displayed
        document.getElementById('recent-searches').style.display = 'none';
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
