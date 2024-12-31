export default function handler(req, res) {
    const products = [
      { id: 1, name: 'Product 1', description: 'Description for product 1', price: 29.99, image: 'https://via.placeholder.com/150' },
      { id: 2, name: 'Product 2', description: 'Description for product 2', price: 39.99, image: 'https://via.placeholder.com/150' },
      { id: 3, name: 'Product 3', description: 'Description for product 3', price: 49.99, image: 'https://via.placeholder.com/150' },
    ];
  
    res.status(200).json(products);
}