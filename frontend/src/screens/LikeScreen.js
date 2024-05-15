import { useEffect, useReducer, useContext } from "react";
import axios from "axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Helmet } from 'react-helmet-async';
import LoadingBox from "../components/LoadingBox";
import Product from "../components/Product";
import MessageBox from "../components/MessageBox";
import { Store } from '../Store';

const reducer = (state, action) => {
    switch (action.type) {
      case "FETCH_REQUEST":
        return { ...state, loading: true };
      case "FETCH_SUCCESS":
        return { ...state, products: action.payload, loading: false };
      case "FETCH_FAIL":
        return { ...state, loading: false, error: action.payload };
    case 'UPDATE_LIKED_STATUS':
        return {
            ...state,
            likedStatus: state.likedStatus.map((likedProduct) =>
            likedProduct._id === action.payload
                ? { ...likedProduct, liked: !likedProduct.liked }
                : likedProduct
            ),
        };
      default:
        return state;
    }
  };

const LikeScreen = () => {
    const [{ loading, error, products }, dispatch] = useReducer(reducer, {
        products: [],
        loading: true,
        error: "",
    });
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart, userInfo } = state;
    useEffect(() => {
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
      }, [userInfo.token]);
  return (
    <div>
      <Helmet>
        <title>A v o n | Likes</title>
      </Helmet>
      <h1>Liked Product</h1>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={12} md={3} className="mb-3">
                <Product product={product} isLike={true}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  )
}

export default LikeScreen
