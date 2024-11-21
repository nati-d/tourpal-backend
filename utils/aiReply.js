const dotenv = require("dotenv");
dotenv.config();

const {GoogleGenerativeAI} = require("@google/generative-ai");
const apiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 64,
	maxOutputTokens: 8192,
	response_mime_type: "application/json",
};
const model = genAI.getGenerativeModel({
	model: "gemini-1.5-flash",
	systemInstruction: `You are an AI travel assistant that helps users plan their trips by asking relevant questions and generating itineraries based on their using JSON format`,
	generationConfig: generationConfig,
});

async function getReply(message) {
	try {
		const prompt = message;
		const result = await model.generateContent(prompt);
		const response = result.response.text();
		// console.log(prompt);
		// console.log(response);
		return response;
	} catch (err) {
		throw new Error("Error fetching reply from API");
	}
}

module.exports = {getReply};
