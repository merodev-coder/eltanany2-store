import { useState, useEffect } from 'react';
import { User, Package, CreditCard, X, Image as ImageIcon } from 'lucide-react';
import axiosClient from '@/api/apiClient';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  color?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerInfo?: {
    name: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  totalValue: number;
  subtotal?: number;
  shippingCost?: number;
  status: string;
  paymentMethod?: string;
  receiptUrl?: string;
  items: OrderItem[];
  notes?: string;
}

export default function OrdersManagementView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosClient.get('/admin/orders');
        if (response.data.success) {
          setOrders(response.data.data.orders || []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'قيد الانتظار', className: 'bg-amber-100 text-amber-700' },
      approved: { label: 'موافق عليه', className: 'bg-green-100 text-green-700' },
      confirmed: { label: 'مؤكد', className: 'bg-emerald-100 text-emerald-700' },
      processing: { label: 'قيد التجهيز', className: 'bg-indigo-100 text-indigo-700' },
      shipped: { label: 'تم الشحن', className: 'bg-purple-100 text-purple-700' },
      delivered: { label: 'تم التوصيل', className: 'bg-blue-100 text-blue-700' },
      rejected: { label: 'مرفوض', className: 'bg-red-100 text-red-700' },
      cancelled: { label: 'ملغي', className: 'bg-gray-100 text-gray-700' },
    };
    return badges[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  };

  const getPaymentMethodLabel = (method?: string) => {
    const labels: Record<string, string> = {
      vodafone_cash: 'فودافون كاش',
      instapay: 'إنستا باي',
      cash_on_delivery: 'الدفع عند الاستلام',
    };
    return labels[method || ''] || method || '-';
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-card p-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-steel-light border-t-ignition-start rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="font-heading font-bold text-xl text-[#18181B]">إدارة الطلبات</h2>
        <p className="font-body text-sm text-slate mt-1">عرض جميع طلبات العملاء وتفاصيلها</p>
      </div>

      <div className="bg-white shadow-sm rounded-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-steel-light">
                <th className="text-right py-3 px-3 font-body text-sm text-slate font-medium">رقم الطلب</th>
                <th className="text-right py-3 px-3 font-body text-sm text-slate font-medium">اسم العميل</th>
                <th className="text-right py-3 px-3 font-body text-sm text-slate font-medium">السعر الإجمالي</th>
                <th className="text-right py-3 px-3 font-body text-sm text-slate font-medium">التاريخ</th>
                <th className="text-right py-3 px-3 font-body text-sm text-slate font-medium">الحالة</th>
                <th className="text-center py-3 px-3 font-body text-sm text-slate font-medium">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 font-body text-slate">
                    لا توجد طلبات
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-steel-light/50 last:border-0 hover:bg-steel-light/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3 px-3 font-body text-sm font-medium text-[#18181B]">
                      #{order.orderNumber || order._id.slice(-6)}
                    </td>
                    <td className="py-3 px-3 font-body text-sm text-[#18181B]">
                      {order.customerInfo?.name || order.customerName}
                    </td>
                    <td className="py-3 px-3 font-body text-sm text-[#18181B]">
                      {(order.totalValue || 0).toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-3 font-body text-sm text-slate">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-body font-medium ${getStatusBadge(order.status).className}`}
                      >
                        {getStatusBadge(order.status).label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-ignition-start/10 text-ignition-start font-body text-xs font-medium hover:bg-ignition-start/20 transition-colors"
                      >
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-steel-light p-6 flex items-center justify-between z-10">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#18181B]">تفاصيل الطلب #{selectedOrder.orderNumber || selectedOrder._id.slice(-6)}</h3>
                <p className="font-body text-sm text-slate mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg hover:bg-steel-light transition-colors"
              >
                <X className="w-5 h-5 text-slate" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-steel-light/30 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-ignition-start" />
                  <h4 className="font-heading font-bold text-base text-[#18181B]">معلومات العميل</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-body text-xs text-slate mb-1">الاسم الكامل</p>
                    <p className="font-body text-sm font-medium text-[#18181B]">
                      {selectedOrder.customerInfo?.name || selectedOrder.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-slate mb-1">رقم الهاتف</p>
                    <p className="font-body text-sm font-medium text-[#18181B]" dir="ltr">
                      {selectedOrder.customerInfo?.phone || selectedOrder.customerPhone || '-'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-body text-xs text-slate mb-1">عنوان الشحن</p>
                    <p className="font-body text-sm font-medium text-[#18181B]">
                      {selectedOrder.customerInfo?.address || selectedOrder.customerAddress || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-ignition-start" />
                  <h4 className="font-heading font-bold text-base text-[#18181B]">المنتجات المطلوبة</h4>
                </div>
                <div className="bg-white border border-steel-light rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-steel-light/50">
                      <tr>
                        <th className="text-right py-3 px-4 font-body text-xs text-slate font-medium">المنتج</th>
                        <th className="text-center py-3 px-4 font-body text-xs text-slate font-medium">الكمية</th>
                        <th className="text-left py-3 px-4 font-body text-xs text-slate font-medium">السعر</th>
                        <th className="text-left py-3 px-4 font-body text-xs text-slate font-medium">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-steel-light">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-steel-light"
                                />
                              )}
                              <div>
                                <p className="font-body text-sm font-medium text-[#18181B]">{item.name}</p>
                                {item.color && (
                                  <p className="font-body text-xs text-slate">اللون: {item.color}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-steel-light font-body text-sm font-medium text-[#18181B]">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-left font-body text-sm text-[#18181B]">
                            {item.price.toLocaleString()} ج.م
                          </td>
                          <td className="py-3 px-4 text-left font-body text-sm font-medium text-[#18181B]">
                            {(item.price * item.quantity).toLocaleString()} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-steel-light/30">
                      <tr>
                        <td colSpan={3} className="py-3 px-4 font-body text-sm font-medium text-slate text-right">
                          المجموع الفرعي
                        </td>
                        <td className="py-3 px-4 font-body text-sm font-bold text-[#18181B] text-left">
                          {(selectedOrder.subtotal || selectedOrder.totalValue || 0).toLocaleString()} ج.م
                        </td>
                      </tr>
                      {selectedOrder.shippingCost && (
                        <tr>
                          <td colSpan={3} className="py-3 px-4 font-body text-sm font-medium text-slate text-right">
                            رسوم الشحن
                          </td>
                          <td className="py-3 px-4 font-body text-sm font-medium text-[#18181B] text-left">
                            {selectedOrder.shippingCost.toLocaleString()} ج.م
                          </td>
                        </tr>
                      )}
                      <tr className="border-t border-steel-light">
                        <td colSpan={3} className="py-4 px-4 font-body text-sm font-bold text-[#18181B] text-right">
                          الإجمالي النهائي
                        </td>
                        <td className="py-4 px-4 font-heading text-base font-bold text-ignition-start text-left">
                          {selectedOrder.totalValue.toLocaleString()} ج.م
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment & Receipt */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-steel-light/30 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-ignition-start" />
                    <h4 className="font-heading font-bold text-base text-[#18181B]">طريقة الدفع</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-body text-xs text-slate mb-1">طريقة الدفع</p>
                      <p className="font-body text-sm font-medium text-[#18181B]">
                        {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-xs text-slate mb-1">حالة الطلب</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-body font-medium ${getStatusBadge(selectedOrder.status).className}`}
                      >
                        {getStatusBadge(selectedOrder.status).label}
                      </span>
                    </div>
                    {selectedOrder.notes && (
                      <div>
                        <p className="font-body text-xs text-slate mb-1">ملاحظات</p>
                        <p className="font-body text-sm text-[#18181B]">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-steel-light/30 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-ignition-start" />
                    <h4 className="font-heading font-bold text-base text-[#18181B]">إثبات الدفع</h4>
                  </div>
                  {selectedOrder.receiptUrl ? (
                    <div className="rounded-lg overflow-hidden border border-steel-light">
                      <img
                        src={selectedOrder.receiptUrl}
                        alt="إيصال الدفع"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3 bg-white">
                        <a
                          href={selectedOrder.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center font-body text-sm text-ignition-start hover:underline"
                        >
                          فتح الصورة في نافذة جديدة
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 border-2 border-dashed border-steel-light rounded-lg">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-slate mx-auto mb-2" />
                        <p className="font-body text-sm text-slate">لا يوجد إيصال مرفق</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
