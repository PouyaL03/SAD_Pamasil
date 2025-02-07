from rest_framework import serializers
from .models import User
from email.utils import parseaddr
from datetime import date
import re  # for additional password validation if needed

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        error_messages={
            'min_length': 'رمز عبور باید حداقل 8 کاراکتر باشد.',
            'blank': 'این فیلد نمی‌تواند خالی باشد.'
        }
    )
    # Add the password confirmation field
    password2 = serializers.CharField(
        write_only=True,
        label="تکرار رمز عبور",
        error_messages={
            'blank': 'این فیلد نمی‌تواند خالی باشد.'
        }
    )
    role = serializers.ChoiceField(
        choices=[('customer', 'مشتری'), ('supplier', 'تامین کننده')],
        required=False
    )

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'date_of_birth',
            'mobile_number', 'national_id', 'email', 'password', 'password2', 'role'
        ]

    def validate(self, data):
        """
        Ensure that the password and its confirmation match.
        """
        password = data.get('password')
        password2 = data.get('password2')
        if password != password2:
            raise serializers.ValidationError({
                "password2": "رمز عبور و تکرار رمز عبور باید یکسان باشند."
            })
        return data

    def validate_password(self, value):
        """
        Validate that the password contains at least one uppercase letter,
        one digit, and one special character from the set . * @ # $ %
        """
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("رمز عبور باید حداقل یک حرف بزرگ داشته باشد.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("رمز عبور باید حداقل یک عدد داشته باشد.")
        if not re.search(r'[.*@#$%]', value):
            raise serializers.ValidationError("رمز عبور باید حداقل یکی از کاراکترهای ویژه (.*, @, #, $, %) داشته باشد.")
        return value

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
        if "@" not in parseaddr(value)[1]:
            raise serializers.ValidationError("ایمیل نامعتبر است. </br>")
        return value

    def create(self, validated_data):
        # Remove the confirmation field before creating the user.
        validated_data.pop('password2', None)
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

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'mobile_number', 'national_id', 'date_of_birth', 'role']

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.mobile_number = validated_data.get('mobile_number', instance.mobile_number)
        instance.national_id = validated_data.get('national_id', instance.national_id)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
        instance.save()
        return instance
