sed -i "1i import Preloader from '../components/Preloader.js';" src/pages/Shop.tsx
sed -i '/const \[totalItems, setTotalItems\] = useState(0);/a\
  const [loading, setLoading] = useState(true);' src/pages/Shop.tsx

sed -i '/useEffect(() => {/,/fetch(url)/c\
  useEffect(() => {\
    setLoading(true);\
    let url = `/api/products?page=${page}&limit=9`;\
    if (selectedCategory) url += `&category=${selectedCategory}`;\
    if (selectedBrand) url += `&brand=${selectedBrand}`;\
    if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;\
    if (minPrice > 0) url += `&minPrice=${minPrice}`;\
    if (maxPrice < 15000) url += `&maxPrice=${maxPrice}`;\
    if (sortBy !== "default") url += `&sort=${sortBy}`;\
\
    fetch(url)' src/pages/Shop.tsx

sed -i '/setTotalItems(data.pagination.total || 0);/a\
          setTimeout(() => setLoading(false), 500);' src/pages/Shop.tsx
