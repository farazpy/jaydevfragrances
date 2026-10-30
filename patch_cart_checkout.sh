sed -i 's/item\.image/item.primary_image/g' src/pages/Cart.tsx
sed -i 's/item\.name/item.product_name/g' src/pages/Cart.tsx
sed -i 's/item\.slug/item.product_slug/g' src/pages/Cart.tsx

sed -i 's/item\.image/item.primary_image/g' src/pages/Checkout.tsx
sed -i 's/item\.name/item.product_name/g' src/pages/Checkout.tsx
sed -i 's/item\.slug/item.product_slug/g' src/pages/Checkout.tsx
