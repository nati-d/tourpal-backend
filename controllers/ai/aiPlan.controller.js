const {getReply} = require("../../utils/aiReply");
const Ajv = require("ajv");

const aiPlanSchema = {
	type: "object",
	properties: {
		DaysPlan: {
			type: "array",
			items: {
				type: "object",
				patternProperties: {
					"Day \\d+: .*": {
						type: "array",
						items: {
							type: "object",
							properties: {
								Time: {type: "string"},
								Place: {type: "string"},
								Description: {type: "string"},
								Longitude: {type: "string"},
								Latitude: {type: "string"},
							},
							required: ["Time", "Place", "Description", "Longitude", "Latitude"],
						},
					},
				},
			},
		},
		TopPlacesToVisit: {type: "array"},
		TopRestaurantsToTry: {type: "array"},
		TopActivitiesToDo: {type: "array"},
		PackingChecklist: {type: "array"},
	},
	required: ["DaysPlan", "TopPlacesToVisit", "TopRestaurantsToTry", "TopActivitiesToDo", "PackingChecklist"],
};

const ajv = new Ajv();
const validate = ajv.compile(aiPlanSchema);

const AiPlanController = async (req, res) => {
	const {destination, startDate, endDate, travelType, preferences} = req.body;

	const promptText = `
You must generate a travel itinerary in **strict JSON format**, adhering to the provided schema. Follow these instructions:

1. Only respond with valid JSON. No comments, explanations, or text outside the JSON object.
2. Ensure strict compliance with this schema:
   ${JSON.stringify(aiPlanSchema, null, 2)}
3. The travel details are as follows:
   - Destination: ${destination}
   - Dates: From ${startDate} to ${endDate}
   - Travel Type: ${travelType}${travelType === "family" ? " (with children)" : ""}
   - Preferences: ${preferences.join(", ")}
4. Validate each entry. Locations must have real coordinates, and descriptions should be detailed and engaging.
5. Time must be Morning,Afternoon and Evening donot use specific time.
6. If you cannot adhere strictly to the JSON schema, output nothing.

Return a fully valid JSON response following these rules.
`;

	try {
		// Get AI response
		const response = await getReply(promptText);

		// Attempt to parse the JSON
		let parsedResponse;
		try {
			parsedResponse = JSON.parse(response);
		} catch (jsonError) {
			console.error("JSON parsing failed:", jsonError.message);
			console.error("Raw AI response:", response);

			return res.status(500).json({
				error: "The AI response could not be parsed as valid JSON.",
				details: jsonError.message,
			});
		}

		// Validate JSON against schema
		if (!validate(parsedResponse)) {
			console.error("Invalid JSON structure:", validate.errors);
			return res.status(400).json({
				error: "Invalid itinerary structure",
				details: validate.errors,
			});
		}

		// Success response
		res.status(200).json({itinerary: parsedResponse});
	} catch (error) {
		console.error("Error generating itinerary:", error.message || error);
		res.status(500).json({error: "Failed to generate itinerary"});
	}
};

module.exports = AiPlanController;
