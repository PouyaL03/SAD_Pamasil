from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'date_of_birth',
            'mobile_number', 'national_id', 'email', 'password'
        ]
        extra_kwargs = {"password": {"write_only": True}}

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
