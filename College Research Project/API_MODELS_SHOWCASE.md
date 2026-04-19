# Model APIs Showcase

This document outlines all available Model APIs in the BHISMA LLM Security Testing Platform.

## 📋 API Endpoints Summary

### Core Model Management APIs

#### 1. **GET /models** - Retrieve All Models
- **Description**: Fetch all registered models
- **Response**: Array of all models with their details
```bash
curl http://localhost:3001/models
```

#### 2. **GET /models/:id** - Get Specific Model
- **Description**: Retrieve a single model by ID
- **Parameters**: 
  - `id` (path) - Model UUID
- **Response**: Model object with all details

#### 3. **POST /models** - Create New Model
- **Description**: Register a new LLM model
- **Body Parameters**:
  - `name` (required) - Model name
  - `provider` (required) - Provider: 'groq' | 'openai' | 'ollama' | 'custom'
  - `apiKey` (optional) - API key for authentication
  - `endpoint` (optional) - Custom endpoint URL
  - `modelId` (optional) - Model identifier from provider
  - `appType` (optional) - Application type (default: 'chatbot')

#### 4. **PUT /models/:id** - Update Model Configuration
- **Description**: Update existing model settings
- **Parameters**: 
  - `id` (path) - Model UUID
- **Body Parameters**:
  - `name` - Update model name
  - `apiKey` - Update API key
  - `endpoint` - Update endpoint URL
  - `modelId` - Update model identifier
  - `appType` - Update application type

#### 5. **DELETE /models/:id** - Delete Model
- **Description**: Remove a model from the system
- **Parameters**: 
  - `id` (path) - Model UUID
- **Response**: Success message

---

## 🧪 Testing & Validation APIs

#### 6. **POST /models/:id/test** - Test Model Connection
- **Description**: Verify connection to a model with default test prompt
- **Parameters**: 
  - `id` (path) - Model UUID
- **Response**: Connection status and test message

#### 7. **POST /models/:id/test-prompt** - Test with Custom Prompt
- **Description**: Test model with a custom prompt and get actual response
- **Body Parameters**:
  - `prompt` - Custom test prompt
- **Response**: Test result with model response
```bash
curl -X POST http://localhost:3001/models/:id/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is AI security?"}'
```

#### 8. **GET /models/:id/status** - Check Model Status
- **Description**: Get current connection status of a model
- **Parameters**: 
  - `id` (path) - Model UUID
- **Response**: Model status information (pending/connected/error)

---

## 📊 Statistics & Analytics APIs

#### 9. **GET /models/stats** - Get Model Statistics
- **Description**: Retrieve aggregated statistics about all models
- **Response**:
  - Total count
  - Count by provider (groq, openai, ollama, custom)
  - Count by status (pending, connected, error)
  - Count by application type
```bash
curl http://localhost:3001/models/stats
```

#### 10. **GET /models/count** - Get Model Count
- **Description**: Get total number of registered models with timestamp
- **Response**:
  - `count` - Total models
  - `timestamp` - Query timestamp

#### 11. **GET /models/provider/:provider** - Get Models by Provider
- **Description**: Filter models by specific provider
- **Parameters**: 
  - `provider` (path) - Provider name (groq/openai/ollama/custom)
- **Response**: Array of models from specified provider with count

#### 12. **GET /models/available-providers** - List Available Providers
- **Description**: Get list of all supported model providers
- **Response**: Array of provider objects with name, description, and status

---

## 🔌 Supported Providers

- **Groq**: High-speed LLM inference (`groq`)
- **OpenAI**: GPT models via OpenAI API (`openai`)
- **Ollama**: Local LLM server (`ollama`)
- **Custom**: Any OpenAI-compatible endpoint (`custom`)

---

## 💡 Usage Examples

### Register a Groq Model
```bash
curl -X POST http://localhost:3001/models \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Groq Llama 3",
    "provider": "groq",
    "apiKey": "your-groq-api-key",
    "modelId": "llama-3.3-70b-versatile",
    "appType": "security-testing"
  }'
```

### Test Model Connection
```bash
curl -X POST http://localhost:3001/models/[model-id]/test
```

### Get Statistics
```bash
curl http://localhost:3001/models/stats
```

### Test with Custom Prompt
```bash
curl -X POST http://localhost:3001/models/[model-id]/test-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "List 3 security vulnerabilities"}'
```

### Get Models by Provider
```bash
curl http://localhost:3001/models/provider/groq
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Successful GET request
- `201` - Successful resource creation (POST)
- `400` - Bad request (missing/invalid parameters)
- `404` - Resource not found
- `500` - Server error

Error Response Format:
```json
{
  "error": "Error message",
  "message": "Detailed message",
  "details": "Additional details (optional)"
}
```

---

## 🎯 Key Features Demonstrated

✅ **CRUD Operations** - Create, Read, Update, Delete models  
✅ **Multi-Provider Support** - Groq, OpenAI, Ollama, Custom endpoints  
✅ **Connection Testing** - Verify model accessibility  
✅ **Custom Prompt Testing** - Test models with specific prompts  
✅ **Statistics & Analytics** - Aggregate data about models  
✅ **Provider Management** - Filter and list available providers  
✅ **Status Monitoring** - Track model connection status  

---

## 📝 Notes

- All model IDs are UUIDs for security and uniqueness
- API keys are securely stored (should be encrypted in production)
- Status values: `pending`, `connected`, `error`
- Default application type is `chatbot` if not specified
- Custom endpoints should be OpenAI-compatible for smooth integration
