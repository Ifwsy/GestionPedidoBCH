import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  Eye, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Order } from '../types';
import OrderForm from '../components/OrderForm';

const mockOrders: Order[] = [
  {
    _id: '1',
    orderNumber: 'ORD-001',
    supplier: 'MINUTO VERDE',
    status: 'pending',
    items: [
      {
        productId: '1',
        name: 'Papas Fritas 7MM',
        quantity: 10,
        price: 5000,
        subtotal: 50000
      }
    ],
    total: 50000,
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
    deliveryAddress: 'Av. Camilo Henríquez 3692',
    paymentMethod: 'Transferencia',
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      }
    ]
  }
];

const statusSequence = ['pending', 'processing', 'on_the_way'];
const finalStatuses = ['delivered', 'delayed'];

const statusOptions = [
  { value: 'pending', label: 'Pendiente', color: 'bg-gray-100 text-gray-800' },
  { value: 'processing', label: 'En Preparación', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'on_the_way', label: 'En Camino', color: 'bg-blue-100 text-blue-800' },
  { value: 'delivered', label: 'Entregado', color: 'bg-green-100 text-green-800' },
  { value: 'delayed', label: 'Atrasado', color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-gray-100 text-gray-800' }
];

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    // Update status every 2 minutes
    const interval = setInterval(() => {
      setOrders(currentOrders => 
        currentOrders.map(order => {
          if (finalStatuses.includes(order.status)) return order;

          const currentIndex = statusSequence.indexOf(order.status);
          if (currentIndex === statusSequence.length - 1) {
            // Randomly choose between delivered and delayed
            const finalStatus = Math.random() > 0.7 ? 'delayed' : 'delivered';
            return {
              ...order,
              status: finalStatus,
              statusHistory: [
                ...order.statusHistory,
                {
                  status: finalStatus,
                  timestamp: new Date().toISOString()
                }
              ]
            };
          }

          const nextStatus = statusSequence[currentIndex + 1];
          return {
            ...order,
            status: nextStatus,
            statusHistory: [
              ...order.statusHistory,
              {
                status: nextStatus,
                timestamp: new Date().toISOString()
              }
            ]
          };
        })
      );
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'processing':
      case 'on_the_way':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'delayed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.label || status;
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleSaveOrder = (order: Omit<Order, '_id'>) => {
    const newOrder = {
      ...order,
      _id: Date.now().toString(),
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedOrder) return;

    const updatedOrder = {
      ...selectedOrder,
      status: newStatus,
      statusHistory: [
        ...selectedOrder.statusHistory,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          comment: `Estado cambiado manualmente a ${getStatusText(newStatus)}`
        }
      ]
    };

    setOrders(prev => prev.map(order => 
      order._id === selectedOrder._id ? updatedOrder : order
    ));
    setSelectedOrder(updatedOrder);
  };

  const getLastOrderNumber = () => {
    if (orders.length === 0) return null;
    return orders[0].orderNumber;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 transition-colors"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Pedido
        </button>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nº Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.supplier}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{getStatusText(order.status)}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${order.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="text-red-600 hover:text-red-900 flex items-center transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalle */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Pedido {selectedOrder.orderNumber}
                </h2>
                <p className="text-sm text-gray-500">
                  Creado el {format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Información del Pedido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Proveedor</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.supplier}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Dirección de Entrega</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.deliveryAddress}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Método de Pago</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedOrder.paymentMethod}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Estado Actual</h3>
                  <div className="space-y-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1">{getStatusText(selectedOrder.status)}</span>
                    </span>
                    
                    {/* Botones para cambiar estado */}
                    <div className="flex flex-wrap gap-2">
                      {statusOptions
                        .filter(option => option.value !== selectedOrder.status)
                        .map(option => (
                          <button
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            {option.label}
                          </button>
                        ))
                      }
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Entrega Estimada</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(selectedOrder.estimatedDelivery), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de Productos */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Productos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.subtotal.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${selectedOrder.total.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Historial de Estados */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Estados</h3>
              <div className="space-y-4">
                {selectedOrder.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start border-l-2 border-gray-200 pl-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getStatusText(history.status)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(history.timestamp), 'dd/MM/yyyy HH:mm')}
                      </p>
                      {history.comment && (
                        <p className="mt-1 text-sm text-gray-500">{history.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas */}
            {selectedOrder.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Notas</h3>
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Nuevo Pedido */}
      <OrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveOrder}
        lastOrderNumber={getLastOrderNumber()}
      />
    </div>
  );
};

export default Orders;