from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    """Allows access only to users with role=admin or is_superuser."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.role == "admin" or user.is_superuser))


class IsAdminOrReadOnly(BasePermission):
    """Anyone can read (list/retrieve); only admins can write."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (user.role == "admin" or user.is_superuser))
