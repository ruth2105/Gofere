"""
Custom exception handlers for DRF API responses.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that formats all exceptions consistently.
    
    Returns responses in the format:
    {
        "error": "Error message",
        "details": {...},  # Optional detailed error information
        "status_code": 400
    }
    """
    # Call DRF's default exception handler first to get the standard error response
    response = exception_handler(exc, context)
    
    if response is not None:
        # Format the error response
        custom_response_data = {
            'error': 'An error occurred',
            'status_code': response.status_code
        }
        
        # Extract error message
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_response_data['error'] = response.data['detail']
            else:
                custom_response_data['error'] = str(response.data)
                custom_response_data['details'] = response.data
        elif isinstance(response.data, list):
            custom_response_data['error'] = response.data[0] if response.data else 'An error occurred'
        else:
            custom_response_data['error'] = str(response.data)
        
        response.data = custom_response_data
    
    return response
