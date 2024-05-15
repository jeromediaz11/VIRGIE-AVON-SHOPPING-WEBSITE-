import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { useState } from 'react';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    case 'STATUS_SUCCESS':
      return { ...state, loadingUpdate: true };
    case 'FETCH_ORDERS_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_ORDERS_SUCCESS':
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };
    case 'FETCH_ORDERS_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
export default function OrderListScreen() {

  const [show, setShow] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = (order) => {
    setShow(true);
    setOrderId(order);
  }
  
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (order) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('order deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };  

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleOrderStatus =async (order) => {
    if (window.confirm('Are you sure to update status?')) {
      try {
        dispatch({ type: 'STATUS_SUCCESS' });
        await axios.put(`/api/orders/${order._id}/status`, {
          _id: order._id,
          selectedStatus,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        // Fetch the updated orders
        const { data: updatedOrders } = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        // Dispatch the action to update state with the fetched orders
        dispatch({ type: 'FETCH_ORDERS_SUCCESS', payload: updatedOrders });

        toast.success('order status successfully update');
        handleClose();
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    }
  }

  return (
    <div>
      <Helmet>
        <title>Orders</title>
      </Helmet>
      <h1>Orders</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '100px'}}>ID</th>
              <th style={{ width: '300px'}}>USER</th>
              <th style={{ width: '120px'}}>DATE</th>
              <th style={{ width: '100px'}}>TOTAL</th>
              <th style={{ width: '150px'}}>ORDER STATUS</th>
              <th style={{ width: '300px'}}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toFixed(2)}</td>
                <td><Badge bg="primary">{order.orderStatus}</Badge></td>
                {
                  // <td>{order.totalPrice.toFixed(2)}</td>
                  // <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                }
                <td>
                  <Button
                    type="button"
                    variant="info"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    Details
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => deleteHandler(order)}
                  >
                    Delete
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="warning"
                    onClick={() => handleShow(order)}
                  >
                    Order Status
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select onChange={handleStatusChange}>
            <option value="">Select Status</option>
            <option value="Processing">Processing</option>
            <option value="Shipping">Shipping</option>
            <option value="Delivered">Delivered</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleOrderStatus(orderId)}>Submit</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
