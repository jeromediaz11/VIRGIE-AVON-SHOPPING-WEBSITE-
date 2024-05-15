import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useContext, useEffect, useState, useReducer } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return { ...state, products: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function Product(props) {
  const { product, isLike } = props;
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
      products: [],
      loading: true,
      error: "",
  });
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const {
    cart: { cartItems },
  } = state;
  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
    toast.success('Added to cart');
  };

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // Update the liked state when the component mounts or when isLike changes
    setLiked(isLike);
    
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await axios.get("/api/like/product", {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: err.message });
      }
    };
    fetchData();
  }, [isLike]);

  const handleLike = async () => {
    if(!userInfo) return toast.error('Please login to like this product.');
    try {
      // Toggle the liked state when the icon is clicked
      setLiked(!liked);
      const productId = product._id;
      // Make a request to the server to update the like status
      await axios.post('/api/like', { productId },
      {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      // dispatch({ type: "FETCH_REQUEST" });
      // // Dispatch an action to update the liked status in the state
      // ctxDispatch({ type: 'UPDATE_LIKED_STATUS', payload: productId });
      window.location.reload();
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  return (
    <Card className='shadow'>
      <Link to={`/product/${product.slug}`}>
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
        />
      </Link>
      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={product.name}>
            {product.name}</Card.Title>
        </Link>
        <Card.Text>
          <span class={product.salePrice > 0 ? 'text-decoration-line-through': ''}>₱ {product.price}</span>
          <span class="text-danger" style={{marginLeft: '25px'}}>{product.salePrice > 0 ?  '₱' + product.salePrice : ''}</span>
        </Card.Text>
        {product.countInStock === 0 ? (
          <Button variant="light" disabled>
            Out of stock
          </Button>
        ) : (
          <>

          {isLike ? (
            <FontAwesomeIcon
            onClick={handleLike}
            icon="heart" size="2x" 
            color={liked ? 'red' : 'black'}
            style={{ marginLeft: '240px'}} />
            ) : ''}
            </>
          
        )}
      </Card.Body>
    </Card>
  );
}
export default Product;
