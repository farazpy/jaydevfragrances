sed -i '64i\
  const handleBuyNow = () => {\
    if (!product || !selectedVariant) return;\
    onAddToCart(product.id, selectedVariant.id, qty);\
    onNavigate("checkout");\
  };\
' src/pages/ProductDetail.tsx
