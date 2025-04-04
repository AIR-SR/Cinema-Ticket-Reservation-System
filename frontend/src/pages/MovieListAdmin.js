import React, { useEffect, useState } from "react";
import api from "../utils/api";

const MovieListAdmin = () => {
  const [moviesByRegion, setMoviesByRegion] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("all"); // Default to "all" regions
  const [regions, setRegions] = useState(["krakow", "warsaw"]); // List of regions

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        let movies = [];
        if (selectedRegion === "all") {
          // Fetch movies for all regions separately
          const promises = regions.map((region) =>
            api.get(`/movies?region=${region}`).then((response) => ({
              region,
              movies: response.data,
            }))
          );
          const results = await Promise.all(promises);
          results.forEach(({ region, movies: regionMovies }) => {
            movies = [...movies, ...regionMovies.map((movie) => ({ ...movie, region }))];
          });
        } else {
          // Fetch movies for the selected region
          const response = await api.get(`/movies?region=${selectedRegion}`);
          movies = response.data.map((movie) => ({ ...movie, region: selectedRegion }));
        }

        // Group movies by region
        const groupedByRegion = movies.reduce((acc, movie) => {
          const region = movie.region || "Unknown";
          if (!acc[region]) {
            acc[region] = [];
          }
          acc[region].push(movie);
          return acc;
        }, {});

        setMoviesByRegion(groupedByRegion);
      } catch (err) {
        setError("Failed to fetch movies.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedRegion, regions]); // Re-fetch movies when selectedRegion or regions change

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Movie List by Region</h1>
      <select
        value={selectedRegion}
        onChange={(e) => setSelectedRegion(e.target.value)}
      >
        <option value="all">All Regions</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region.charAt(0).toUpperCase() + region.slice(1)}
          </option>
        ))}
      </select>
      {Object.keys(moviesByRegion).map((region) => (
        <div key={region}>
          <h2>{region}</h2>
          <ul>
            {moviesByRegion[region].map((movie) => (
              <li key={movie.id}>
                {movie.title} ({movie.description})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default MovieListAdmin;
