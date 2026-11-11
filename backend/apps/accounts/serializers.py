"""
Serializers for User authentication and profile management.
"""

from django.db import IntegrityError, transaction
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, normalize_email_address


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm Password')
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'phone_number', 'password', 'password2')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate password confirmation."""
        attrs['email'] = normalize_email_address(attrs['email'])
        if User.objects.filter(email__iexact=attrs['email']).exists():
            raise serializers.ValidationError(
                {'email': 'A user with this email already exists.'}
            )
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        """Create new user with STUDENT role by default."""
        validated_data.pop('password2')
        
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=validated_data['email'],
            password=validated_data['password'],
                    first_name=validated_data.get('first_name', ''),
                    last_name=validated_data.get('last_name', ''),
                    phone_number=validated_data.get('phone_number', ''),
                    role='STUDENT'
                )
        except IntegrityError:
            if User.objects.filter(email__iexact=validated_data['email']).exists():
                raise serializers.ValidationError(
                    {'email': 'A user with this email already exists.'}
                )
            raise

        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        """Validate credentials."""
        email = normalize_email_address(attrs.get('email', ''))
        password = attrs.get('password')
        
        if email and password:
            account = User.objects.filter(email__iexact=email).first()
            if account and not account.is_active:
                raise serializers.ValidationError('User account is disabled.')

            user = authenticate(
                email=account.email if account else email,
                password=password,
            )
            
            if not user:
                raise serializers.ValidationError('Invalid email or password.')

            if user.is_student and not user.is_verified:
                raise PermissionDenied(
                    'Please verify your email before signing in.'
                )
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include "email" and "password".')


class UserLogoutSerializer(serializers.Serializer):
    """Request body for blacklisting a refresh token."""

    refresh = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'role', 'is_verified', 'date_joined'
        )
        read_only_fields = ('id', 'email', 'role', 'is_verified', 'date_joined')


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone_number')


class EmailVerificationSerializer(serializers.Serializer):
    """Validate a token submitted by the email-verification page."""

    token = serializers.CharField(write_only=True, max_length=128, trim_whitespace=False)


class ResendVerificationSerializer(serializers.Serializer):
    """Validate an address for the verification-email resend endpoint."""

    email = serializers.EmailField()

    def validate_email(self, value):
        return normalize_email_address(value)
