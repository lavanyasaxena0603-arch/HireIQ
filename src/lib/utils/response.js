export function successResponse(data = null, message = 'Success') {
  return {
    success: true,
    data,
    message,
    error: null,
  };
}

export function errorResponse(message = 'An error occurred', errorDetails = null) {
  return {
    success: false,
    data: null,
    message,
    error: errorDetails,
  };
}
