from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Product
from .serializers import ProductSerializer
import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Product
from .serializers import ProductSerializer
import logging

logger = logging.getLogger(__name__) 

class AddProductView(APIView):
    permission_classes = [permissions.AllowAny]  # Require authentication for adding products

    def post(self, request):
        # logger.warning(request.data.Authorization)
        logger.warning(request.data)
        logger.warning(f"User role: {request.user.role}")  # Log user role
        
        if request.user.role != 'supplier':  # Only suppliers can add products
            return Response({"error": "Only suppliers can add products."}, status=status.HTTP_403_FORBIDDEN)

        # Logging the incoming request data to debug
        logger.warning(f"Request data: {request.data}")

        serializer = ProductSerializer(data=request.data, context={'request': request})
        
        # Log serializer data for debugging
        logger.warning(f"Serializer data: {serializer.initial_data}")

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Product added successfully!"}, status=status.HTTP_201_CREATED)
        else:
            # Log serializer errors if the validation fails
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)