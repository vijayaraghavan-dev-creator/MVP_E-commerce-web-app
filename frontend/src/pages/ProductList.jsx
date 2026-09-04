import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    api.get("/categories/").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (search) params.search = search;
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;

    api.get("/products/", { params })
      .then((res) => {
        const data = res.data;
        setProducts(data.results || data);
        setCount(data.count ?? (data.results || data).length);
      })
      .finally(() => setLoading(false));
  }, [search, category, sort, minPrice, maxPrice, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const totalPages = Math.max(1, Math.ceil(count / 12));

  return (
    <div className="container section">
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>
          {search ? `Results for "${search}"` : category ? category.replace(/-/g, " ") : "All Products"}
          {" "}<span style={{ color: "#6b7280", fontWeight: 400, fontSize: 14 }}>({count} items)</span>
        </h2>
        <select value={sort} onChange={(e) => updateParam("sort", e.target.value)}>
          <option value="">Sort: Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="catalog-layout">
        <aside className="filters">
          <h3>Category</h3>
          <label>
            <input
              type="radio"
              name="cat"
              checked={category === ""}
              onChange={() => updateParam("category", "")}
            /> All
          </label>
          {categories.map((c) => (
            <label key={c.id}>
              <input
                type="radio"
                name="cat"
                checked={category === c.slug}
                onChange={() => updateParam("category", c.slug)}
              /> {c.name}
            </label>
          ))}

          <h3 style={{ marginTop: 18 }}>Price Range</h3>
          <label>Min
            <input
              type="number"
              defaultValue={minPrice}
              onBlur={(e) => updateParam("min_price", e.target.value)}
              placeholder="$0"
            />
          </label>
          <label>Max
            <input
              type="number"
              defaultValue={maxPrice}
              onBlur={(e) => updateParam("max_price", e.target.value)}
              placeholder="Any"
            />
          </label>
        </aside>

        <div>
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">No products found. Try adjusting your filters.</div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={p === page ? "active" : ""}
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.set("page", p);
                        setSearchParams(next);
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
