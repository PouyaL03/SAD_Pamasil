from rest_framework import serializers
from .models import User
from email.utils import parseaddr
from rest_framework import serializers
from datetime import date

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=[('customer', 'مشتری'), ('supplier', 'تامین کننده')], required=False)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'date_of_birth',
            'mobile_number', 'national_id', 'email', 'password', 'role'
        ]

    def validate_mobile_number(self, value):
        """
        Validate Iranian mobile number.
        """
        def is_valid_mobile_number(mobile_number):
            return (
                len(mobile_number) == 11 and
                mobile_number.startswith("09") and
                mobile_number.isdigit()
            )

        if not is_valid_mobile_number(value):
            raise serializers.ValidationError("شماره موبایل نامعتبر است. </br>")
        return value
    

    def validate_date_of_birth(self, value):
        """
        Ensure the date of birth is in the past.
        """
        if value >= date.today():
            raise serializers.ValidationError("تاریخ تولد باید در گذشته باشد. </br>")
        return value

    def validate_national_id(self, value):
        """
        Validate the Iranian National ID (کد ملی).
        """
        def is_valid_national_id(national_id):
            if not national_id.isdigit() or len(national_id) != 10:
                return False
            weights = range(10, 1, -1)
            weighted_sum = sum(int(national_id[i]) * weights[i] for i in range(9))
            remainder = weighted_sum % 11
            check_digit = int(national_id[9])
            return (remainder < 2 and check_digit == remainder) or (remainder >= 2 and check_digit == (11 - remainder))

        if not is_valid_national_id(value):
            raise serializers.ValidationError("کد ملی نامعتبر است. </br>")
        return value
    
    def validate_email(self, value):
        """
        Validate that the email is in a valid format with a guaranteed Persian error message.
        """
        # Check if the email is valid using Python's built-in parseaddr
        if "@" not in parseaddr(value)[1]:
            raise serializers.ValidationError("ایمیل نامعتبر است. </br>")

        return value


    def create(self, validated_data):
        role = validated_data.get('role', 'customer')
        user = User.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            date_of_birth=validated_data['date_of_birth'],
            mobile_number=validated_data['mobile_number'],
            national_id=validated_data['national_id'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=role
        )
        return user

from rest_framework import serializers
from django.contrib.auth import get_user_model

# Get the custom user model
User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'mobile_number', 'national_id', 'date_of_birth', 'role']  # Fields to be updated

    def update(self, instance, validated_data):
        # Update the fields with new data
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.mobile_number = validated_data.get('mobile_number', instance.mobile_number)
        instance.national_id = validated_data.get('national_id', instance.national_id)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)

        instance.save()  # Save the updated user profile
        return instance
