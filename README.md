
# Jaseci Code Runner Plugin

![Plugin Icon](https://via.placeholder.com/32)  

The **Jaseci Code Runner Plugin** provides a unified interface for performing file operations on code files (supporting both `.py` and `.jac` extensions) via a RESTful API. With this plugin, you can read source code, execute code files, create new files, update existing files through find/replace operations, and delete files (by moving them to a trash folder).

## Overview

This plugin is designed to integrate seamlessly with the TypingMind platform (or any other client application), enabling users to manage their code files directly from a plugin interface. The core functionality is routed through a single OpenAI function specification that determines the operation to perform based on an `operation` parameter.

### Key Features

- **Read**: Retrieve the source code of a file.
- **Execute**: Run a code file and capture the output (stdout/stderr).
- **Create**: Save a new code file (if the file does not already exist).
- **Update**: Apply a find/replace operation to modify an existing code file.
- **Delete**: Move a file to a designated `.trash` folder for future purging.

## Plugin Architecture

The plugin routes its functionality by mapping the following operations:
- `read` — HTTP GET endpoint: `/code/:filename`
- `execute` — HTTP POST endpoint: `/code/:filename`
- `create` — HTTP PUT endpoint: `/code/:filename`
- `update` — HTTP PATCH endpoint: `/code/:filename`
- `delete` — HTTP DELETE endpoint: `/code/:filename`

A sample OpenAI function specification is provided to ensure standardized input and output parameters for these operations.

## Installation

1. **Clone or Download Repository:**
   - Ensure the backend code (including the server which exposes the `/code/` endpoints) is up and running.
   - Clone the repository containing the code for the code executor:
     ```bash
     git clone https://github.com/your-org/jaseci-code-runner.git
     cd jaseci-code-runner
     ```

2. **Install Dependencies:**
   - From the project root, install required dependencies:
     ```bash
     npm install
     ```

3. **Configuration:**
   - Ensure the plugin server is properly configured.
   - Create a folder named `code_storage` at the root level (if not already created by the server) for storing and managing code files.
   - Update any necessary configuration values (e.g., base URL) in the plugin's user settings.

4. **Start the Server:**
   - Start the server using:
     ```bash
     npm start
     ```
   - The plugin will listen for operations on the `/code` endpoint.

## Usage

### Clientside JavaScript Example

The following JavaScript snippet demonstrates how to use the plugin via its RESTful endpoints:

```javascript
async function codeExecutor(params, apiBaseURL = '/code') {
  const { operation, filename, code, findReplaceMessage } = params;
  let endpoint = `${apiBaseURL}/${filename}`;
  let method, body;

  switch (operation) {
    case 'read':
      method = 'GET';
      break;
    case 'execute':
      method = 'POST';
      break;
    case 'create':
      method = 'PUT';
      if (!code) {
        throw new Error("Code content must be provided for the 'create' operation.");
      }
      body = JSON.stringify({ code });
      break;
    case 'update':
      method = 'PATCH';
      if (!findReplaceMessage) {
        throw new Error("A find/replace message must be provided for the 'update' operation.");
      }
      body = JSON.stringify({ message: findReplaceMessage });
      break;
    case 'delete':
      method = 'DELETE';
      break;
    default:
      throw new Error('Unsupported operation');
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    ...(body && { body })
  };

  try {
    const response = await fetch(endpoint, options);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Unknown error occurred.');
    }
    return {
      message: result.message,
      data: result.data
    };
  } catch (error) {
    console.error('Error in codeExecutor:', error);
    return {
      message: error.message,
      data: null
    };
  }
}

// Example usage:
(async () => {
  // Read a file:
  const readResult = await codeExecutor({ operation: 'read', filename: 'example.py' });
  console.log('Read Result:', readResult);

  // Execute a file:
  const execResult = await codeExecutor({ operation: 'execute', filename: 'example.jac' });
  console.log('Execute Result:', execResult);

  // Create a new file:
  const createResult = await codeExecutor({ 
    operation: 'create', 
    filename: 'new_script.py', 
    code: 'print("Hello World!")' 
  });
  console.log('Create Result:', createResult);

  // Update an existing file:
  const updateResult = await codeExecutor({
    operation: 'update',
    filename: 'existing_script.py',
    findReplaceMessage: 's/Hello/Hi/g'
  });
  console.log('Update Result:', updateResult);

  // Delete a file:
  const deleteResult = await codeExecutor({ operation: 'delete', filename: 'old_script.jac' });
  console.log('Delete Result:', deleteResult);
})();
```

### OpenAI Function Specification

The plugin also provides an OpenAI function specification for standardized integration:

```json
{
  "name": "JaseciCodeRunner",
  "parameters": {
    "type": "object",
    "required": ["operation", "filename"],
    "properties": {
      "code": {
        "type": "string",
        "description": "The code content for file creation (used with 'create' operation)."
      },
      "filename": {
        "type": "string",
        "description": "The filename to operate on. Must end with '.py' or '.jac'."
      },
      "operation": {
        "enum": ["read", "execute", "create", "update", "delete"],
        "type": "string",
        "description": "The operation to perform."
      },
      "findReplaceMessage": {
        "type": "string",
        "description": "The find/replace message in the format s<delimiter>find<delimiter>replace<delimiter>flags (required for 'update' operation)."
      }
    }
  },
  "returns": {
    "type": "object",
    "properties": {
      "data": {
        "type": "object",
        "description": "Any additional data returned (e.g., file contents, execution stdout/stderr, updated content)."
      },
      "message": {
        "type": "string",
        "description": "A summary message indicating the result of the operation."
      }
    }
  },
  "description": "Performs file operations on code files via the /code/ endpoints."
}
```

## Plugin User Settings

The plugin requires a user setting for the server URL:

```json
[
  {
    "name": "baseUrl",
    "type": "text",
    "label": "Server URL",
    "required": true,
    "description": "The URL for the plugin server"
  }
]
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have suggestions, improvements, or bug fixes. Ensure that any contributions keep the plugin in line with its modular and extensible design.

## License

This project is licensed under the [MIT License](LICENSE).
