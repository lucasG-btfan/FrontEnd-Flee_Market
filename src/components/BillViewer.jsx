import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Table, Badge, Button, Alert, Row, Col } from 'react-bootstrap';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import billService from '../services/api/billService';
import { PaymentType } from '../enums';

const BillViewer = () => {
  const { id, order_id } = useParams(); //por los id que puede recibir bill
  const navigate = useNavigate();
  const location = useLocation();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);

        let billData;

        if (order_id) {
          // Si hay un order_id en la URL, obtener la factura por order_id
          billData = await billService.getBillByOrderId(order_id);
        } else if (id) {
          // Si hay un id en la URL, obtener la factura por id
          billData = await billService.getBillById(id);
        } else {
          throw new Error("No se proporcionó un ID de factura u orden");
        }

        setBill(billData);
      } catch (err) {
        setError('Error al cargar la factura');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id, order_id])


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPaymentTypeText = (type) => {
    const types = {
      [PaymentType.CASH]: 'Efectivo',
      [PaymentType.CARD]: 'Tarjeta de Crédito',
      [PaymentType.DEBIT]: 'Tarjeta de Débito',
      [PaymentType.CREDIT]: 'Crédito',
      [PaymentType.BANK_TRANSFER]: 'Transferencia Bancaria'
    };
    return types[type] || `Desconocido (${type})`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert('Función de descarga PDF en desarrollo');
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando factura...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !bill) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || 'Factura no encontrada'}</p>
          <Button variant="outline-danger" onClick={() => navigate('/orders')}>
            Volver a Órdenes
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5" id="bill-content">
      <Button 
        variant="outline-secondary" 
        className="mb-4"
        onClick={() => navigate('/orders')}
      >
        <ArrowLeft size={20} /> Volver a Órdenes
      </Button>

      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <Row className="align-items-center">
            <Col>
              <h2 className="mb-0">Factura #{bill.bill_number}</h2>
              <small className="text-muted">Fecha: {formatDate(bill.date)}</small>
            </Col>
            <Col className="text-end">
              <Button variant="outline-primary" className="me-2" onClick={handlePrint}>
                <Printer size={18} /> Imprimir
              </Button>
              <Button variant="outline-success" onClick={handleDownloadPDF}>
                <Download size={18} /> Descargar PDF
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Información del Cliente */}
          <Row className="mb-4">
            <Col md={6}>
              <h5>Información del Cliente</h5>
              <div className="mb-2">
                <strong>ID Cliente:</strong> {bill.client_id_key}
              </div>
              {/* Aquí podrías agregar más datos del cliente si los tienes */}
            </Col>
            <Col md={6} className="text-md-end">
              <h5>Detalles de Pago</h5>
              <div className="mb-2">
                <strong>Método de Pago:</strong>{' '}
                <Badge bg="info" className="ms-2">
                  {getPaymentTypeText(bill.payment_type)}
                </Badge>

              </div>
              <div className="mb-2">
                <strong>Orden #:</strong> {bill.order_id_key}
              </div>
            </Col>
          </Row>

          {/* Resumen de la Factura */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Resumen</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <p className="mb-1">
                    <strong>Subtotal:</strong> {formatCurrency(bill.total + (bill.discount || 0))}
                  </p>
                  {bill.discount > 0 && (
                    <p className="mb-1 text-danger">
                      <strong>Descuento:</strong> -{formatCurrency(bill.discount)}
                    </p>
                  )}
                  <h4 className="mt-3">
                    <strong>Total:</strong> {formatCurrency(bill.total)}
                  </h4>
                </Col>
                <Col md={4} className="text-md-end">
                  <Badge bg="success" className="fs-5 p-2">
                    {formatCurrency(bill.total)}
                  </Badge>
                  <p className="text-muted mt-2">
                    Factura generada automáticamente
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Aquí podrías agregar los productos de la orden si los tienes */}
          {bill.order_details && bill.order_details.length > 0 ? (
            <div className="mt-4">
              <h5>Productos</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.order_details.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_name || `Producto #${item.product_id}`}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unit_price)}</td>
                      <td>{formatCurrency(item.quantity * item.unit_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">
              Los detalles de los productos se cargarán próximamente.
            </Alert>
          )}
        </Card.Body>

        <Card.Footer className="bg-light text-center">
          <small className="text-muted">
            Gracias por su compra. Para consultas, contacte a soporte@tienda.com
          </small>
        </Card.Footer>
      </Card>

      <style>{`
        @media print {
          .btn, nav, footer {
            display: none !important;
          }
          #bill-content {
            margin: 0;
            padding: 0;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default BillViewer;