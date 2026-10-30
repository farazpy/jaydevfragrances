sed -i 's/onChange={(e) => setShippingName(e.target.value)}/onChange={(e) => setShippingName(e.target.value)}\n                      autoComplete="name"/g' src/pages/Checkout.tsx

sed -i 's/onChange={(e) => setShippingPhone(e.target.value)}/onChange={(e) => setShippingPhone(e.target.value)}\n                      autoComplete="tel"/g' src/pages/Checkout.tsx

sed -i 's/onChange={(e) => setAddressLine(e.target.value)}/onChange={(e) => setAddressLine(e.target.value)}\n                      autoComplete="street-address"/g' src/pages/Checkout.tsx

sed -i 's/onChange={(e) => setCity(e.target.value)}/onChange={(e) => setCity(e.target.value)}\n                      autoComplete="address-level2"/g' src/pages/Checkout.tsx

sed -i 's/onChange={(e) => setPincode(e.target.value)}/onChange={(e) => setPincode(e.target.value)}\n                      autoComplete="postal-code"/g' src/pages/Checkout.tsx
