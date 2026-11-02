"""
Custom permission classes.
"""

from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow read-only access to everyone.
    Only admins can create, update, or delete.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Allow owners to edit their own objects.
    Others can only read.
    """
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.user == request.user


class IsStudent(permissions.BasePermission):
    """Only allow students."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_student


class IsConsultant(permissions.BasePermission):
    """Only allow consultants."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_consultant


class IsAdminUser(permissions.BasePermission):
    """Only allow admin users."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin
