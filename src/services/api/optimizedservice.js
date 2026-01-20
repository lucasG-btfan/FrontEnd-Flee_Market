import { productService } from './productService';
import { clientService } from './clientservice';
import  orderService  from './orderService';
import { orderDetailService } from './orderDetailsService';
import { categoryService } from './categoryService';
import healthService from './backendHealthService.js';

export const optimizedServices = {
  products: productService,
  clients: clientService,
  orders: orderService,
  orderDetails: orderDetailService,
  categories: categoryService,
  health: healthService,
};

export default optimizedServices;