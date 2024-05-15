import axios from 'axios';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return { ...state, product: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function ProductScreen() {
  let reviewsRef = useRef();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      product: [],
      loading: true,
      error: '',
    });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });

        // Check if the product is liked by the user
        const checkIfLiked = async () => {
          try {
            const response = await axios.get('/api/like', {
              headers: { Authorization: `Bearer ${userInfo.token}` },
            });

            const likedProducts = response.data.map((like) => like.product._id.toString());
            setLiked(likedProducts.includes(result.data._id));
          } catch (error) {
            console.error('Error checking liked products:', error);
          }
        };

        if (userInfo && userInfo.token) {
          checkIfLiked();
        }

      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const addToCartHandler = async () => {
    if (product.variant.length > 0) {
      if(selectedVariant === null) {
          toast.error('Please select a variation.');
          return; 
        }
        
    }
    if(!userInfo) return toast.error('Please login to Add a product to the Cart.');
    // const existItem = cart.cartItems.find((x) => x._id === product._id);
    const existItem = cart.cartItems.find((x) => x._id === product._id && x.variant === selectedVariant);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity, variant: selectedVariant },
    });
    // navigate('/cart');
    toast.success('Added to cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Please enter comment and rating');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, name: userInfo.name },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({
        type: 'CREATE_SUCCESS',
      });
      toast.success('Review submitted successfully');
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: 'REFRESH_PRODUCT', payload: product });
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'CREATE_FAIL' });
    }


  };
  
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleVariantClick = (variant) => {
    setSelectedVariant((prevVariant) => (prevVariant === variant ? null : variant));
  };

  const [liked, setLiked] = useState(false);

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
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Row>
        <Col md={6}>
          <img
            className="img-large"
            src={ selectedImage || product.image}
            alt={product.name}
          ></img>
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h3>{product.name}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
              Price : <span className={product.salePrice > 0 ? 'text-decoration-line-through': ''}>₱ {product.price}</span>
              <span className="text-danger" style={{marginLeft: '15px'}}>{product.salePrice > 0 ?  '₱' + product.salePrice : ''}</span>
            </ListGroup.Item>
            <ListGroup.Item>
              {product.variant.length > 0 && (
                <>
                  <p>Available Variants:</p>
                  {product.variant.map((variant, index) => (
                    <Button
                      key={index}
                      variant={selectedVariant === variant ? 'secondary' : 'primary'}
                      onClick={() => handleVariantClick(variant)}
                    >
                      {variant}
                    </Button>
                  ))}
                  <p>Selected Variant: <span className="text-danger">{selectedVariant}</span></p>
                </>
              )}
            </ListGroup.Item>
            <ListGroup.Item>
              <Row xs={1} md={2} className="g-2">
                {[product.image, ...product.images].map((x) => (
                  <Col key={x}>
                    <Card>
                      <Button
                        className="thumbnail"
                        type="button"
                        variant="light"
                        onClick={() => setSelectedImage(x)}
                      >
                        <Card.Img variant="top" src={x} alt="product" />
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              Description:
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>
                    <span className={product.salePrice > 0 ? 'text-decoration-line-through': ''}>₱ {product.price}</span>
                    <span className="text-danger" style={{marginLeft: '15px'}}>{product.salePrice > 0 ?  '₱' + product.salePrice : ''}</span>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <Badge bg="success">In Stock</Badge>
                      ) : (
                        <Badge bg="danger">Unavailable</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <div className="align-items-center justify-content-between">
                     {product.countInStock > 0 && (
                      <Button onClick={addToCartHandler} variant="primary">
                        Add to Cart
                      </Button>
                      )}
                      <FontAwesomeIcon
                      onClick={handleLike}
                      icon="heart" size="2x" 
                      color={liked ? 'red' : 'black'}
                      style={{ marginLeft: '20px' }} />
                      </div>
                  </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
export default ProductScreen;
