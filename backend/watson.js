import { IamAuthenticator } from 'ibm-watson/auth/index.js';
import AssistantV2 from 'ibm-watson/assistant/v2.js';
import dotenv from 'dotenv';

dotenv.config();

const assistant = new AssistantV2({
  version: '2022-06-14',
  authenticator: new IamAuthenticator({ apikey: process.env.WATSON_API_KEY }),
  serviceUrl: process.env.WATSON_URL,
});

let sessionId = null;

const initSession = async () => {
  try {
    const session = await assistant.createSession({
      assistantId: process.env.WATSON_ASSISTANT_ID,
    });
    sessionId = session.result.session_id;
    console.log('Watson session created:', sessionId);
  } catch (err) {
    console.error('Error creating session:', err);
  }
};

// Initialize session
await initSession();

export const getWatsonResponse = async (message) => {
  if (!sessionId) {
    await initSession();
  }

  try {
    const response = await assistant.message({
      assistantId: process.env.WATSON_ASSISTANT_ID,
      sessionId,
      input: { message_type: 'text', text: message },
    });

    return response.result.output.generic
      .map((msg) => msg.text)
      .filter(Boolean)
      .join('\n');
  } catch (err) {
    // Handle session expiration
    if (err.status === 404) {
      console.log('Session expired. Creating a new one...');
      await initSession();
      return getWatsonResponse(message);
    }
    console.error('Error in Watson response:', err);
    throw err;
  }
};
