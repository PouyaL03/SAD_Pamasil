from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import ProductSerializer
from .models import Product

class ProductCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Ensure the user is a supplier
        if request.user.role != 'supplier':
            return Response({"error": "فقط تامین‌کنندگان می‌توانند محصول اضافه کنند."}, status=status.HTTP_403_FORBIDDEN)

        # Validate and create product
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save(supplier=request.user)
            return Response({"message": "محصول با موفقیت اضافه شد.", "product": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
