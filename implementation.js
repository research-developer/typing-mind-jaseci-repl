/**
 * JaseciCodeRunner - Performs a code file operation (read, execute, create, update, delete)
 * by routing to the corresponding backend endpoint.
 *
 * @param {Object} params - The parameters for the operation.
 * @param {("read"|"execute"|"create"|"update"|"delete")} params.operation - The file operation to perform.
 * @param {string} params.filename - The filename to operate on (must end with .py or .jac).
 * @param {string} [params.code] - The code content (for create).
 * @param {string} [params.findReplaceMessage] - The find/replace message (for update).
 * @param {string} [baseURL] - The base URL for the API (default: '/code').
 *
 * @returns {Promise<Object>} - An object with a 'message' and 'data' field.
 */
async function JaseciCodeRunner(params, userSettings) {
  // Determine endpoint and HTTP method based on operation
  const baseUrl = userSettings.baseUrl;
  const { operation, filename, code, findReplaceMessage } = params;
  let endpoint = `${baseUrl}/code/${filename}`;
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
      // For creation, code content is required.
      if (!code) {
        throw new Error("Code content must be provided for the 'create' operation.");
      }
      body = JSON.stringify({ code });
      break;
    case 'update':
      method = 'PATCH';
      // For updating, a find/replace message is required.
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

  // Setup fetch options
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    // Only include body for PUT, PATCH and POST operations that require a payload.
    ...(body && { body }),
  };

  try {
    const response = await fetch(endpoint, options);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Unknown error occurred.');
    }
    return {
      message: result.message,
      data: result.responseObject,
    };
  } catch (error) {
    console.error('Error in codeExecutor:', error);
    return {
      message: error.message,
      data: null,
    };
  }
}

/* Example usage:
(async () => {
  // Read file example:
  const readResult = await codeExecutor({ operation: 'read', filename: 'example.py' });
  console.log(readResult);

  // Execute file example:
  const execResult = await codeExecutor({ operation: 'execute', filename: 'example.jac' });
  console.log(execResult);

  // Create a new file:
  const createResult = await codeExecutor({ 
    operation: 'create', 
    filename: 'new_script.py', 
    code: 'print("Hello World!")' 
  });
  console.log(createResult);

  // Update an existing file:
  const updateResult = await codeExecutor({
    operation: 'update',
    filename: 'existing_script.py',
    findReplaceMessage: 's/Hello/Hi/g'
  });
  console.log(updateResult);

  // Delete a file:
  const deleteResult = await codeExecutor({ operation: 'delete', filename: 'old_script.jac' });
  console.log(deleteResult);
})();
*/

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { JaseciCodeRunner };
} else {
  window.JaseciCodeRunner = JaseciCodeRunner;
}
