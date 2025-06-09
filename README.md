# Simple Chat AI

A Node.js backend application that integrates with OpenAI's Assistant API to create and manage AI agents for intelligent conversations. The project provides a robust API for managing AI assistants, handling conversations, and implementing document search capabilities through vector stores.

## Features

- **AI Agent Management**
  - Create and manage custom OpenAI assistants with specific instructions
  - Automatic vector store creation for document search
  - Secure input sanitization for agent names and instructions
  - Full CRUD operations for agent management

- **Conversation Management**
  - Automatic thread creation and management
  - Real-time message exchange with OpenAI assistants
  - Message history tracking and retrieval
  - Citation removal from AI responses
  - Conversation state tracking with timestamps

- **Advanced Features**
  - Integration with OpenAI's vector store for document search
  - Automatic sanitization of agent names and instructions
  - Comprehensive error logging and handling
  - Database-backed persistence of agent and conversation data

## Prerequisites

- Node.js (v18 or higher)
- MySQL database
- OpenAI API key with access to Assistants API
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/simple-chat-ai.git
cd simple-chat-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
OPENAI_API_KEY=your_openai_api_key
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

4. Set up the database:
- Create a MySQL database
- Create the following tables:

```sql
CREATE TABLE agents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assistant_id VARCHAR(50),
    vector_store_id VARCHAR(50),
    name VARCHAR(50),
    instructions TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    agent_id BIGINT,
    thread_id VARCHAR(50),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

## Usage

### Starting the Server
```bash
npm start
```

### API Endpoints

#### Agents

1. Create a new agent:
```http
POST /api/agents
Content-Type: application/json

{
  "name": "My Assistant",
  "instructions": "You are a helpful assistant..."
}
```
Response:
```json
{
  "status": 200,
  "message": "Agent created successfully",
  "data": {
    "id": "123"
  }
}
```

2. Get all agents:
```http
GET /api/agents
```

3. Get agent by ID:
```http
GET /api/agents/:id
```

4. Update agent:
```http
PUT /api/agents/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "instructions": "Updated instructions..."
}
```

5. Delete agent:
```http
DELETE /api/agents/:id
```
- Automatically cleans up associated OpenAI assistant and vector store

#### Conversations

1. Get or create conversation for an agent:
```http
GET /api/conversations/agent/:id
```
Response:
```json
{
  "status": 200,
  "message": "Conversations fetched successfully",
  "data": {
    "thread_id": "thread_xyz",
    "agent": {
      "id": 123,
      "name": "Assistant Name",
      "instructions": "..."
    }
  }
}
```

2. Get message history:
```http
GET /api/conversations/thread/:id
```

3. Send message to agent:
```http
POST /api/conversations/send
Content-Type: application/json

{
  "agent_id": "123",
  "thread_id": "thread_xyz",
  "message": "Hello, assistant!"
}
```

## Implementation Details

### Agent Creation Process
1. Sanitizes input name and instructions
2. Creates a vector store for document search
3. Configures and creates OpenAI assistant
4. Stores metadata in database

### Conversation Management
1. Automatically creates new thread if none exists
2. Maintains conversation state with timestamps
3. Handles message exchange with OpenAI
4. Processes responses (removes citations if present)

### Error Handling
The application implements comprehensive error handling:
```javascript
try {
    // Operation code
} catch (error) {
    logError(error, 'controllerName', 'functionName')
    res.status(500).json(response(500, "Internal server error", error))
}
```

### Security Features
- Input sanitization using `sanitize-filename` and `sanitize-html`
- Database query parameterization
- Environment variable protection
- Error logging with context

## Project Structure

```
src/
├── controllers/
│   ├── agentController.js      # Agent CRUD operations
│   └── conversationController.js # Conversation management
├── models/
│   └── agent.js                # Database operations
├── services/
│   ├── openaiService.js        # OpenAI API integration
│   └── logError.js             # Error logging service
├── utils/
│   ├── response.js             # Response formatting
│   ├── validation.js           # Input validation
│   └── textFormat.js           # Text processing (citations)
└── configs/
    └── db.js                   # Database configuration
```

### Key Components

- **agentController.js**: Manages AI agents lifecycle
- **conversationController.js**: Handles conversation threads and messages
- **openaiService.js**: Integrates with OpenAI's API
- **agent.js**: Database operations for agents and conversations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Support

For support:
1. Check existing GitHub issues
2. Create a new issue with:
   - Detailed description of the problem
   - Steps to reproduce
   - Error messages and logs
   - Environment details
