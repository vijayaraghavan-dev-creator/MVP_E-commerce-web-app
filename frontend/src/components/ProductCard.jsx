import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price);
  return (
    <div className="product-card">
      <Link to={`/products/${product.slug}`}>
        <img src={product.image_url || "https://via.placeholder.com/300"} alt={product.name} />
      </Link>
      <div className="product-card-body">
        <Link to={`/products/${product.slug}`}>
          <div className="product-name">{product.name}</div>
        </Link>
        <div className="rating">★ {product.rating}</div>
        <div className="product-price-row">
          <span className="price">${Number(product.effective_price ?? product.price).toFixed(2)}</span>
          {hasDiscount && <span className="price-strike">${Number(product.price).toFixed(2)}</span>}
        </div>
        {product.stock_quantity === 0 ? (
          <span className="out-of-stock">Out of stock</span>
        ) : product.stock_quantity <= 5 ? (
          <span className="stock-warning">Only {product.stock_quantity} left</span>
        ) : null}
      </div>
    </div>
  );
}
