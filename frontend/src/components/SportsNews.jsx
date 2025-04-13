import { useEffect, useState } from "react";
import axios from "axios";

const categories = [
	{ label: "All", apiCategory: "sports", query: "" },
	{ label: "Fitness", apiCategory: "health", query: "fitness workout" },
	{ label: "Motivation", apiCategory: "general", query: "sports motivation success" },
	{ label: "Campus", apiCategory: "sports", query: "college university sports" },
	{ label: "Tech", apiCategory: "technology", query: "sports tech wearables" },
	{ label: "Youth", apiCategory: "general", query: "indian youth exam" }
];

const SportsNews = () => {
	const [articles, setArticles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState(categories[0]);

	useEffect(() => {
		const fetchNews = async () => {
			try {
				setLoading(true);
				const apiKey = import.meta.env.VITE_NEWS_API_KEY;

				let url = "";

				if (selectedCategory.query) {
					// Use 'everything' endpoint when searching with keywords
					url = `https://newsapi.org/v2/everything?q=${selectedCategory.query}&language=en&pageSize=5&sortBy=publishedAt&apiKey=${apiKey}`;
				} else {
					// Use 'top-headlines' for general category browsing
					url = `https://newsapi.org/v2/top-headlines?category=${selectedCategory.apiCategory}&language=en&pageSize=5&apiKey=${apiKey}`;
				}

				const response = await axios.get(url);
				setArticles(response.data.articles);
			} catch (error) {
				console.error("Error fetching sports news:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchNews();
	}, [selectedCategory]);

	return (
		<div className='bg-base-100 border-l-4 border-primary rounded-xl shadow p-5'>
			<h2 className='text-lg font-bold text-primary mb-4'>Latest News</h2>

			{/* CATEGORY BUTTONS */}
			<div className='flex flex-wrap gap-2 mb-4'>
				{categories.map((cat) => (
					<button
						key={cat.label}
						onClick={() => setSelectedCategory(cat)}
						className={`px-3 py-1 rounded-full border text-sm ${
							selectedCategory.label === cat.label
								? "bg-primary text-white"
								: "border-primary text-primary hover:bg-primary hover:text-white"
						}`}
					>
						{cat.label}
					</button>
				))}
			</div>

			{loading ? (
				<p className='text-info'>Loading news...</p>
			) : articles.length === 0 ? (
				<div className='text-center text-sm text-gray-500'>
					<p>No news found for <span className="font-medium text-primary">{selectedCategory.label}</span>. Try another category.</p>
				</div>
			) : (
				<ul className='space-y-4 max-h-96 overflow-y-auto pr-2'>
					{articles.map((article, index) => (
						<li
							key={index}
							className='p-3 bg-white border border-base-200 rounded-lg shadow-sm hover:shadow transition'
						>
							<a
								href={article.url}
								target='_blank'
								rel='noopener noreferrer'
								className='text-primary font-medium hover:underline'
							>
								{article.title}
							</a>
							<p className='text-xs text-info mt-1'>{article.source.name}</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default SportsNews;
