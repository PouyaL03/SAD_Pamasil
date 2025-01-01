from rest_framework import serializers
from .models import User
from email.utils import parseaddr
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'date_of_birth',
            'mobile_number', 'national_id', 'email', 'password'
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
            raise serializers.ValidationError("ایمیل نامعتبر است.")

        return value


    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            date_of_birth=validated_data['date_of_birth'],
            mobile_number=validated_data['mobile_number'],
            national_id=validated_data['national_id'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user