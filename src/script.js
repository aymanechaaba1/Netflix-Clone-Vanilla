'use strict';

// DOM Elements
const headerEl = document.querySelector('.header');
const featuredMovieEl = document.querySelector('.featured-movie');
const rowsContainer = document.querySelector('.rows');
const featuredMovieBtns = document.querySelector('.btns');
const modalOverlay = document.querySelector('.modal-overlay');
const modal = document.querySelector('.modal');

// State
const state = {
  featuredMovie: {
    id: 0,
  },
  rows: [],
  watchList: [],
};

// Config
const TMDB_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNTAwMDc0OTJmOTlmOGExMDg3YTVhOWU2NWVhYTVmMiIsInN1YiI6IjYzNTZjMWJlNDNjZDU0MDA4MjY3Y2E1ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.y-3yb0sW54hM7ZzX88Kg3NMsm7n2FDCdI8RVL3ItKyE';
const TMDB_API_KEY = 'd50007492f99f8a1087a5a9e65eaa5f2';
const TMDB_ACC_ID = '15317267';
const TMDB_URL = `https://api.themoviedb.org/3`;
const baseImgUrl = 'https://image.tmdb.org/t/p/original';

// Helpers
const render = (markup, parentEl, position = 'afterbegin') => {
  parentEl.insertAdjacentHTML(position, markup);
};

const getJSON = async (url) => {
  try {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      },
    };

    const res = await fetch(url, options);
    if (!res.ok)
      throw new Error(
        `Something went wrong getting movies, Try Again! (${res.status})`
      );
    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
};

const postJSON = async function (url, data = null) {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(data),
    };

    const res = await fetch(url, options);
    const response = await res.json();
    if (!res.ok)
      throw new Error(`${response?.status_message} (${response?.status_code})`);
    return response;
  } catch (err) {
    throw err;
  }
};

const getGenreName = async function (genreId) {
  try {
    const { genres } = await getJSON(
      `${TMDB_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`
    );
    const { name } = genres.find((genre) => genre.id === genreId);
    return name;
  } catch (err) {
    throw err;
  }
};

const getDuration = (minutes = 0) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return { hours, minutes: remainingMinutes };
};

const getBudget = (budget) => {
  return (budget / 1000000).toFixed(1);
};

const createModal = async function (
  movieId,
  btnEl,
  withDetails = false,
  autoplay = true
) {
  try {
    const MoreInfo = await Modal({
      movieId: movieId,
      withDetails,
      autoplay,
    });
    modalOverlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    render(MoreInfo, modal);

    btnEl.blur();
  } catch (err) {
    throw err;
  }
};

// DATA Fetching
// Endpoints
const endpoints = {
  fetchPopularMovies: `${TMDB_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&include_video=true&language=en-US&page=1&sort_by=popularity.desc`,
  fetchTopRatedMovies: `${TMDB_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&include_video=true&language=en-US&page=1&sort_by=vote_average.desc&without_genres=99,10755&vote_count.gte=200`,
  fetchUpcomingMovies: `${TMDB_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&include_video=true&language=en-US&page=1&sort_by=popularity.desc&with_release_type=2|3&release_date.gte={min_date}&release_date.lte={max_date}`,
  fetchNowPlayingMovies: `${TMDB_URL}/discover/movie?api_key=${TMDB_API_KEY}&include_adult=false&include_video=true&language=en-US&page=1&sort_by=popularity.desc&with_release_type=2|3&release_date.gte={min_date}&release_date.lte={max_date}`,
  fetchTrendingAll: `${TMDB_URL}/trending/all/week?language=en-US&api_key=${TMDB_API_KEY}`,
  fetchTrendingMovies: `${TMDB_URL}/trending/movie/week?language=en-US&api_key=${TMDB_API_KEY}`,
  fetchTrendingPeople: `${TMDB_URL}/trending/person/week?language=en-US&api_key=${TMDB_API_KEY}`,
  fetchTrendingTvShows: `${TMDB_URL}/trending/tv/week?language=en-US&api_key=${TMDB_API_KEY}`,
  fetchPopularPeople: `${TMDB_URL}/person/popular?language=en-US&page=1&api_key=${TMDB_API_KEY}`,
  fetchTvShowsAiringToday: `${TMDB_URL}/airing_today?language=en-US&page=1&api_key=${TMDB_API_KEY}`,
  fetchTvShowsOnTheAir: `${TMDB_URL}/tv/on_the_air?language=en-US&page=1&api_key=${TMDB_API_KEY}`,
  fetchPopularTvShows: `${TMDB_URL}/tv/popular?language=en-US&page=1&api_key=${TMDB_API_KEY}`,
  fetchTopRatedTvShows: `${TMDB_URL}/tv/top_rated?language=en-US&page=1&api_key=${TMDB_API_KEY}`,
  fetchByMoviesByFilters: `${TMDB_URL}/discover/movie&api_key=${TMDB_API_KEY}`,
  fetchGenres: `${TMDB_URL}/genre/movie/list?=language=en&api_key=${TMDB_API_KEY}`,
  fetchRomanceMovies: `${TMDB_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=10749`,
  fetchActionMovies: `${TMDB_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=28`,
  fetchComedyMovies: `${TMDB_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=35`,
  fetchCrimeMovies: `${TMDB_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=80`,
  fetchHorrorMovies: `${TMDB_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=27`,
  fetchDramaMovies: `${TMDB_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=18`,
};

const getData = async function () {
  try {
    // genres
    const { genres } = await getJSON(endpoints.fetchGenres);
    state.genres = window.structuredClone(genres);
  } catch (err) {
    console.error(err.message);
  }
};
getData();

// Components
// Featured Movie Info Component
const MovieInfo = ({ movieName, overview }) => `
  <h1 class="text-4xl font-bold text-white">${movieName}</h1>
  <p class="text-white">${overview}</p>
`;

// Modal Component
const Modal = async function ({
  movieId,
  withDetails = true,
  autoplay = false,
}) {
  try {
    // Movie details & trailer
    const [data, videos] = await Promise.all([
      getJSON(
        `${TMDB_URL}/movie/${movieId}?language=en-US&api_key=${TMDB_API_KEY}`
      ),
      getJSON(
        `${TMDB_URL}/movie/${movieId}/videos?language=en-US&api_key=${TMDB_API_KEY}`
      ),
    ]);

    // Movie Videos
    const { results: movieVideos } = videos;

    const trailer = movieVideos.find((movie) =>
      movie.name.toLowerCase().includes('trailer')
    );

    if (!trailer) throw new Error("We couldn't find a trailer for this movie.");

    const { key, name } = trailer;

    // Movie Genres
    const genres = data.genres.map((genre) => genre.name);

    // Release date
    const [year, month, day] = data.release_date.split('-');
    const releaseDate = new Intl.DateTimeFormat(navigator.language, {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(new Date(year, +month - 1, day));

    // Production Companies
    const productionCompanies = data.production_companies.map(
      (productionCompany) => productionCompany.name
    );

    const { hours, minutes } = getDuration(data.runtime);

    return `
        ${
          trailer &&
          `
          <!-- VIDEO -->
          <div class="video w-full">
            <iframe
              class="w-full h-96"
              src="https://www.youtube.com/embed/${key}?${
            autoplay ? '&autoplay=1' : ''
          }"
              title=${name}
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
          <!-- END VIDEO -->
        `
        }
        ${
          withDetails
            ? `
          <div class="movie-details p-7">
            <div class="grid grid-cols-2 gap-y-2 gap-3-5">
              <div class="text-slate-400">Popularity</div>
              <div class="text-white">
                <span class="text-teal-200">93%</span> liked this film
              </div>
              <div class="text-slate-400">Language</div>
              <div class="text-white">${data.original_language.toUpperCase()}</div>
              <div class="text-slate-400">Genre</div>
              <div class="text-white">${genres.join(', ')}</div>
              <div class="text-slate-400">Duration</div>
              <div class="text-white">${hours}h ${minutes}m</div>
              <div class="text-slate-400">Rating</div>
              <div class="text-teal-200">${data.vote_average.toFixed(
                1
              )}/10</div>
              <div class="text-slate-400">Release Date</div>
              <div class="text-white">
                ${releaseDate}
              </div>
              <div class="text-slate-400">Budget</div>
              <div class="text-teal-200">${new Intl.NumberFormat(
                navigator.language,
                {
                  style: 'currency',
                  currency: 'USD',
                }
              ).format(data.budget / 1000000)}M</div>
              <div class="text-slate-400">Production Companies</div>
              <div class="text-white">${productionCompanies.join(', ')}.</div>
            </div>
          </div>
        `
            : ''
        }
        
    `;
  } catch (err) {
    throw err;
  }
};

// Card Component
const Card = async ({ id, imgUrl, movieName, rating, genresIds }) => {
  try {
    const genresNamesPros = genresIds.map(async (genreId) => {
      try {
        return await getGenreName(genreId);
      } catch (err) {
        throw err;
      }
    });
    const genresNames = await Promise.all(genresNamesPros);

    return `
      <div class="card rounded-md" data-card-id=${id}>
        <img
        src="${baseImgUrl}${imgUrl}"
        alt=""
        class="w-full"
        />
      <div class="card-details bg-gray-900 p-5 space-y-2">
      <div class="card-btns flex items-center gap-3">
        <div class="flex items-center gap-2 flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="card-btn-play w-10 h-10 text-white rounded-full border p-2 cursor-pointer"
          >
            <path
              fill-rule="evenodd"
              d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
              clip-rule="evenodd"
            />
          </svg>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="btn-add-to-watchlist w-10 h-10 text-white rounded-full border p-2 cursor-pointer"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-10 h-10 text-white rounded-full border p-2 cursor-pointer"
          >
            <path
              d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-10 h-10 text-white rounded-full border p-2 cursor-pointer"
          >
            <path
              d="M15.73 5.25h1.035A7.465 7.465 0 0118 9.375a7.465 7.465 0 01-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218C7.74 15.724 7.366 15 6.748 15H3.622c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-2.848.992-5.464 2.649-7.521.388-.482.987-.729 1.605-.729H9.77a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23zM21.669 13.773c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.959 8.959 0 01-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227z"
            />
          </svg>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-10 h-10 text-white rounded-full border p-2 cursor-pointer"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
      <div class="text-white">${movieName}</div>
      <div class="text-green-500">${rating.toFixed(1)}/10</div>
      <div class="flex items-center gap-2 text-sm divide-x overflow-x-scroll scrollbar-hide text-white">
          ${genresNames
            .map((genreName) => `<div class="pl-2">${genreName}</div>`)
            .join('')}
      </div>
      </div>
    </div>
  `;
  } catch (err) {
    throw err;
  }
};

// Row Component
const Row = async function ({ id, title, fetchUrl, isLarge = false }) {
  try {
    const { results } = await getJSON(`${fetchUrl}`);

    const cardsPros = results.map(async (result) => {
      try {
        return await Card({
          id: result.id,
          imgUrl: isLarge ? result?.poster_path : result?.backdrop_path,
          movieName: result.title || result.name,
          rating: result.vote_average,
          genresIds: result.genre_ids,
        });
      } catch (err) {
        throw err;
      }
    });

    const cards = await Promise.all(cardsPros);

    return `
      <section class="row flex flex-col gap-2" data-id=${id}>
        <h2 class="text-white text-3xl font-bold">${title}</h2>
        <!-- CARDS -->
        <div class="cards flex items-center gap-2 overflow-scroll">
          ${cards}
        </div>
      </section>
    `;
  } catch (err) {
    throw err;
  }
};

// Event Handlers
const showMoreInfo = async (e) => {
  try {
    const btnMoreInfo = e.target.closest('.btn-more-info');
    if (!btnMoreInfo) return;

    createModal(state.featuredMovie.id, btnMoreInfo, true, false);
  } catch (err) {
    throw err;
  }
};

const hideModal = (e) => {
  modal.innerHTML = '';
  modalOverlay.classList.add('hidden');
  modal.classList.add('hidden');
};

const playTrailer = async (e) => {
  try {
    const btnPlay = e.target.closest('.btn-play');
    if (!btnPlay) return;

    btnPlay && createModal(state.featuredMovie.id, btnPlay);
  } catch (err) {
    throw err;
  }
};

const handleRow = (e) => {
  const cardBtnPlayEl = e.target.closest('.card-btn-play');
  const cardEl = e.target.closest('.card');
  if (!cardBtnPlayEl || !cardEl) return;

  const { cardId } = cardEl.dataset;

  cardBtnPlayEl && createModal(+cardId, cardBtnPlayEl);
};

const handleAddToWatchlist = (e) => {
  const addToWatchList = async () => {
    try {
      // Get movie
      const movie = await getJSON(
        `${TMDB_URL}/movie/${+cardId}?api_key=${TMDB_API_KEY}`
      );

      // If its already exists, don't add it
      if (state.watchList.some((movie) => movie.id === +cardId))
        throw new Error(`This movie is already in your watchlist :)`);

      // Add it to watchlist
      state.watchList.push(movie);

      console.log(JSON.stringify(state.watchList));

      // Send data to TMDB
      const res = await postJSON(
        `${TMDB_URL}/account/${TMDB_ACC_ID}/watchlist?api_key=${TMDB_API_KEY}`,
        state.watchList
      );
      console.log(res);
    } catch (err) {
      throw err;
    }
  };

  const btnAddToWatchlist = e.target.closest('.btn-add-to-watchlist');
  const cardEl = e.target.closest('.card');
  if (!btnAddToWatchlist || !cardEl) return;

  const { cardId } = cardEl.dataset;

  btnAddToWatchlist && addToWatchList();
};

// INIT
const renderFeaturedMovie = async function () {
  try {
    const { results } = await getJSON(endpoints.fetchTrendingMovies);
    const featuredMovie =
      results[Math.floor(Math.random() * results.length - 1)];

    state.featuredMovie.id = featuredMovie.id;

    headerEl.classList.add(
      `bg-[url('${baseImgUrl}${featuredMovie.poster_path}')]`
    );

    const MovieInfoMarkup = MovieInfo({
      movieName: featuredMovie.title,
      overview: featuredMovie.overview,
    });
    render(MovieInfoMarkup, featuredMovieEl);
  } catch (err) {
    console.error(err.message);
  }
};
renderFeaturedMovie();

const renderRows = async function () {
  try {
    const rows = [
      {
        title: 'Popular',
        fetchUrl: endpoints.fetchPopularMovies,
        position: 'afterbegin',
        isLarge: false,
      },
      {
        title: 'Trending Now',
        fetchUrl: endpoints.fetchTrendingAll,
        position: 'beforeend',
        isLarge: true,
      },
      {
        title: 'Romance',
        fetchUrl: endpoints.fetchRomanceMovies,
        position: 'beforeend',
        isLarge: false,
      },
      {
        title: 'Horror',
        fetchUrl: endpoints.fetchHorrorMovies,
        position: 'beforeend',
        isLarge: false,
      },
      {
        title: 'Comedy',
        fetchUrl: endpoints.fetchComedyMovies,
        position: 'beforeend',
        isLarge: false,
      },
    ];

    rows.forEach(async (row, i) => {
      const RowEl = await Row({
        id: i,
        title: row.title,
        fetchUrl: row.fetchUrl,
        isLarge: row.isLarge,
      });
      state.rows.push({ id: i, title: row.title, fetchUrl: row.fetchUrl });
      render(RowEl, rowsContainer, row.position);
    });
    console.log(state);
  } catch (err) {
    console.error(err);
  }
};
renderRows();

featuredMovieBtns.addEventListener('click', showMoreInfo);
featuredMovieBtns.addEventListener('click', playTrailer);
modalOverlay.addEventListener('click', hideModal);
document.addEventListener('keydown', (e) => {
  e.key === 'Escape' && hideModal();
});
rowsContainer.addEventListener('click', handleRow);
rowsContainer.addEventListener('click', handleAddToWatchlist);
