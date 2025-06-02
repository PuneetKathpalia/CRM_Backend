const cohere = require('cohere-ai');
require('dotenv').config();

// Initialize Cohere client
cohere.init(process.env.COHERE_API_KEY);

const generateMessages = async (req, res) => {
  try {
    const { customer, goal } = req.body;

    if (!customer || !goal) {
      return res.status(400).json({ error: 'Customer and goal are required' });
    }

    // Create a prompt that includes customer data and campaign goal
    const prompt = `Generate 2 distinct, personalized marketing messages for a customer with the following details:
Name: ${customer.name}
Email: ${customer.email}
Total Spend: ₹${customer.totalSpend || 0}
Total Visits: ${customer.visits || 0}
Tags: ${customer.tags?.join(', ') || 'none'}

The primary goal for these messages is: "${goal}"

Based on this goal and the customer's profile, create messages that are:
1. Highly relevant to the campaign goal.
2. Personalized using the customer data provided.
3. Professional and engaging.
4. Include a clear call-to-action related to the goal.

Ensure the messages directly address or relate to the "${goal}".

Format each message with a Subject: and Body: section.`;

    // Call Cohere API
    const response = await cohere.generate({
      model: 'command',
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.7,
      k: 0,
      stop_sequences: [],
      return_likelihoods: 'NONE'
    });

    // Log the full response from Cohere for debugging
    console.log('Full Cohere API Response:', JSON.stringify(response, null, 2));

    // Process and format the generated messages
    // Attempt to parse messages assuming a Subject: and Body: structure.
    const generatedText = response.body.generations[0].text;
    
    const messages = generatedText
        .split(/Subject:/)
        .slice(1) // Remove anything before the first 'Subject:'
        .map(messageBlock => {
            const parts = messageBlock.split(/Body:/);
            const subject = parts[0] ? parts[0].trim() : 'No Subject';
            const body = parts[1] ? parts[1].trim() : 'No Body';
            return { subject, body };
        })
        .filter(msg => msg.subject !== 'No Subject' && msg.body !== 'No Body') // Filter out incomplete messages
        .slice(0, 2); // Take only the first 2 valid messages

    // Fallback if parsing fails to find 2 messages
    if (messages.length < 2) {
         // Simple split by newlines as a fallback, returning raw text
         const fallbackMessages = generatedText
             .split('\n\n')
             .map(msg => ({ subject: 'Generated Message', body: msg.trim() }))
             .filter(msg => msg.body.length > 50)
             .slice(0, 2);
         res.json({ messages: fallbackMessages });
     } else {
        res.json({ messages });
     }

  } catch (error) {
    console.error('Error generating messages:', error);
    // Check if the error is due to an invalid API key or other Cohere API issues
    if (error.message.includes('invalid api key') || error.message.includes('authentication failed')) {
        res.status(401).json({ error: 'Cohere API authentication failed. Please check your API key in the .env file.' });
    } else if (error.message.includes('rate limit')) {
         res.status(429).json({ error: 'Cohere API rate limit exceeded. Please try again later.' });
    } else {
        res.status(500).json({ error: 'Failed to generate messages' });
    }
  }
};

module.exports = {
  generateMessages
}; 